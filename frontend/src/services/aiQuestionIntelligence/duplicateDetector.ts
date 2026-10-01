import type { BankQuestion } from '../../types/careerConnect';
import type { DuplicateCheckResult } from './types';

/**
 * Normalizes question text into a canonical bag of word tokens.
 */
function tokenizeAndNormalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Calculates Jaccard token similarity between two token arrays.
 */
function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 && tokensB.length === 0) return 1.0;
  if (tokensA.length === 0 || tokensB.length === 0) return 0.0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersectionCount = 0;

  setA.forEach(t => {
    if (setB.has(t)) intersectionCount++;
  });

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Normalizes code snippet structure by stripping whitespace and common identifier names.
 */
function normalizeCodeStructure(code?: string | null): string {
  if (!code) return '';
  return code
    .replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, 'VAR')
    .replace(/\s+/g, '')
    .toLowerCase();
}

/**
 * Duplicate Detector Engine
 * Checks candidate question against an existing pool to prevent exact, near, or semantic duplicates.
 */
export function checkDuplicateQuestion(
  candidate: Partial<BankQuestion>,
  existingPool: BankQuestion[]
): DuplicateCheckResult {
  if (!candidate.question || existingPool.length === 0) {
    return { isDuplicate: false, similarityScore: 0, duplicateType: 'none' };
  }

  const candidateTokens = tokenizeAndNormalize(candidate.question);
  const candidateCodeNorm = normalizeCodeStructure(candidate.codeSnippet);

  for (const existing of existingPool) {
    // 1. Exact Question Text Match
    if (candidate.question.trim().toLowerCase() === existing.question.trim().toLowerCase()) {
      return {
        isDuplicate: true,
        similarityScore: 1.0,
        duplicateType: 'exact',
        conflictingQuestionId: existing.id,
        reason: 'Identical question wording found in question bank.'
      };
    }

    // 2. High Lexical / Near Duplicate Match (>= 85% token overlap)
    const existingTokens = tokenizeAndNormalize(existing.question);
    const sim = calculateJaccardSimilarity(candidateTokens, existingTokens);
    if (sim >= 0.85) {
      return {
        isDuplicate: true,
        similarityScore: sim,
        duplicateType: 'near',
        conflictingQuestionId: existing.id,
        reason: `High lexical similarity (${Math.round(sim * 100)}%) to existing question.`
      };
    }

    // 3. Code Clone Match (Identical AST/token structure with renamed variables)
    if (candidateCodeNorm && candidateCodeNorm.length > 20) {
      const existingCodeNorm = normalizeCodeStructure(existing.codeSnippet);
      if (candidateCodeNorm === existingCodeNorm && candidate.topicId === existing.topicId) {
        return {
          isDuplicate: true,
          similarityScore: 0.95,
          duplicateType: 'semantic',
          conflictingQuestionId: existing.id,
          reason: 'Identical code template structure with renamed variables found in same topic.'
        };
      }
    }
  }

  return {
    isDuplicate: false,
    similarityScore: 0,
    duplicateType: 'none'
  };
}
