import type { BankQuestion, QuestionType } from '../../types/careerConnect';

export interface CanonicalIdentity {
  domainId: string;
  domainName: string;
  subjectId: string;
  subjectName: string;
  skillId: string;
  skillName: string;
  topicId: string;
  topicName: string;
  subtopicId?: string;
  canonicalKey: string;
}

export interface TopicBlueprint {
  canonicalIdentity: CanonicalIdentity;
  syllabusModule: string;
  coreConcepts: string[];
  recommendedQuestionTypes: QuestionType[];
  targetDifficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
    industry: number;
  };
  practicalTargetRatio: number; // e.g. 0.9 (90% practical / 10% theory)
  learningObjectives: string[];
  distractorStrategies: string[];
  syntaxSignatures?: string[];
}

export interface CodeValidationResult {
  isValid: boolean;
  language: string;
  hasSyntaxError: boolean;
  simulatedOutput?: string;
  errorMessage?: string;
  runtimeWarnings?: string[];
  matchesClaimedOutput: boolean;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarityScore: number;
  duplicateType?: 'exact' | 'near' | 'semantic' | 'none';
  conflictingQuestionId?: string;
  reason?: string;
}

export interface QualityGateResult {
  passed: boolean;
  score: number; // 0-100
  checks: {
    topicRelevance: boolean;
    skillRelevance: boolean;
    domainRelevance: boolean;
    difficultyCorrectness: boolean;
    technicalCorrectness: boolean;
    singleCorrectAnswer: boolean;
    plausibleDistractors: boolean;
    clearWording: boolean;
    unambiguous: boolean;
    validExplanation: boolean;
    noDuplicate: boolean;
    noNearDuplicate: boolean;
    practicalRelevance: boolean;
    validCodeSnippet: boolean;
    semanticIntegrity?: boolean;
    appropriateLearningObjective: boolean;
  };
  rejectionReasons: string[];
  assignedStatus: 'VERIFIED' | 'REVIEW_REQUIRED' | 'REJECTED';
}

export interface QuestionHealthReport {
  subjectId: string;
  topicId: string;
  topicName: string;
  totalQuestions: number;
  verifiedCount: number;
  draftCount: number;
  rejectedCount: number;
  coverage: {
    easy: number;
    medium: number;
    hard: number;
    industry: number;
  };
  practicalRatio: number; // 0.0 - 1.0
  isSufficientForTopicTest: boolean; // >= 10 verified
  isTargetMet: boolean; // >= 15-20 verified
  identifiedGaps: string[];
}

export type CoverageStatus = 
  | 'HEALTHY'       // 15+ verified questions
  | 'READY'         // 10-14 verified questions
  | 'LOW'           // 1-9 verified questions
  | 'MISSING'       // 0 verified questions
  | 'QUEUED'
  | 'GENERATING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING';

export interface TopicCoverageItem {
  domainId: string;
  domainName: string;
  subjectId: string;
  subjectName: string;
  skillId: string;
  skillName: string;
  moduleId: string;
  moduleName: string;
  topicId: string;
  topicName: string;
  totalQuestions: number;
  verifiedQuestions: number;
  draftQuestions: number;
  reviewRequired: number;
  rejectedQuestions: number;
  legacyQuestions: number;
  status: CoverageStatus;
  targetCount: number;
  isSufficientForTest: boolean; // >= 10 verified
}

export interface KnowledgeBaseCoverageReport {
  scannedAt: string;
  totalTopicsScanned: number;
  healthyTopicsCount: number;
  readyTopicsCount: number;
  lowTopicsCount: number;
  missingTopicsCount: number;
  totalVerifiedQuestions: number;
  topics: TopicCoverageItem[];
  jobsCreatedCount: number;
}

export interface ReplenishmentJob {
  jobId: string;
  domainId?: string;
  subjectId: string;
  skillId?: string;
  topicId: string;
  targetCount: number;
  currentVerifiedCount?: number;
  status: CoverageStatus;
  provider?: string;
  attempts?: number;
  generatedCount: number;
  verifiedCount: number;
  rejectedCount: number;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface IQuestionAIProvider {
  providerId: string;
  providerName: string;
  isAvailable(): boolean;
  generateCandidateQuestions(blueprint: TopicBlueprint, count: number): Promise<Partial<BankQuestion>[]>;
  reviewTechnicalAccuracy?(question: Partial<BankQuestion>): Promise<{ isAccurate: boolean; notes: string }>;
}

