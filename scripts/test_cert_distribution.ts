import { generateFinalCertificationTest, feedLanguageIntoQuestionBank, isPracticalQuestion } from '../frontend/src/data/question-bank/index.ts';
import fs from 'fs';
import path from 'path';

for (const lang of ['javascript', 'python', 'java', 'sql', 'assembly', 'cpp']) {
  const file = fs.readdirSync(path.resolve('frontend', 'public', 'data', 'mcqs_100000')).find(f => f.includes(`_${lang}_`));
  if (!file) continue;
  const data = JSON.parse(fs.readFileSync(path.resolve('frontend', 'public', 'data', 'mcqs_100000', file), 'utf8'));
  feedLanguageIntoQuestionBank(lang, data);

  const cert = generateFinalCertificationTest(lang, 45);
  const qs = cert.questions;

  const prac = qs.filter(q => isPracticalQuestion(q)).length;
  const theory = qs.length - prac;
  const diffs: { [k: string]: number } = {};
  const topics: { [k: string]: number } = {};
  const concepts: { [k: string]: number } = {};

  for (const q of qs) {
    const d = q.difficulty || 'Unknown';
    diffs[d] = (diffs[d] || 0) + 1;
    const t = q.topicId || 'general';
    topics[t] = (topics[t] || 0) + 1;
    const c = q.primaryConcept || 'general';
    concepts[c] = (concepts[c] || 0) + 1;
  }

  console.log(`=== ${lang.toUpperCase()} CERTIFICATION TEST ===`);
  console.log(`Total: ${qs.length} | Practical: ${prac} | Theory: ${theory}`);
  console.log(`Difficulties:`, diffs);
  console.log(`Distinct Topics: ${Object.keys(topics).length} | Topic Counts:`, topics);
  console.log(`Distinct Concepts: ${Object.keys(concepts).length}`);
  console.log(`-----------------------------------------------`);
}
