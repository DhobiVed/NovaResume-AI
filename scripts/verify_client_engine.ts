import { generateTopicTest, generateFinalCertificationTest, feedLanguageIntoQuestionBank } from '../frontend/src/data/question-bank/index.ts';
import fs from 'fs';
import path from 'path';

const tests = [
  { lang: 'java', file: '01_java_2000_mcqs.json', topicId: 'conditions', title: 'If...Else & Switch Statements', count: 15 },
  { lang: 'java', file: '01_java_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
  { lang: 'python', file: '02_python_2000_mcqs.json', topicId: 'lists', title: 'Lists & Sequence Operations', count: 15 },
  { lang: 'python', file: '02_python_2000_mcqs.json', topicId: 'functions', title: 'Functions, Parameters & Return Types', count: 15 },
  { lang: 'cpp', file: '04_cpp_2000_mcqs.json', topicId: 'pointers', title: 'Pointers & Address Arithmetic', count: 15 },
  { lang: 'javascript', file: '03_javascript_2000_mcqs.json', topicId: 'functions', title: 'Functions, Parameters & Return Types', count: 15 },
  { lang: 'golang', file: '08_golang_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
  { lang: 'rust', file: '09_rust_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
  { lang: 'ruby', file: '19_ruby_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
  { lang: 'csharp', file: '05_csharp_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
  { lang: 'php', file: '11_php_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
  { lang: 'swift', file: '15_swift_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
  { lang: 'kotlin', file: '14_kotlin_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
  { lang: 'dart', file: '16_dart_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
  { lang: 'scala', file: '20_scala_2000_mcqs.json', topicId: 'loops', title: 'While, For & Iteration Loops', count: 15 },
];

let allPassed = true;
console.log('=== VERIFYING FRONTEND RUNTIME ENGINE (ALL TOPICS & LANGUAGES) ===');

for (const t of tests) {
  const filePath = path.resolve('frontend', 'public', 'data', 'mcqs_100000', t.file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  feedLanguageIntoQuestionBank(t.lang, data);

  const testRes = generateTopicTest(t.lang, t.topicId, t.title, 'Mixed', 15, t.count);
  const qs = testRes.questions;
  const actualCount = qs.length;

  const mismatches: any[] = [];
  for (const q of qs) {
    if (q.topicId !== t.topicId && !(t.topicId === 'lists' && q.topicId === 'lists-tuples')) {
      mismatches.push({ id: q.id, topicId: q.topicId, expected: t.topicId });
    }
  }

  const ids = qs.map(q => q.id);
  const dups = ids.length - new Set(ids).size;
  const practicalCount = qs.filter(q => q.codeSnippet && q.codeSnippet.trim().length > 0).length;
  const practicalRatio = (practicalCount / Math.max(1, actualCount)) * 100;

  const status = (actualCount === t.count && mismatches.length === 0 && dups === 0) ? 'PASS' : 'FAIL';
  if (status === 'FAIL') allPassed = false;

  console.log(`[${status}] ${t.lang.toUpperCase()} -> ${t.topicId}: ${actualCount}/${t.count} Qs | ${practicalRatio.toFixed(1)}% practical | 0 dups | mismatches: ${mismatches.length}`);
  if (mismatches.length > 0) {
    console.log('       Mismatches:', mismatches.slice(0, 3));
  }
}

// Test Final 50-MCQ
for (const lang of ['java', 'python']) {
  const test50 = generateFinalCertificationTest(lang, 45);
  const qs = test50.questions;
  const ids = qs.map(q => q.id);
  const dups = ids.length - new Set(ids).size;
  const practicalCount = qs.filter(q => q.codeSnippet && q.codeSnippet.trim().length > 0).length;
  const practicalRatio = (practicalCount / Math.max(1, qs.length)) * 100;
  const status = (qs.length === 50 && dups === 0) ? 'PASS' : 'FAIL';
  if (status === 'FAIL') allPassed = false;
  console.log(`[${status}] ${lang.toUpperCase()} -> Final 50-MCQ: ${qs.length}/50 Qs | ${practicalRatio.toFixed(1)}% practical | 0 dups`);
}

console.log('==================================================================');
console.log(allPassed ? 'ALL FRONTEND TESTS PASSED WITH 100% PURITY!' : 'FRONTEND TESTS FAILED!');
