import type { BankQuestion } from '../../types/careerConnect';
import type { QualityGateResult, TopicBlueprint } from './types';
import { validateCodeSnippet } from './codeValidator';
import { checkDuplicateQuestion } from './duplicateDetector';
import { validateSemanticIntegrity } from './semanticValidator';

/**
 * 16-Point Autonomous Question Quality Gate
 * Enforces rigorous pedagogical, technical, and AST semantic criteria before any question can become VERIFIED.
 */
export function runQualityGate(
  candidate: Partial<BankQuestion>,
  blueprint: TopicBlueprint,
  existingPool: BankQuestion[]
): QualityGateResult {
  const rejectionReasons: string[] = [];

  // Check 1: Topic Relevance
  const topicRelevance = Boolean(
    candidate.topicId &&
    candidate.topic &&
    (candidate.topicId === blueprint.canonicalIdentity.topicId ||
     candidate.topic.toLowerCase().includes(blueprint.canonicalIdentity.topicName.toLowerCase()) ||
     blueprint.canonicalIdentity.topicName.toLowerCase().includes(candidate.topic.toLowerCase()))
  );
  if (!topicRelevance) rejectionReasons.push('Candidate topic does not align with blueprint topic.');

  // Check 2: Skill Relevance
  const skillRelevance = Boolean(
    candidate.skillId &&
    (candidate.skillId.toLowerCase() === blueprint.canonicalIdentity.skillId.toLowerCase() ||
     (candidate.programmingLanguage && candidate.programmingLanguage.toLowerCase() === blueprint.canonicalIdentity.skillName.toLowerCase()))
  );
  if (!skillRelevance) rejectionReasons.push('Candidate skill/language does not match target skill.');

  // Check 3: Domain Relevance
  const domainRelevance = Boolean(
    !candidate.domainId || candidate.domainId.toLowerCase() === blueprint.canonicalIdentity.domainId.toLowerCase()
  );
  if (!domainRelevance) rejectionReasons.push('Candidate domain cross-contaminates across disciplines.');

  // Check 4: Difficulty Correctness
  const validDifficulties = ['Easy', 'Medium', 'Hard', 'Industry'];
  const difficultyCorrectness = Boolean(candidate.difficulty && validDifficulties.includes(candidate.difficulty));
  if (!difficultyCorrectness) rejectionReasons.push(`Invalid difficulty level: ${candidate.difficulty}`);

  // Check 5 & 6: Single Correct Answer & Valid Correct Index
  const hasOptions = Array.isArray(candidate.options) && candidate.options.length === 4;
  const validCorrectIndex = typeof candidate.correctIndex === 'number' && candidate.correctIndex >= 0 && candidate.correctIndex <= 3;
  const singleCorrectAnswer = hasOptions && validCorrectIndex;
  if (!singleCorrectAnswer) rejectionReasons.push('Question must have exactly 4 distinct options and a valid correctIndex (0..3).');

  // Check 7: Plausible Distractors (All 4 options must be distinct and non-empty)
  let plausibleDistractors = false;
  if (hasOptions && candidate.options) {
    const trimmedOpts = candidate.options.map(o => o.trim().toLowerCase());
    const uniqueCount = new Set(trimmedOpts).size;
    plausibleDistractors = uniqueCount === 4 && trimmedOpts.every(o => o.length > 0);
  }
  if (!plausibleDistractors) rejectionReasons.push('Distractors must be 4 unique, non-empty, plausible alternatives.');

  // Check 8 & 9: Clear Wording & No Ambiguity
  const clearWording = Boolean(candidate.question && candidate.question.trim().length >= 15);
  const unambiguous = Boolean(
    candidate.correctAnswer &&
    hasOptions &&
    candidate.options &&
    candidate.options[candidate.correctIndex!] === candidate.correctAnswer
  );
  if (!clearWording) rejectionReasons.push('Question prompt is too brief or lacks sufficient technical clarity.');
  if (!unambiguous) rejectionReasons.push('Claimed correctAnswer does not match option at correctIndex.');

  // Check 10: Valid Explanation
  const validExplanation = Boolean(candidate.explanation && candidate.explanation.trim().length >= 20);
  if (!validExplanation) rejectionReasons.push('Explanation must provide an in-depth pedagogical rationale (min 20 chars).');

  // Check 11 & 12: Duplicate & Near-Duplicate Check
  const dupCheck = checkDuplicateQuestion(candidate, existingPool);
  const noDuplicate = !dupCheck.isDuplicate || dupCheck.duplicateType !== 'exact';
  const noNearDuplicate = !dupCheck.isDuplicate || (dupCheck.duplicateType !== 'near' && dupCheck.duplicateType !== 'semantic');
  if (!noDuplicate || !noNearDuplicate) {
    rejectionReasons.push(`Duplicate check failed: ${dupCheck.reason || 'Existing question overlap detected.'}`);
  }

  // Check 13: Practical Relevance (Code output, debugging, scenario, complexity, practical calculation)
  const practicalTypes = ['code_output', 'debugging', 'scenario', 'numerical', 'practical', 'complexity', 'interview'];
  const practicalRelevance = Boolean(
    candidate.questionType && (practicalTypes.includes(candidate.questionType) || candidate.codeSnippet)
  );

  // Check 14: Valid Code Snippet
  const codeCheck = validateCodeSnippet(
    candidate.codeSnippet,
    blueprint.canonicalIdentity.skillName,
    candidate.correctAnswer
  );
  const validCodeSnippet = codeCheck.isValid;
  if (!validCodeSnippet) {
    rejectionReasons.push(`Code snippet validation failed: ${codeCheck.errorMessage}`);
  }

  // Check 15: Appropriate Learning Objective
  const appropriateLearningObjective = Boolean(
    candidate.learningObjective && candidate.learningObjective.trim().length >= 10
  );

  // Check 16: Semantic AST & Construct Integrity
  const semanticCheck = validateSemanticIntegrity(
    candidate,
    blueprint.canonicalIdentity.skillName,
    blueprint.canonicalIdentity.topicName
  );
  const semanticIntegrity = semanticCheck.isValid;
  if (!semanticIntegrity) {
    rejectionReasons.push(...semanticCheck.reasons);
  }

  const checks = {
    topicRelevance,
    skillRelevance,
    domainRelevance,
    difficultyCorrectness,
    technicalCorrectness: singleCorrectAnswer && unambiguous && validExplanation,
    singleCorrectAnswer,
    plausibleDistractors,
    clearWording,
    unambiguous,
    validExplanation,
    noDuplicate,
    noNearDuplicate,
    practicalRelevance,
    validCodeSnippet,
    appropriateLearningObjective,
    semanticIntegrity
  };

  const passCount = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passCount / 16) * 100);

  // Critical gating: must pass all critical technical & semantic requirements to be VERIFIED
  const passed = (
    topicRelevance &&
    skillRelevance &&
    domainRelevance &&
    difficultyCorrectness &&
    singleCorrectAnswer &&
    plausibleDistractors &&
    clearWording &&
    unambiguous &&
    validExplanation &&
    noDuplicate &&
    noNearDuplicate &&
    validCodeSnippet &&
    semanticIntegrity
  );

  let assignedStatus: 'VERIFIED' | 'REVIEW_REQUIRED' | 'REJECTED' = 'REJECTED';
  if (passed) {
    assignedStatus = 'VERIFIED';
  } else if (score >= 60) {
    assignedStatus = 'REVIEW_REQUIRED';
  }

  return {
    passed,
    score,
    checks,
    rejectionReasons,
    assignedStatus
  };
}
