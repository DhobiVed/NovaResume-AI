import type { BankQuestion } from '../../types/careerConnect';
import type { ReplenishmentJob } from './types';
import { createTopicBlueprint } from './blueprintEngine';
import { runQualityGate } from './qualityGate';
import { auditTopicQuestionHealth } from './healthMonitor';
import { providerRegistry } from './providers/providerAdapter';

/**
 * Autonomous Question Bank Replenishment Engine
 * Identifies coverage deficits and safely generates, validates, and incorporates verified questions.
 */
export async function replenishTopicQuestionPool(
  subjectId: string,
  topicId: string,
  existingPool: BankQuestion[],
  targetVerifiedCount: number = 15,
  topicTitle?: string
): Promise<{
  newVerifiedQuestions: BankQuestion[];
  job: ReplenishmentJob;
}> {
  const health = auditTopicQuestionHealth(subjectId, topicId, existingPool, topicTitle);
  const needed = Math.max(0, targetVerifiedCount - health.verifiedCount);
  const blueprint = createTopicBlueprint(subjectId, topicId, topicTitle);
  const provider = providerRegistry.getActiveProvider();

  const job: ReplenishmentJob = {
    jobId: `JOB-${subjectId.toUpperCase()}-${topicId.toUpperCase()}-${Date.now()}`,
    domainId: blueprint.canonicalIdentity.domainId,
    subjectId: blueprint.canonicalIdentity.subjectId,
    skillId: blueprint.canonicalIdentity.skillId,
    topicId: blueprint.canonicalIdentity.topicId,
    targetCount: targetVerifiedCount,
    currentVerifiedCount: health.verifiedCount,
    status: needed === 0 ? 'COMPLETED' : 'QUEUED',
    provider: provider.providerId,
    attempts: 1,
    generatedCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    createdAt: new Date().toISOString(),
    completedAt: needed === 0 ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString()
  };

  if (needed === 0) {
    return { newVerifiedQuestions: [], job };
  }

  job.status = 'GENERATING';
  job.updatedAt = new Date().toISOString();

  // Generate 1.5x candidates to compensate for potential quality-gate rejections
  const candidateCount = Math.min(needed * 2, 20);
  const rawCandidates = await provider.generateCandidateQuestions(blueprint, candidateCount);
  job.generatedCount = rawCandidates.length;

  job.status = 'VALIDATING';
  job.updatedAt = new Date().toISOString();
  const newVerifiedQuestions: BankQuestion[] = [];
  const currentWorkingPool = [...existingPool];

  for (const candidate of rawCandidates) {
    // 15-Point Quality Gate
    const gateResult = runQualityGate(candidate, blueprint, currentWorkingPool);

    if (gateResult.passed && gateResult.assignedStatus === 'VERIFIED') {
      const verifiedQuestion: BankQuestion = {
        id: candidate.id || `VERIFIED-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        domainId: blueprint.canonicalIdentity.domainId,
        domainName: blueprint.canonicalIdentity.domainName,
        skillId: blueprint.canonicalIdentity.skillId,
        skillName: blueprint.canonicalIdentity.skillName,
        subjectId: blueprint.canonicalIdentity.subjectId,
        programmingLanguage: blueprint.canonicalIdentity.skillName,
        topicId: blueprint.canonicalIdentity.topicId,
        topicName: blueprint.canonicalIdentity.topicName,
        topic: blueprint.canonicalIdentity.topicName,
        subtopic: candidate.subtopic || blueprint.coreConcepts[0],
        difficulty: candidate.difficulty || 'Medium',
        questionType: candidate.questionType || 'code_output',
        practicalType: candidate.practicalType || 'debugging',
        question: candidate.question!,
        codeSnippet: candidate.codeSnippet || null,
        options: candidate.options!,
        correctIndex: candidate.correctIndex!,
        correctAnswer: candidate.correctAnswer || candidate.options![candidate.correctIndex!],
        explanation: candidate.explanation!,
        learningObjective: candidate.learningObjective || blueprint.learningObjectives[0],
        marks: candidate.marks || 1,
        negativeMarks: 0,
        status: 'VERIFIED',
        verified: true,
        qualityScore: gateResult.score,
        createdAt: new Date().toISOString(),
        sourceType: 'ai_generated',
        generatorModel: provider.providerId,
        reviewModel: 'QualityGate-v1'
      };

      newVerifiedQuestions.push(verifiedQuestion);
      currentWorkingPool.push(verifiedQuestion);
      job.verifiedCount++;

      if (health.verifiedCount + newVerifiedQuestions.length >= targetVerifiedCount) {
        break;
      }
    } else {
      job.rejectedCount++;
    }
  }

  job.status = 'COMPLETED';
  job.completedAt = new Date().toISOString();
  job.updatedAt = new Date().toISOString();

  return {
    newVerifiedQuestions,
    job
  };
}

/**
 * Executes batch replenishment across multiple deficit topics
 */
export async function executeBatchReplenishment(
  topicsToReplenish: Array<{ subjectId: string; topicId: string; topicName?: string; targetCount?: number }>,
  existingPool: BankQuestion[],
  onProgress?: (completed: number, total: number) => void
): Promise<{
  allNewVerified: BankQuestion[];
  jobs: ReplenishmentJob[];
}> {
  const allNewVerified: BankQuestion[] = [];
  const jobs: ReplenishmentJob[] = [];
  const currentPool = [...existingPool];

  for (let i = 0; i < topicsToReplenish.length; i++) {
    const item = topicsToReplenish[i];
    try {
      const result = await replenishTopicQuestionPool(
        item.subjectId,
        item.topicId,
        currentPool,
        item.targetCount || 15,
        item.topicName
      );

      jobs.push(result.job);
      if (result.newVerifiedQuestions.length > 0) {
        allNewVerified.push(...result.newVerifiedQuestions);
        currentPool.push(...result.newVerifiedQuestions);
      }
    } catch (err: any) {
      jobs.push({
        jobId: `JOB-ERR-${item.subjectId}-${item.topicId}-${Date.now()}`,
        subjectId: item.subjectId,
        topicId: item.topicId,
        targetCount: item.targetCount || 15,
        status: 'FAILED',
        generatedCount: 0,
        verifiedCount: 0,
        rejectedCount: 0,
        createdAt: new Date().toISOString(),
        error: err?.message || 'Unknown batch error'
      });
    }

    if (onProgress) {
      onProgress(i + 1, topicsToReplenish.length);
    }
  }

  return {
    allNewVerified,
    jobs
  };
}
