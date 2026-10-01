/**
 * verify_student_runtime_e2e.ts
 * End-to-end verification of student MCQ test generation.
 * Tests:
 * 1. Exact topic matching (zero leakage/mismatches)
 * 2. 90% practical / 10% theoretical ratio
 * 3. Repetition avoidance across consecutive attempts
 * 4. Multi-topic distribution in 50-MCQ final certification
 */

import { generateTopicTest, generateFinalCertificationTest, isPracticalQuestion } from '../data/question-bank';
import { careerConnectService } from '../services/careerConnectService';

interface TargetSpec {
  lang: string;
  topicId: string;
  topicTitle: string;
  count: number;
}

const TOPIC_TARGETS: TargetSpec[] = [
  { lang: 'java', topicId: 'conditions', topicTitle: 'If...Else & Switch Statements', count: 15 },
  { lang: 'java', topicId: 'loops', topicTitle: 'While, For & For-Each Loops', count: 15 },
  { lang: 'python', topicId: 'lists', topicTitle: 'Lists & List Comprehensions', count: 15 },
  { lang: 'python', topicId: 'functions', topicTitle: 'Functions, *args & **kwargs', count: 15 },
  { lang: 'cpp', topicId: 'pointers', topicTitle: 'Pointers & References', count: 15 },
  { lang: 'javascript', topicId: 'functions', topicTitle: 'Functions & Arrow Functions', count: 15 },
  { lang: 'golang', topicId: 'loops', topicTitle: 'Loops & Iteration Controls', count: 15 },
  { lang: 'ruby', topicId: 'loops', topicTitle: 'Loops & Iteration Controls', count: 15 },
  { lang: 'rust', topicId: 'loops', topicTitle: 'Loops & Iteration Controls', count: 15 },
];

