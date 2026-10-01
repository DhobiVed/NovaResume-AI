import type { BankQuestion } from '../../types/careerConnect';
import type { QuestionHealthReport } from './types';
import { resolveCanonicalTaxonomy, canonicalKey } from './canonicalTaxonomy';

/**
 * Question Bank Health & Coverage Monitor
 * Audits question density, difficulty balance, and practical ratios.
 */
export function auditTopicQuestionHealth(
  subjectId: string,
  topicId: string,
  questionsPool: BankQuestion[],
  topicTitle?: string
): QuestionHealthReport {
  const identity = resolveCanonicalTaxonomy(subjectId, topicId, topicTitle);
  const targetTopicKey = canonicalKey(identity.topicId);

  // Match questions strictly for this topic
  const matching = questionsPool.filter(q => {
    const qTopId = canonicalKey(q.topicId);
    const qTopic = canonicalKey(q.topic);
    const qTopName = canonicalKey(q.topicName);
    return qTopId === targetTopicKey || qTopic === targetTopicKey || qTopName === targetTopicKey;
  });

  const verified = matching.filter(q => q.verified === true || q.status === 'VERIFIED');
  const drafts = matching.filter(q => q.status === 'DRAFT' || q.status === 'REVIEW_REQUIRED');
  const rejected = matching.filter(q => q.status === 'REJECTED');

  const coverage = {
    easy: verified.filter(q => (q.difficulty || '').toLowerCase() === 'easy').length,
    medium: verified.filter(q => (q.difficulty || '').toLowerCase() === 'medium').length,
    hard: verified.filter(q => (q.difficulty || '').toLowerCase() === 'hard').length,
    industry: verified.filter(q => (q.difficulty || '').toLowerCase() === 'industry').length
  };

  const practicalTypes = ['code_output', 'debugging', 'scenario', 'numerical', 'practical', 'complexity', 'interview'];
  const practicalCount = verified.filter(q => practicalTypes.includes(q.questionType || '') || Boolean(q.codeSnippet)).length;
  const practicalRatio = verified.length > 0 ? Math.round((practicalCount / verified.length) * 100) / 100 : 0;

  const identifiedGaps: string[] = [];
  if (verified.length < 10) {
    identifiedGaps.push(`Verified question pool (${verified.length}) is below mandatory minimum of 10.`);
  }
  if (coverage.industry === 0) {
    identifiedGaps.push('Zero Industry-level questions available for topic.');
  }
  if (coverage.easy === 0) {
    identifiedGaps.push('Zero Easy/Fundamentals questions available for topic.');
  }
  if (verified.length >= 10 && practicalRatio < 0.7) {
    identifiedGaps.push(`Practical question ratio (${Math.round(practicalRatio * 100)}%) is below target 90%.`);
  }

  return {
    subjectId: identity.subjectId,
    topicId: identity.topicId,
    topicName: identity.topicName,
    totalQuestions: matching.length,
    verifiedCount: verified.length,
    draftCount: drafts.length,
    rejectedCount: rejected.length,
    coverage,
    practicalRatio,
    isSufficientForTopicTest: verified.length >= 10,
    isTargetMet: verified.length >= 15,
    identifiedGaps
  };
}
