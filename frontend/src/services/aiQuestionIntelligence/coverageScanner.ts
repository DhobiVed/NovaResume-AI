import type { BankQuestion } from '../../types/careerConnect';
import type { TopicCoverageItem, KnowledgeBaseCoverageReport, CoverageStatus } from './types';
import { getAllKnowledgeBaseTaxonomyTopics, resolveCanonicalTaxonomy, canonicalKey } from './canonicalTaxonomy';

/**
 * Question Bank Coverage Scanner
 * Inspects every Domain -> Subject/Skill -> Topic in the Knowledge Base
 * and produces deterministic coverage audits.
 */
export class QuestionBankCoverageScanner {
  /**
   * Scans the entire Knowledge Base against the provided bank questions pool.
   */
  public static scanEntireKnowledgeBase(
    allQuestions: BankQuestion[],
    targetCountPerTopic: number = 15
  ): KnowledgeBaseCoverageReport {
    const allTaxonomyTopics = getAllKnowledgeBaseTaxonomyTopics();
    const topicResults: TopicCoverageItem[] = [];

    let healthyCount = 0;
    let readyCount = 0;
    let lowCount = 0;
    let missingCount = 0;
    let totalVerified = 0;

    for (const item of allTaxonomyTopics) {
      const identity = resolveCanonicalTaxonomy(item.subjectId, item.topicId, item.topicTitle);
      const subKey = canonicalKey(identity.subjectId);
      const topKey = canonicalKey(identity.topicId);

      // Deterministic question matching for this exact canonical topic
      const matchingQuestions = allQuestions.filter(q => {
        const qSub = canonicalKey(q.subjectId || q.skillId || q.programmingLanguage);
        const qTop = canonicalKey(q.topicId || q.topic || q.topicName);

        // Subject match
        const subjectMatches = qSub === subKey ||
                               qSub === canonicalKey(item.subjectId) ||
                               qSub === canonicalKey(item.subjectName) ||
                               qSub === canonicalKey(item.skillId);
        if (!subjectMatches) return false;

        // Topic match (exact or canonical)
        return qTop === topKey ||
               qTop === canonicalKey(item.topicId) ||
               qTop === canonicalKey(item.topicTitle);
      });

      const verified = matchingQuestions.filter(q => q.verified === true || q.status === 'VERIFIED');
      const drafts = matchingQuestions.filter(q => q.status === 'DRAFT');
      const reviewReq = matchingQuestions.filter(q => q.status === 'REVIEW_REQUIRED');
      const rejected = matchingQuestions.filter(q => q.status === 'REJECTED');
      const legacy = matchingQuestions.filter(q => !q.sourceType || q.sourceType === 'legacy');

      const verifiedCount = verified.length;
      totalVerified += verifiedCount;

      let status: CoverageStatus = 'MISSING';
      if (verifiedCount >= targetCountPerTopic) {
        status = 'HEALTHY';
        healthyCount++;
      } else if (verifiedCount >= 10) {
        status = 'READY';
        readyCount++;
      } else if (verifiedCount > 0) {
        status = 'LOW';
        lowCount++;
      } else {
        status = 'MISSING';
        missingCount++;
      }

      topicResults.push({
        domainId: identity.domainId,
        domainName: identity.domainName,
        subjectId: identity.subjectId,
        subjectName: identity.subjectName,
        skillId: identity.skillId,
        skillName: identity.skillName,
        moduleId: item.moduleId,
        moduleName: item.moduleName,
        topicId: identity.topicId,
        topicName: item.topicTitle,
        totalQuestions: matchingQuestions.length,
        verifiedQuestions: verifiedCount,
        draftQuestions: drafts.length,
        reviewRequired: reviewReq.length,
        rejectedQuestions: rejected.length,
        legacyQuestions: legacy.length,
        status,
        targetCount: targetCountPerTopic,
        isSufficientForTest: verifiedCount >= 10
      });
    }

    return {
      scannedAt: new Date().toISOString(),
      totalTopicsScanned: topicResults.length,
      healthyTopicsCount: healthyCount,
      readyTopicsCount: readyCount,
      lowTopicsCount: lowCount,
      missingTopicsCount: missingCount,
      totalVerifiedQuestions: totalVerified,
      topics: topicResults,
      jobsCreatedCount: 0
    };
  }

  /**
   * Returns all topics that are below the required threshold (<10 for usability or <15 for target)
   */
  public static getTopicsNeedingReplenishment(
    report: KnowledgeBaseCoverageReport,
    minThreshold: number = 10
  ): TopicCoverageItem[] {
    return report.topics.filter(t => t.verifiedQuestions < minThreshold);
  }

  /**
   * Audits coverage for a single topic
   */
  public static auditSingleTopicCoverage(
    subjectId: string,
    topicId: string,
    allQuestions: BankQuestion[],
    topicTitle?: string,
    targetCount: number = 15
  ): TopicCoverageItem {
    const identity = resolveCanonicalTaxonomy(subjectId, topicId, topicTitle);
    const subKey = canonicalKey(identity.subjectId);
    const topKey = canonicalKey(identity.topicId);

    const matchingQuestions = allQuestions.filter(q => {
      const qSub = canonicalKey(q.subjectId || q.skillId || q.programmingLanguage);
      const qTop = canonicalKey(q.topicId || q.topic || q.topicName);

      const subjectMatches = qSub === subKey ||
                             qSub === canonicalKey(subjectId) ||
                             qSub === canonicalKey(identity.skillName);
      if (!subjectMatches) return false;

      return qTop === topKey ||
             qTop === canonicalKey(topicId) ||
             (topicTitle ? qTop === canonicalKey(topicTitle) : false);
    });

    const verified = matchingQuestions.filter(q => q.verified === true || q.status === 'VERIFIED');
    const drafts = matchingQuestions.filter(q => q.status === 'DRAFT');
    const reviewReq = matchingQuestions.filter(q => q.status === 'REVIEW_REQUIRED');
    const rejected = matchingQuestions.filter(q => q.status === 'REJECTED');
    const legacy = matchingQuestions.filter(q => !q.sourceType || q.sourceType === 'legacy');

    const verifiedCount = verified.length;

    let status: CoverageStatus = 'MISSING';
    if (verifiedCount >= targetCount) {
      status = 'HEALTHY';
    } else if (verifiedCount >= 10) {
      status = 'READY';
    } else if (verifiedCount > 0) {
      status = 'LOW';
    } else {
      status = 'MISSING';
    }

    return {
      domainId: identity.domainId,
      domainName: identity.domainName,
      subjectId: identity.subjectId,
      subjectName: identity.subjectName,
      skillId: identity.skillId,
      skillName: identity.skillName,
      moduleId: 'general',
      moduleName: 'General Module',
      topicId: identity.topicId,
      topicName: identity.topicName,
      totalQuestions: matchingQuestions.length,
      verifiedQuestions: verifiedCount,
      draftQuestions: drafts.length,
      reviewRequired: reviewReq.length,
      rejectedQuestions: rejected.length,
      legacyQuestions: legacy.length,
      status,
      targetCount,
      isSufficientForTest: verifiedCount >= 10
    };
  }
}