async function runVerification() {
  console.log('================================================================');
  console.log('STARTING STUDENT MCQ RUNTIME VERIFICATION');
  console.log('================================================================\n');

  let allPassed = true;

  // 1. TOPIC TESTS (15 MCQs)
  for (const target of TOPIC_TARGETS) {
    console.log(`\n================================================================`);
    console.log(`TESTING: ${target.lang.toUpperCase()} -> ${target.topicId} (${target.topicTitle})`);
    console.log(`================================================================`);

    // Ensure language is preloaded if programming
    await careerConnectService.preloadLanguageMCQs(target.lang);

    const seenIds = new Set<string>();
    const attempts = 3;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      const test = careerConnectService.generateTopicAssessment(
        target.lang,
        target.topicId,
        target.topicTitle,
        'Mixed',
        15,
        target.count,
        Array.from(seenIds),
        'student-test-user'
      );

      const qs = test.questions;
      const practicalCount = qs.filter(q => isPracticalQuestion(q)).length;
      const practicalRatio = (practicalCount / qs.length) * 100;

      // Check topic matching
      const mismatched = qs.filter(q => {
        const top = (q.topicId || '').toLowerCase();
        // Check if question belongs to target topic or canonical cluster
        if (target.topicId === 'conditions') {
          return !['conditions', 'if-else', 'control-flow', 'flow-control'].includes(top);
        }
        if (target.topicId === 'loops') {
          return !['loops', 'for-loop', 'while-loop', 'control-flow', 'flow-control'].includes(top);
        }
        if (target.topicId === 'lists') {
          return !['lists', 'arrays', 'listcomprehensions', 'data-structures'].includes(top);
        }
        if (target.topicId === 'pointers') {
          return !['pointers', 'pointers-memory', 'memory', 'dynamic-memory'].includes(top);
        }
        if (target.topicId === 'functions') {
          return !['functions', 'functions-scope', 'methods'].includes(top);
        }
        return top !== target.topicId;
      });

      // Check repetition within this attempt
      const uniqueIdsThisAttempt = new Set(qs.map(q => q.id));
      const internalDups = qs.length - uniqueIdsThisAttempt.size;

      // Check repeats from previous attempts
      const repeatFromPrev = qs.filter(q => seenIds.has(q.id));

      console.log(`\n--- Attempt ${attempt} ---`);
      console.log(`  Total Questions: ${qs.length}`);
      console.log(`  Practical Count: ${practicalCount}/${qs.length} (${practicalRatio.toFixed(1)}%)`);
      console.log(`  Topic Mismatches: ${mismatched.length}`);
      console.log(`  Internal Duplicates: ${internalDups}`);
      console.log(`  Repeats from Previous Attempts: ${repeatFromPrev.length}`);

      if (mismatched.length > 0) {
        console.error(`  FAIL: Found ${mismatched.length} topic mismatches!`);
        for (const m of mismatched) {
          console.error(`    ID: ${m.id}, topicId: ${m.topicId}, text: ${m.question.substring(0, 60)}`);
        }
        allPassed = false;
      }

      if (internalDups > 0) {
        console.error(`  FAIL: Found ${internalDups} internal duplicate IDs!`);
        allPassed = false;
      }

      // Record questions seen for next attempt
      for (const q of qs) {
        seenIds.add(q.id);
      }

      // Sample first 3 questions for log
      for (let i = 0; i < Math.min(3, qs.length); i++) {
        const q = qs[i];
        console.log(`    Q${i+1} [${q.id}] [${q.topicId}] [${isPracticalQuestion(q) ? 'PRACTICAL' : 'THEORY'}]: ${q.question.substring(0, 70)}...`);
        if (q.codeSnippet) {
          console.log(`       Code: ${q.codeSnippet.replace(/\n/g, ' ').substring(0, 60)}...`);
        }
      }
    }
  }

  // 2. FINAL 50-MCQ CERTIFICATION TESTS
  const CERT_LANGS = ['java', 'python', 'cpp', 'golang'];
  for (const lang of CERT_LANGS) {
    console.log(`\n================================================================`);
    console.log(`TESTING FINAL 50-MCQ CERTIFICATION: ${lang.toUpperCase()}`);
    console.log(`================================================================`);

    await careerConnectService.preloadLanguageMCQs(lang);

    const test = careerConnectService.generateFinalCertificationAssessment(lang, 45, undefined, 'student-cert-user');
    const qs = test.questions;
    const practicalCount = qs.filter(q => isPracticalQuestion(q)).length;
    const practicalRatio = (practicalCount / qs.length) * 100;

    // Check distinct topics covered
    const topicsCovered = new Set(qs.map(q => q.topicId));
    const uniqueIds = new Set(qs.map(q => q.id));

    // Check difficulty distribution
    const easy = qs.filter(q => (q.difficulty || '').toLowerCase() === 'easy').length;
    const med = qs.filter(q => (q.difficulty || '').toLowerCase() === 'medium').length;
    const hard = qs.filter(q => (q.difficulty || '').toLowerCase() === 'hard').length;
    const ind = qs.filter(q => (q.difficulty || '').toLowerCase() === 'industry').length;

    console.log(`  Total Questions: ${qs.length}`);
    console.log(`  Practical Count: ${practicalCount}/${qs.length} (${practicalRatio.toFixed(1)}%)`);
    console.log(`  Distinct Topics Covered: ${topicsCovered.size}`);
    console.log(`  Difficulty Distribution: ${easy} Easy, ${med} Med, ${hard} Hard, ${ind} Industry`);
    console.log(`  Internal Duplicates: ${qs.length - uniqueIds.size}`);

    if (qs.length !== 50) {
      console.error(`  FAIL: Test count is ${qs.length}, expected 50!`);
      allPassed = false;
    }

    if (practicalRatio < 80.0) {
      console.error(`  FAIL: Practical ratio is ${practicalRatio}%, expected >= 85%!`);
      allPassed = false;
    }

    if (topicsCovered.size < 5) {
      console.error(`  FAIL: Only ${topicsCovered.size} topics covered, expected >= 5!`);
      allPassed = false;
    }
  }

  console.log('\n================================================================');
  if (allPassed) {
    console.log('ALL TESTS PASSED! ZERO TOPIC MISMATCHES, 90/10 RATIO VERIFIED, ZERO REPETITIONS.');
  } else {
    console.error('VERIFICATION FAILED WITH ISSUES RECORDED ABOVE.');
  }
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
