/**
 * NOVA CAREERCONNECT - QUESTION BANK COVERAGE SCANNER & REPLENISHMENT TEST SUITE
 * 
 * Verifies:
 * 1. Coverage Scanner scans entire Knowledge Base (Programming + Engineering).
 * 2. 0 missing topics across the entire Knowledge Base.
 * 3. Python Functions, Loops, and OOP have >= 10 verified questions.
 * 4. Java real topic has >= 10 verified questions.
 * 5. Mechanical SolidWorks has >= 10 verified questions per topic.
 * 6. Civil Structural Analysis has >= 10 verified questions per topic.
 * 7. Electrical PLC has >= 10 verified questions per topic.
 * 8. Electronics Microcontrollers has >= 10 verified questions per topic.
 * 9. Exact topic isolation & zero cross-contamination.
 * 10. Adaptive practice topic test generation works without filler.
 * 11. Replenishment job queue structures & execution.
 */

import { getAllVerifiedBankQuestions, generateTopicTest, filterExactVerifiedQuestions } from '../data/question-bank';
import { QuestionBankCoverageScanner } from '../services/aiQuestionIntelligence/coverageScanner';
import { replenishTopicQuestionPool } from '../services/aiQuestionIntelligence/replenishmentEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`PASS: ${message}`);
  }
}

