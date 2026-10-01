import { generateTopicTest, feedLanguageIntoQuestionBank } from '../frontend/src/data/question-bank/index';
import fs from 'fs';
import path from 'path';

// Load JS and SQL
for (const [lang, file] of [['javascript', '03_javascript_2000_mcqs.json'], ['sql', '06_sql_2000_mcqs.json']]) {
    const filePath = path.resolve('public', 'data', 'mcqs_100000', file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    feedLanguageIntoQuestionBank(lang, data);
}

console.log("=== TESTING JAVASCRIPT TOPICS ===");
const jsTopics = [
    { topicId: 'conditions', title: 'If...Else & Switch Statements' },
    { topicId: 'loops', title: 'While, For & Iteration Loops' },
    { topicId: 'functions', title: 'Functions, Parameters & Return Types' },
    { topicId: 'arrays', title: 'Arrays & Array Operations' },
    { topicId: 'async-await', title: 'Async/Await & Promises' }
];
for (const t of jsTopics) {
    const res = generateTopicTest('javascript', t.topicId, t.title, 'Mixed', 15, 15);
    const qs = res.questions;
    const mismatches = qs.filter(q => q.topicId !== t.topicId);
    const javaContamination = qs.filter(q => (q.programmingLanguage || '').toLowerCase() === 'java' || (q.codeSnippet || '').includes('System.out') || (q.codeSnippet || '').includes('public class'));
    console.log(`JS Topic '${t.topicId}': ${qs.length} Qs returned | ${mismatches.length} topic mismatches | ${javaContamination.length} Java Qs`);
}

console.log("\n=== TESTING SQL TOPICS ===");
const sqlTopics = [
    { topicId: 'select', title: 'SELECT & Column Aliases' },
    { topicId: 'where', title: 'WHERE Clause & Filtering Operators' },
    { topicId: 'joins', title: 'INNER, LEFT, RIGHT & FULL Joins' },
    { topicId: 'groupby', title: 'GROUP BY & HAVING Clauses' },
    { topicId: 'indexes', title: 'CREATE INDEX & Query Optimization' }
];
for (const t of sqlTopics) {
    const res = generateTopicTest('sql', t.topicId, t.title, 'Mixed', 15, 15);
    const qs = res.questions;
    const mismatches = qs.filter(q => q.topicId !== t.topicId);
    const javaContamination = qs.filter(q => (q.programmingLanguage || '').toLowerCase() === 'java' || (q.codeSnippet || '').includes('System.out') || (q.codeSnippet || '').includes('public class'));
    console.log(`SQL Topic '${t.topicId}': ${qs.length} Qs returned | ${mismatches.length} topic mismatches | ${javaContamination.length} Java Qs`);
}
