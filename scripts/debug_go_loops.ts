import { filterExactVerifiedQuestions, feedLanguageIntoQuestionBank, getQuestionBankBySkill } from '../frontend/src/data/question-bank/index.ts';
import { validateSemanticIntegrity } from '../frontend/src/services/aiQuestionIntelligence/semanticValidator.ts';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('frontend/public/data/mcqs_100000/08_golang_2000_mcqs.json', 'utf8'));
feedLanguageIntoQuestionBank('golang', data);
const bank = getQuestionBankBySkill('golang');
console.log('Bank questions count:', bank?.questions.length);
const loopsInBank = bank?.questions.filter(q => q.topicId === 'loops') || [];
console.log('loops in bank count:', loopsInBank.length);

let failedSemantic = 0;
for (const q of loopsInBank) {
  const sem = validateSemanticIntegrity(q, 'golang', 'loops');
  if (!sem.isValid) {
    failedSemantic++;
  }
}
console.log('Failed semantic count:', failedSemantic, 'out of', loopsInBank.length);

const res = filterExactVerifiedQuestions({
  skillId: 'golang',
  language: 'golang',
  topicId: 'loops',
  topic: 'While, For & Iteration Loops',
  difficulty: 'Mixed'
});
console.log('filterExactVerifiedQuestions count:', res.verifiedQuestions.length);
