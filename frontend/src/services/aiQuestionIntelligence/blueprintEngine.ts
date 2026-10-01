import type { TopicBlueprint } from './types';
import { resolveCanonicalTaxonomy } from './canonicalTaxonomy';
import type { QuestionType } from '../../types/careerConnect';

/**
 * Question Blueprint Engine
 * Formulates the pedagogical and technical framework for question authoring.
 */
export function createTopicBlueprint(
  subjectId: string,
  topicId: string,
  topicTitle?: string
): TopicBlueprint {
  const identity = resolveCanonicalTaxonomy(subjectId, topicId, topicTitle);

  // Practical question types favored (90% practical / 10% theory)
  const practicalQuestionTypes: QuestionType[] = [
    'code_output',
    'debugging',
    'scenario',
    'numerical',
    'practical',
    'complexity',
    'interview'
  ];

  // Core concepts derived from topic identity
  const coreConcepts: string[] = [
    `${identity.topicName} syntax and execution model`,
    `${identity.topicName} edge cases and boundary conditions`,
    `${identity.topicName} common errors and debugging patterns`,
    `${identity.topicName} runtime complexity and memory implications`,
    `${identity.topicName} industry application and best practices`
  ];

  const learningObjectives: string[] = [
    `Understand internal execution mechanics of ${identity.topicName} in ${identity.subjectName}.`,
    `Identify, diagnose, and resolve runtime and logical errors related to ${identity.topicName}.`,
    `Analyze time/space complexity and performance trade-offs of ${identity.topicName}.`,
    `Apply ${identity.topicName} to real-world production engineering scenarios.`
  ];

  const distractorStrategies: string[] = [
    'Subtle operator precedence or scoping misconception',
    'Off-by-one or boundary condition miscalculation',
    'Common language runtime exception (e.g. NullPointer, IndexOutOfBounds, TypeCoercion)',
    'Syntactically plausible alternative from a related language paradigm'
  ];

  return {
    canonicalIdentity: identity,
    syllabusModule: 'Syllabus Module',
    coreConcepts,
    recommendedQuestionTypes: practicalQuestionTypes,
    targetDifficultyDistribution: {
      easy: 2,
      medium: 5,
      hard: 5,
      industry: 3
    },
    practicalTargetRatio: 0.9, // 90% practical
    learningObjectives,
    distractorStrategies,
    syntaxSignatures: [identity.subjectId, identity.topicId]
  };
}
