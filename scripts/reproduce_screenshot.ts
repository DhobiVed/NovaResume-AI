import { generateTopicTest, feedLanguageIntoQuestionBank } from '../frontend/src/data/question-bank/index.ts';
import { generateFilteredAssessment } from '../frontend/src/services/careerConnectService.ts';
import { generateDisciplineAssessment } from '../frontend/src/data/multiDisciplinaryQuestionBank.ts';
import fs from 'fs';
import path from 'path';

const javaJson = JSON.parse(fs.readFileSync(path.resolve('frontend/public/data/mcqs_100000/01_java_2000_mcqs.json'), 'utf8'));
feedLanguageIntoQuestionBank('java', javaJson);

console.log('--- TEST 1: generateTopicTest(java, conditions, If-Else & Switch Statements) ---');
const t1 = generateTopicTest('java', 'conditions', 'If-Else & Switch Statements', 'Mixed', 15, 15);
console.log('T1 questions count:', t1.questions.length);
t1.questions.forEach((q, i) => console.log(`  Q${i+1}: [${q.id}] topicId=${q.topicId}, topic=${q.topic}, snippet=${q.codeSnippet ? q.codeSnippet.split('\n')[0] : 'NO CODE'}`));

console.log('\n--- TEST 2: generateTopicTest(java, If-Else & Switch Statements) ---');
const t2 = generateTopicTest('java', 'If-Else & Switch Statements', 'If-Else & Switch Statements', 'Mixed', 15, 15);
console.log('T2 questions count:', t2.questions.length);
t2.questions.forEach((q, i) => console.log(`  Q${i+1}: [${q.id}] topicId=${q.topicId}, topic=${q.topic}, snippet=${q.codeSnippet ? q.codeSnippet.split('\n')[0] : 'NO CODE'}`));

console.log('\n--- TEST 3: generateDisciplineAssessment(language: java, topicId: conditions) ---');
try {
  const t3 = generateDisciplineAssessment({ language: 'java', topicId: 'conditions', count: 15 });
  console.log('T3 questions count:', t3.questions?.length);
  t3.questions?.forEach((q, i) => console.log(`  Q${i+1}: [${q.id}] topicId=${q.topicId}, topic=${q.topic}, snippet=${q.codeSnippet ? q.codeSnippet.split('\n')[0] : 'NO CODE'}`));
} catch(e) { console.log('T3 error:', e.message); }

console.log('\n--- TEST 4: generateDisciplineAssessment(language: java, topicId: If-Else & Switch Statements) ---');
try {
  const t4 = generateDisciplineAssessment({ language: 'java', topicId: 'If-Else & Switch Statements', count: 15 });
  console.log('T4 questions count:', t4.questions?.length);
  t4.questions?.forEach((q, i) => console.log(`  Q${i+1}: [${q.id}] topicId=${q.topicId}, topic=${q.topic}, snippet=${q.codeSnippet ? q.codeSnippet.split('\n')[0] : 'NO CODE'}`));
} catch(e) { console.log('T4 error:', e.message); }
