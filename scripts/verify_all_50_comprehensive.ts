import { generateTopicTest, generateFinalCertificationTest, feedLanguageIntoQuestionBank } from '../frontend/src/data/question-bank/index.ts';
import fs from 'fs';
import path from 'path';

interface LanguageCatalogEntry {
  rank: number;
  languageId: string;
  languageName: string;
  fileName: string;
  totalCount: number;
}

const catalogPath = path.resolve('frontend', 'public', 'data', 'mcqs_100000', 'dataset_catalog_100000.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const languages: LanguageCatalogEntry[] = catalog.languages;

console.log(`================================================================================`);
console.log(`STARTING E2E VERIFICATION ACROSS ALL ${languages.length} PROGRAMMING LANGUAGES`);
console.log(`Zero Cross-Language Contamination & Zero Topic Mismatch Verification`);
console.log(`================================================================================\n`);

let totalPassed = 0;
let totalFailed = 0;
const failureDetails: string[] = [];

for (const lang of languages) {
  const filePath = path.resolve('frontend', 'public', 'data', 'mcqs_100000', lang.fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing dataset file: ${filePath}`);
    totalFailed++;
    failureDetails.push(`Missing file for ${lang.languageId}`);
    continue;
  }

  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  feedLanguageIntoQuestionBank(lang.languageId, rawData);

  // 1. Verify Final 50-Question Certification Test
  const test50 = generateFinalCertificationTest(lang.languageId, 45);
  const qs50 = test50.questions;
  let test50Contamination = 0;

  for (const q of qs50) {
    const qLang = (q.programmingLanguage || '').toLowerCase();
    const snippet = q.codeSnippet || '';
    if (lang.languageId !== 'java') {
      if (qLang === 'java' || snippet.includes('System.out') || snippet.includes('public class Loop_') || snippet.includes('public static void main')) {
        test50Contamination++;
      }
    }
    if (['sql', 'plsql', 'tsql'].includes(lang.languageId)) {
      if (/for\s*\(\s*int\s+/i.test(snippet) || /int\s+sum\s*=/i.test(snippet) || /while\s*\(\s*[a-z0-9_]+\s*<=\s*[0-9]+\s*\)/i.test(snippet)) {
        test50Contamination++;
      }
    }
  }

  const dup50 = qs50.length - new Set(qs50.map(q => q.id)).size;

  // 2. Discover distinct topics available for this language
  const topicCounts: { [top: string]: number } = {};
  for (const item of rawData) {
    const t = item.topicId || item.topic || 'general';
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  }
  const dbTopics = Object.keys(topicCounts).filter(t => !['loops', 'conditions'].includes(t) && topicCounts[t] >= 15).slice(0, 3);
  const generalTopics = Object.keys(topicCounts).filter(t => topicCounts[t] >= 15).slice(0, 3);
  const topTopics = ['sql', 'plsql', 'tsql'].includes(lang.languageId) ? dbTopics : generalTopics;

  let topicMismatchesTotal = 0;
  let topicContaminationTotal = 0;

  for (const topicId of topTopics) {
    const topicTest = generateTopicTest(lang.languageId, topicId, topicId, 'Mixed', 15, 15);
    for (const q of topicTest.questions) {
      if (q.topicId !== topicId && !(topicId === 'lists' && q.topicId === 'lists-tuples')) {
        topicMismatchesTotal++;
      }
      const qLang = (q.programmingLanguage || '').toLowerCase();
      const snippet = q.codeSnippet || '';
      if (lang.languageId !== 'java') {
        if (qLang === 'java' || snippet.includes('System.out') || snippet.includes('public class Loop_') || snippet.includes('public static void main')) {
          topicContaminationTotal++;
        }
      }
      if (['sql', 'plsql', 'tsql'].includes(lang.languageId)) {
        if (/for\s*\(\s*int\s+/i.test(snippet) || /int\s+sum\s*=/i.test(snippet) || /while\s*\(\s*[a-z0-9_]+\s*<=\s*[0-9]+\s*\)/i.test(snippet)) {
          topicContaminationTotal++;
        }
      }
    }
  }

  const isPass = (qs50.length === 50 && dup50 === 0 && test50Contamination === 0 && topicMismatchesTotal === 0 && topicContaminationTotal === 0);

  if (isPass) {
    totalPassed++;
    console.log(`[PASS] #${lang.rank.toString().padStart(2, ' ')} ${lang.languageName.padEnd(15, ' ')} | 50-MCQ: 50 Qs (0 dups, 0 contam) | Topics [${topTopics.join(', ')}]: 0 mismatches, 0 contam`);
  } else {
    totalFailed++;
    const errMsg = `[FAIL] #${lang.rank} ${lang.languageName}: 50-MCQ contam=${test50Contamination}, dups=${dup50}, Topic mismatches=${topicMismatchesTotal}, contam=${topicContaminationTotal}`;
    console.error(errMsg);
    failureDetails.push(errMsg);
  }
}

console.log(`\n================================================================================`);
console.log(`FINAL RESULTS: ${totalPassed}/${languages.length} LANGUAGES PASSED 100%`);
if (totalFailed === 0) {
  console.log(`ALL 50 PROGRAMMING LANGUAGES VERIFIED: ZERO CONTAMINATION, ZERO TOPIC MISMATCHES!`);
} else {
  console.log(`FAILURES DETECTED IN ${totalFailed} LANGUAGES:`);
  failureDetails.forEach(f => console.log(`  - ${f}`));
}
console.log(`================================================================================`);