async function runCoverageTests() {
  console.log('====================================================');
  console.log('NOVA CAREERCONNECT - TOPIC COVERAGE & REPLENISHMENT AUDIT');
  console.log('====================================================\n');

  const allQuestions = getAllVerifiedBankQuestions();
  console.log(`Total Verified Bank Questions: ${allQuestions.length}`);
  assert(allQuestions.length >= 2000, `Question bank contains at least 2,000 verified questions (Actual: ${allQuestions.length})`);

  // ── TEST 1: Full Knowledge Base Scan ──
  console.log('\n--- TEST 1: Knowledge Base Coverage Scanner ---');
  const report = QuestionBankCoverageScanner.scanEntireKnowledgeBase(allQuestions, 15);
  console.log(`Total Topics Scanned: ${report.totalTopicsScanned}`);
  console.log(`Healthy Topics:       ${report.healthyTopicsCount}`);
  console.log(`Ready Topics:         ${report.readyTopicsCount}`);
  console.log(`Low Topics:           ${report.lowTopicsCount}`);
  console.log(`Missing Topics:       ${report.missingTopicsCount}`);

  assert(report.totalTopicsScanned >= 190, `Scanned at least 190 syllabus topics (Actual: ${report.totalTopicsScanned})`);
  assert(report.missingTopicsCount === 0, `Zero topics missing verified questions across the platform`);
  assert(report.lowTopicsCount === 0, `Zero topics with low (<10) question coverage`);
  assert(report.readyTopicsCount + report.healthyTopicsCount === report.totalTopicsScanned, `100% of Knowledge Base topics satisfy the >= 10 question threshold`);

  // ── TEST 2: Python Functions Coverage ──
  console.log('\n--- TEST 2: Python Functions Coverage ---');
  const pyFunc = filterExactVerifiedQuestions({ skillId: 'python', topicId: 'functions' });
  assert(pyFunc.verifiedQuestions.length >= 10, `Python Functions has >= 10 verified questions (Actual: ${pyFunc.verifiedQuestions.length})`);
  pyFunc.verifiedQuestions.forEach(q => {
    assert(q.domainId === 'programming', `Question belongs to programming domain`);
    assert(q.skillId === 'python' || q.programmingLanguage?.toLowerCase() === 'python', `Question belongs to Python`);
    assert(q.topicId === 'functions' || q.topic.toLowerCase().includes('function'), `Question belongs to Functions topic`);
  });

  // ── TEST 3: Python Loops Coverage ──
  console.log('\n--- TEST 3: Python Loops Coverage ---');
  const pyLoops = filterExactVerifiedQuestions({ skillId: 'python', topicId: 'loops' });
  assert(pyLoops.verifiedQuestions.length >= 10, `Python Loops has >= 10 verified questions (Actual: ${pyLoops.verifiedQuestions.length})`);
  pyLoops.verifiedQuestions.forEach(q => {
    assert(q.topicId === 'loops' || q.topic.toLowerCase().includes('loop'), `Question belongs to Loops topic`);
  });

  // ── TEST 4: Python OOP Coverage ──
  console.log('\n--- TEST 4: Python OOP Coverage ---');
  const pyOop = filterExactVerifiedQuestions({ skillId: 'python', topicId: 'oop' });
  assert(pyOop.verifiedQuestions.length >= 10, `Python OOP has >= 10 verified questions (Actual: ${pyOop.verifiedQuestions.length})`);

  // ── TEST 5: Java Real Topic Coverage ──
  console.log('\n--- TEST 5: Java Real Topic (Strings) Coverage ---');
  const javaStrings = filterExactVerifiedQuestions({ skillId: 'java', topicId: 'strings' });
  assert(javaStrings.verifiedQuestions.length >= 10, `Java Strings has >= 10 verified questions (Actual: ${javaStrings.verifiedQuestions.length})`);
  javaStrings.verifiedQuestions.forEach(q => {
    assert(q.programmingLanguage?.toLowerCase() === 'java', `Question is Java-specific`);
    assert(q.topicId === 'strings' || q.topic.toLowerCase().includes('string'), `Question is String-specific`);
  });

  // ── TEST 6: Mechanical SolidWorks Coverage ──
  console.log('\n--- TEST 6: Mechanical SolidWorks Coverage ---');
  const swSketching = filterExactVerifiedQuestions({ skillId: 'solidworks', topicId: 'sw-sketching' });
  assert(swSketching.verifiedQuestions.length >= 10, `SolidWorks Sketching has >= 10 verified questions (Actual: ${swSketching.verifiedQuestions.length})`);
  swSketching.verifiedQuestions.forEach(q => {
    assert(q.domainId === 'mechanical', `Question belongs to Mechanical domain`);
    assert(q.skillId === 'solidworks', `Question belongs to SolidWorks`);
    assert(q.topicId === 'sw-sketching' || q.topic.includes('Sketching'), `Question belongs to Sketching topic`);
  });

  // ── TEST 7: Civil Structural Analysis Coverage ──
  console.log('\n--- TEST 7: Civil Structural Analysis Coverage ---');
  const civilStaad = filterExactVerifiedQuestions({ skillId: 'structural-analysis', topicId: 'staad-modeling' });
  assert(civilStaad.verifiedQuestions.length >= 10, `Structural Analysis Modeling has >= 10 verified questions (Actual: ${civilStaad.verifiedQuestions.length})`);
  civilStaad.verifiedQuestions.forEach(q => {
    assert(q.domainId === 'civil', `Question belongs to Civil domain`);
    assert(q.skillId === 'structural-analysis', `Question belongs to Structural Analysis`);
  });

  // ── TEST 8: Electrical PLC Coverage ──
  console.log('\n--- TEST 8: Electrical PLC Coverage ---');
  const plcLadder = filterExactVerifiedQuestions({ skillId: 'plc', topicId: 'plc-ladder' });
  assert(plcLadder.verifiedQuestions.length >= 10, `PLC Ladder has >= 10 verified questions (Actual: ${plcLadder.verifiedQuestions.length})`);
  plcLadder.verifiedQuestions.forEach(q => {
    assert(q.domainId === 'electrical', `Question belongs to Electrical domain`);
    assert(q.skillId === 'plc', `Question belongs to PLC`);
  });

  // ── TEST 9: Electronics Microcontrollers Coverage ──
  console.log('\n--- TEST 9: Electronics Microcontrollers Coverage ---');
  const mcuArch = filterExactVerifiedQuestions({ skillId: 'microcontrollers', topicId: 'mcu-architecture' });
  assert(mcuArch.verifiedQuestions.length >= 10, `Microcontrollers Architecture has >= 10 verified questions (Actual: ${mcuArch.verifiedQuestions.length})`);
  mcuArch.verifiedQuestions.forEach(q => {
    assert(q.domainId === 'electronics', `Question belongs to Electronics domain`);
    assert(q.skillId === 'microcontrollers', `Question belongs to Microcontrollers`);
  });

  // ── TEST 10: Practice Topic Test Generation ──
  console.log('\n--- TEST 10: Practice Topic Test Generation ---');
  const test1 = generateTopicTest('solidworks', 'sw-sketching', '2D Sketching, Relations & Constraints', 'Mixed', 15, 10);
  assert(test1.questions.length === 10, `Generated exactly 10 questions for topic test`);
  assert(test1.exactTopicLocked === true, `Test is exactTopicLocked`);
  assert(test1.totalQuestions === 10, `totalQuestions reported accurately as 10`);

  // ── TEST 11: Replenishment Job Verification ──
  console.log('\n--- TEST 11: Autonomous Replenishment Job Execution ---');
  const replenishRes = await replenishTopicQuestionPool(
    'python',
    'decorators',
    allQuestions,
    15,
    'Decorators & Generators'
  );
  assert(replenishRes.job.status === 'COMPLETED', `Replenishment job completed successfully`);
  assert(replenishRes.job.targetCount === 15, `Replenishment job target count is 15`);
  assert(replenishRes.job.attempts === 1, `Replenishment recorded 1 attempt`);

  console.log('\n====================================================');
  console.log('ALL TOPIC COVERAGE & REPLENISHMENT TESTS PASSED');
  console.log('====================================================');
}

runCoverageTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
