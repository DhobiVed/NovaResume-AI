import { ALL_PROGRAMMING_LANGUAGES } from './programmingLanguagesData';
import type { KnowledgeBaseLanguage, TopicLearningContent } from '../types/careerConnect';

/**
 * Lightweight compatibility adapter for legacy references.
 * Educational content has been migrated to the Searchable Programming Language Directory
 * which routes directly to canonical MDN Web Docs and W3Schools documentation.
 * Zero internally stored synthetic article text.
 */
export const KNOWLEDGE_BASE_LANGUAGES: KnowledgeBaseLanguage[] = ALL_PROGRAMMING_LANGUAGES.map(lang => ({
  id: lang.id,
  name: lang.name,
  category: lang.category,
  description: lang.description,
  modules: lang.modules.map(mod => ({
    id: mod.id,
    name: mod.title,
    title: mod.title,
    description: mod.title,
    topics: mod.topics.map(top => ({
      id: top.id,
      name: top.title,
      description: top.title,
      difficulty: 'Medium' as const,
      estimatedMinutes: 20
    }))
  }))
}));

export const TOPIC_LEARNING_CONTENT: Record<string, TopicLearningContent> = {};

export function getOrCreateTopicContent(
  language: string,
  moduleId: string,
  topicId: string
): TopicLearningContent {
  const key = `${language.toLowerCase()}_${moduleId}_${topicId}`;
  return {
    id: key,
    language,
    moduleId,
    moduleName: moduleId,
    topicId,
    topicName: topicId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    overview: `Refer to verified canonical documentation on MDN Web Docs and W3Schools for ${language} - ${topicId}.`,
    objectives: [],
    concepts: [],
    codeExamples: [],
    commonMistakes: [],
    interviewPoints: [],
    references: [],
    subtopics: []
  };
}
