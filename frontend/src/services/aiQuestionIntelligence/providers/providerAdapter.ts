import type { BankQuestion } from '../../../types/careerConnect';
import type { IQuestionAIProvider, TopicBlueprint } from '../types';

/**
 * Deterministic Syllabus-Aware Baseline Provider
 * Generates structured, high-quality question candidates based on TopicBlueprint concepts.
 */
export class SyllabusBaselineProvider implements IQuestionAIProvider {
  providerId = 'syllabus-baseline-engine';
  providerName = 'Syllabus Blueprint Baseline Provider';

  isAvailable(): boolean {
    return true;
  }

  async generateCandidateQuestions(
    blueprint: TopicBlueprint,
    count: number = 5
  ): Promise<Partial<BankQuestion>[]> {
    const { canonicalIdentity, coreConcepts } = blueprint;
    const candidates: Partial<BankQuestion>[] = [];
    const difficulties: ('Easy' | 'Medium' | 'Hard' | 'Industry')[] = ['Easy', 'Medium', 'Hard', 'Industry'];

    for (let i = 0; i < count; i++) {
      const diff = difficulties[i % difficulties.length];
      const concept = coreConcepts[i % coreConcepts.length];
      const qId = `AUTO-${canonicalIdentity.skillId.substring(0, 4).toUpperCase()}-${canonicalIdentity.topicId.substring(0, 4).toUpperCase()}-${Date.now()}-${i + 1}`;

      candidates.push({
        id: qId,
        domainId: canonicalIdentity.domainId,
        domainName: canonicalIdentity.domainName,
        skillId: canonicalIdentity.skillId,
        skillName: canonicalIdentity.skillName,
        subjectId: canonicalIdentity.subjectId,
        programmingLanguage: canonicalIdentity.skillName,
        topicId: canonicalIdentity.topicId,
        topicName: canonicalIdentity.topicName,
        topic: canonicalIdentity.topicName,
        difficulty: diff,
        questionType: diff === 'Easy' ? 'conceptual' : (diff === 'Industry' ? 'scenario' : 'code_output'),
        practicalType: diff === 'Easy' ? 'general' : 'debugging',
        question: `When implementing ${concept} in ${canonicalIdentity.subjectName}, what is the primary technical consideration?`,
        options: [
          `Ensuring proper state handling and contract adherence for ${concept}`,
          `Bypassing runtime compiler checks to improve micro-benchmark speed`,
          `Hardcoding static thread allocations without cleanup routines`,
          `Supplying empty exception catch blocks to suppress warnings`
        ],
        correctIndex: 0,
        correctAnswer: `Ensuring proper state handling and contract adherence for ${concept}`,
        explanation: `In ${canonicalIdentity.subjectName}, reliable implementation of ${concept} strictly necessitates proper state management and contract compliance to prevent memory leaks, race conditions, or unhandled exceptions.`,
        learningObjective: `Master practical implementation patterns for ${concept}.`,
        marks: diff === 'Industry' ? 3 : (diff === 'Hard' ? 2 : 1),
        negativeMarks: 0,
        status: 'DRAFT',
        verified: false,
        sourceType: 'syllabus_blueprint',
        generatorModel: this.providerId
      });
    }

    return candidates;
  }
}

/**
 * Provider Registry
 */
class AIProviderRegistry {
  private providers = new Map<string, IQuestionAIProvider>();

  constructor() {
    this.registerProvider(new SyllabusBaselineProvider());
  }

  registerProvider(provider: IQuestionAIProvider) {
    this.providers.set(provider.providerId, provider);
  }

  getActiveProvider(): IQuestionAIProvider {
    for (const provider of this.providers.values()) {
      if (provider.isAvailable()) return provider;
    }
    return new SyllabusBaselineProvider();
  }
}

export const providerRegistry = new AIProviderRegistry();
