declare const process: any;

import { generateFilteredAssessment } from '../data/questionBank';
import { generateDisciplineAssessment } from '../data/multiDisciplinaryQuestionBank';
import {
  filterExactVerifiedQuestions,
  generateFinalCertificationTest,
  generateTopicTest,
  isPracticalQuestion
} from '../data/question-bank';
import { careerConnectService } from '../services/careerConnectService';
import type { AuthUserSession } from '../types/careerConnect';
import {
  resolveCanonicalTaxonomy,
  createTopicBlueprint,
  validateCodeSnippet,
  checkDuplicateQuestion,
  runQualityGate,
  auditTopicQuestionHealth
} from '../services/aiQuestionIntelligence';

console.log('====================================================');
console.log('NOVA CAREERCONNECT - AUTONOMOUS AI QUESTION INTELLIGENCE');
console.log('12 MANDATORY SPECIFICATION TESTS + AI PIPELINE AUDIT');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`PASS: [${testName}]`);
    if (detail) console.log(`      ${detail}`);
    passedTests++;
  } else {
    console.error(`FAIL: [${testName}]`);
    if (detail) console.error(`      Detail: ${detail}`);
  }
}

async function runAllTests() {
  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 1: Python -> Functions -> Test (min 10 verified, only Python Functions)
  // ─────────────────────────────────────────────────────────────────────────────
  const test1 = generateTopicTest('python', 'functions', 'Functions, *args & **kwargs', 'Mixed', 15, 15);
  assert(test1.questions.length >= 10, 'TEST 1: Python Functions has at least 10 verified questions', `Available: ${test1.questions.length}`);
  const test1Contaminated = test1.questions.filter(q => {
    const isPython = (q.programmingLanguage?.toLowerCase() === 'python' || q.skillId?.toLowerCase() === 'python');
    const isFunc = (q.topicId?.toLowerCase() === 'functions' || q.topic?.toLowerCase().includes('function'));
    return !isPython || !isFunc;
  });
  assert(test1Contaminated.length === 0, 'TEST 1: Zero cross-topic/cross-language contamination', `Contaminated: ${test1Contaminated.length}`);
  const test1HasUnrelated = test1.questions.some(q =>
    q.question.toLowerCase().includes('operating system') ||
    q.question.toLowerCase().includes('cpu scheduling') ||
    q.question.toLowerCase().includes('database')
  );
  assert(!test1HasUnrelated, 'TEST 1: Zero CPU/OS/DBMS questions present');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 2: Python -> Loops -> Test (only Python Loops)
  // ─────────────────────────────────────────────────────────────────────────────
  const test2 = generateFilteredAssessment({
    skillId: 'python',
    language: 'Python',
    topicId: 'loops',
    topic: 'While & For Loops',
    difficulty: 'Medium',
    count: 15
  });
  assert(test2.questions.length >= 10, 'TEST 2: Python Loops returned questions', `Found ${test2.questions.length} questions`);
  const test2AllLoops = test2.questions.every(q =>
    q.topicId?.toLowerCase() === 'loops' || q.topic?.toLowerCase().includes('loop')
  );
  assert(test2AllLoops, 'TEST 2: All returned questions strictly belong to Loops topic');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 3: Java -> Strings & String Methods -> Test (Direct user issue fix!)
  // ─────────────────────────────────────────────────────────────────────────────
  const test3 = generateTopicTest('java', 'strings', 'Strings & String Methods', 'Mixed', 15, 15);
  assert(test3.questions.length >= 10, 'TEST 3: Java Strings & String Methods has at least 10 verified questions', `Found ${test3.questions.length} questions`);
  const test3AllJavaStrings = test3.questions.every(q => {
    const isJava = q.programmingLanguage?.toLowerCase() === 'java' || q.skillId?.toLowerCase() === 'java';
    const isStrings = q.topicId?.toLowerCase() === 'strings' || q.topic?.toLowerCase().includes('string');
    return isJava && isStrings;
  });
  assert(test3AllJavaStrings, 'TEST 3: All returned questions strictly belong to Java Strings & String Methods');
  assert(test3.exactTopicLocked === true, 'TEST 3: Topic test is exact topic locked');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 4: Mechanical -> SolidWorks -> Test (only SolidWorks CAD)
  // ─────────────────────────────────────────────────────────────────────────────
  const test4 = generateDisciplineAssessment({
    domainId: 'mechanical',
    skillId: 'solidworks',
    topicId: 'sketching',
    count: 10
  });
  assert(test4.questions.length > 0, 'TEST 4: Mechanical SolidWorks returned questions', `Found ${test4.questions.length} questions`);
  const test4AllSolidWorks = test4.questions.every(q =>
    q.skillId?.toLowerCase() === 'solidworks' || q.skillName?.toLowerCase().includes('solidworks')
  );
  assert(test4AllSolidWorks, 'TEST 4: All returned questions are SolidWorks CAD questions');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 5: Civil -> Structural Analysis -> Test (only Structural Analysis)
  // ─────────────────────────────────────────────────────────────────────────────
  const test5 = generateDisciplineAssessment({
    domainId: 'civil',
    skillId: 'structural-analysis',
    count: 10
  });
  assert(test5.questions.length > 0, 'TEST 5: Civil Structural Analysis returned questions', `Found ${test5.questions.length} questions`);
  const test5AllCivil = test5.questions.every(q =>
    q.domainId?.toLowerCase() === 'civil' || q.skillId?.toLowerCase().includes('structural')
  );
  assert(test5AllCivil, 'TEST 5: All returned questions are Civil Structural Analysis questions');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 6: Electrical -> PLC -> Test (only PLC)
  // ─────────────────────────────────────────────────────────────────────────────
  const test6 = generateDisciplineAssessment({
    domainId: 'electrical',
    skillId: 'plc',
    count: 10
  });
  assert(test6.questions.length > 0, 'TEST 6: Electrical PLC returned questions', `Found ${test6.questions.length} questions`);
  const test6AllPLC = test6.questions.every(q =>
    q.domainId?.toLowerCase() === 'electrical' || q.skillId?.toLowerCase() === 'plc'
  );
  assert(test6AllPLC, 'TEST 6: All returned questions are Electrical PLC questions');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 7: Electronics -> Microcontrollers -> Test (only Microcontrollers)
  // ─────────────────────────────────────────────────────────────────────────────
  const test7 = generateDisciplineAssessment({
    domainId: 'electronics',
    skillId: 'microcontrollers',
    count: 10
  });
  assert(test7.questions.length > 0, 'TEST 7: Electronics Microcontrollers returned questions', `Found ${test7.questions.length} questions`);
  const test7AllEmbedded = test7.questions.every(q =>
    q.domainId?.toLowerCase() === 'electronics' || q.skillId?.toLowerCase().includes('microcontroller')
  );
  assert(test7AllEmbedded, 'TEST 7: All returned questions are Electronics Microcontroller questions');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 8: Insufficient pool: Available 10, Requested 15 -> Returns 10, Zero fallback
  // ─────────────────────────────────────────────────────────────────────────────
  const test8Filter = filterExactVerifiedQuestions({
    skillId: 'java',
    topicId: 'type-casting',
    topic: 'Type Casting'
  });
  const test8 = generateTopicTest('java', 'type-casting', 'Type Casting', 'Mixed', 15, 15);
  assert(test8.questions.length === test8Filter.availableCount, 'TEST 8: Returned exact verified count without padding', `Count: ${test8.questions.length}`);
  assert(test8.exactTopicLocked === true, 'TEST 8: exactTopicLocked flag is strictly enforced');
  const test8Contaminated = test8.questions.some(q => q.topicId !== 'type-casting');
  assert(!test8Contaminated, 'TEST 8: Zero unrelated fallback questions injected');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 9: Final Certification: Exactly 50 MCQs spanning full syllabus
  // ─────────────────────────────────────────────────────────────────────────────
  const test9 = generateFinalCertificationTest('python', 45);
  assert(test9.totalQuestions === 50, 'TEST 9: Final certification test generates exactly 50 MCQs', `Total: ${test9.totalQuestions}`);
  assert(test9.testMode === 'FINAL_CERTIFICATION', 'TEST 9: testMode is strictly FINAL_CERTIFICATION');

  const countEasy = test9.questions.filter(q => (q.difficulty || '').toLowerCase() === 'easy').length;
  const countMedium = test9.questions.filter(q => (q.difficulty || '').toLowerCase() === 'medium').length;
  const countHard = test9.questions.filter(q => (q.difficulty || '').toLowerCase() === 'hard').length;
  const countIndustry = test9.questions.filter(q => (q.difficulty || '').toLowerCase() === 'industry').length;

  assert(countEasy === 10, 'TEST 9: Exactly 10 Easy questions in 50-MCQ distribution', `Easy count: ${countEasy}`);
  assert(countMedium === 15, 'TEST 9: Exactly 15 Medium questions in 50-MCQ distribution', `Medium count: ${countMedium}`);
  assert(countHard === 15, 'TEST 9: Exactly 15 Hard questions in 50-MCQ distribution', `Hard count: ${countHard}`);
  assert(countIndustry === 10, 'TEST 9: Exactly 10 Industry questions in 50-MCQ distribution', `Industry count: ${countIndustry}`);

  const distinctTopicsInFinal = new Set(test9.questions.map(q => q.topicId || q.topic)).size;
  assert(distinctTopicsInFinal >= 5, 'TEST 9: Questions span across multiple syllabus topics', `Distinct topics: ${distinctTopicsInFinal}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 10: Final test 35/50 (70%) -> PASS, Certificate issued, Profile updated
  // ─────────────────────────────────────────────────────────────────────────────
  const student10 = 'test-student-pass-70';
  const mockSession10: AuthUserSession = {
    id: student10,
    email: 'ved.dhobi@gec.ac.in',
    role: 'student',
    full_name: 'Ved Dhobi',
    department: 'Computer Engineering',
    institution: 'Government Engineering College, Modasa (GEC Modasa)'
  };

  const finalExam10 = generateFinalCertificationTest('python', 45);
  const answers10: Record<string, number> = {};
  for (let i = 0; i < 35; i++) {
    const q = finalExam10.questions[i];
    answers10[q.id] = q.correctIndex;
  }
  for (let i = 35; i < 50; i++) {
    const q = finalExam10.questions[i];
    answers10[q.id] = (q.correctIndex + 1) % 4;
  }

  const report10 = await careerConnectService.submitStudentAssessment(
    finalExam10,
    answers10,
    [],
    mockSession10
  );

  assert(report10.percentage >= 70, 'TEST 10: Raw score achieves 70% threshold (35/50)', `Percentage: ${report10.percentage}%`);
  assert(report10.passed === true, 'TEST 10: Assessment report reports passed === true');

  const certs10 = await careerConnectService.getStudentCertificates(student10);
  assert(certs10.length > 0, 'TEST 10: Official CertificateRecord successfully generated and issued', `Certificates issued: ${certs10.length}`);
  assert(certs10[0].status === 'Valid', 'TEST 10: Issued Certificate status is Valid');
  assert(certs10[0].skillOrLanguage === 'Python', 'TEST 10: Certificate accredited for Python skill');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 11: Final test 34/50 (68%) -> FAIL, Zero certificate, No profile entry
  // ─────────────────────────────────────────────────────────────────────────────
  const student11 = 'test-student-fail-68';
  const mockSession11: AuthUserSession = {
    id: student11,
    email: 'fail.test@gec.ac.in',
    role: 'student',
    full_name: 'Candidate Fail Test',
    department: 'Computer Engineering',
    institution: 'Government Engineering College, Modasa (GEC Modasa)'
  };

  const finalExam11 = generateFinalCertificationTest('python', 45);
  const answers11: Record<string, number> = {};
  for (let i = 0; i < 34; i++) {
    const q = finalExam11.questions[i];
    answers11[q.id] = q.correctIndex;
  }
  for (let i = 34; i < 50; i++) {
    const q = finalExam11.questions[i];
    answers11[q.id] = (q.correctIndex + 1) % 4;
  }

  const report11 = await careerConnectService.submitStudentAssessment(
    finalExam11,
    answers11,
    [],
    mockSession11
  );

  assert(report11.percentage === 68 || report11.percentage < 70, 'TEST 11: Score of 34/50 correctly calculated below 70%', `Percentage: ${report11.percentage}%`);
  assert(report11.passed === false, 'TEST 11: Assessment report reports passed === false');

  const certs11 = await careerConnectService.getStudentCertificates(student11);
  assert(certs11.length === 0, 'TEST 11: ZERO certificates issued for failing assessment (Threshold enforced strictly)', `Certificates found: ${certs11.length}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 12: Python Final Test -> Zero CPU/DBMS/OS contamination
  // ─────────────────────────────────────────────────────────────────────────────
  const finalExam12 = generateFinalCertificationTest('python', 45);
  const test12Contaminated = finalExam12.questions.filter(q =>
    q.question.toLowerCase().includes('operating system') ||
    q.question.toLowerCase().includes('cpu scheduling') ||
    q.question.toLowerCase().includes('relational database')
  );
  assert(test12Contaminated.length === 0, 'TEST 12: Python Final test has ZERO CPU/DBMS/OS contamination');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 13: Autonomous AI Question Intelligence Engine Audit
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Canonical Taxonomy
  const taxonomy = resolveCanonicalTaxonomy('java', 'strings', 'Strings & String Methods');
  assert(taxonomy.domainId === 'programming', 'TEST 13A: Canonical Taxonomy resolves domainId correctly');
  assert(taxonomy.topicId === 'strings', 'TEST 13A: Canonical Taxonomy resolves topicId to canonical slug');

  // 2. Blueprint Engine
  const blueprint = createTopicBlueprint('java', 'strings', 'Strings & String Methods');
  assert(blueprint.coreConcepts.length >= 3, 'TEST 13B: Blueprint Engine generates core concepts');
  assert(blueprint.practicalTargetRatio === 0.9, 'TEST 13B: Blueprint enforces 90% practical target');

  // 3. Code Validator
  const validCode = validateCodeSnippet('String s = "test";\nSystem.out.println(s);', 'Java', 'test');
  assert(validCode.isValid && !validCode.hasSyntaxError, 'TEST 13C: Code Validator passes balanced Java code');
  const invalidCode = validateCodeSnippet('String s = "test";\nif (s.length() > 0 {', 'Java');
  assert(!invalidCode.isValid && invalidCode.hasSyntaxError, 'TEST 13C: Code Validator rejects unbalanced brackets');

  // 4. Duplicate Detector
  const dupPool = [
    { id: 'Q1', question: 'What is the output of String immutability in Java?', options: ['A','B','C','D'], correctIndex: 0, explanation: 'Test explanation here.', topicId: 'strings', verified: true, status: 'VERIFIED' as const, marks: 1, negativeMarks: 0 }
  ];
  const exactDup = checkDuplicateQuestion({ question: 'What is the output of String immutability in Java?' }, dupPool);
  assert(exactDup.isDuplicate && exactDup.duplicateType === 'exact', 'TEST 13D: Duplicate Detector catches exact duplicates');

  // 5. 15-Point Quality Gate
  const goodCandidate = {
    domainId: 'programming',
    skillId: 'java',
    programmingLanguage: 'Java',
    topicId: 'strings',
    topic: 'Strings & String Methods',
    difficulty: 'Medium' as const,
    questionType: 'code_output' as const,
    question: 'What is the exact output of evaluating String immutability in Java?',
    codeSnippet: 'String s = "A";\ns.concat("B");\nSystem.out.println(s);',
    options: ['A', 'AB', 'B', 'null'],
    correctIndex: 0,
    correctAnswer: 'A',
    explanation: 'String is immutable in Java; concat returns a new string which was ignored.',
    learningObjective: 'Understand String immutability.',
    marks: 1,
    negativeMarks: 0
  };
  const gateResult = runQualityGate(goodCandidate, blueprint, []);
  assert(gateResult.passed && gateResult.assignedStatus === 'VERIFIED', 'TEST 13E: Quality Gate validates compliant question to VERIFIED');

  // 6. Health Monitor
  const healthReport = auditTopicQuestionHealth('java', 'strings', test3.questions);
  assert(healthReport.verifiedCount >= 10, 'TEST 13F: Health Monitor reports verified question count >= 10', `Count: ${healthReport.verifiedCount}`);
  assert(healthReport.isSufficientForTopicTest === true, 'TEST 13F: Topic is marked sufficient for student tests');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 14: Strict 60% Practical / 40% Theoretical Ratio in Final Certification
  // ─────────────────────────────────────────────────────────────────────────────
  for (const lang of ['python', 'java', 'javascript', 'html', 'css']) {
    const finalCert = generateFinalCertificationTest(lang, 45);
    assert(finalCert.totalQuestions === 50, `TEST 14 [${lang.toUpperCase()}]: Final Certification generates exactly 50 MCQs`, `Total: ${finalCert.totalQuestions}`);
    const pracCount = finalCert.questions.filter(q => isPracticalQuestion(q)).length;
    const theoCount = finalCert.totalQuestions - pracCount;
    assert(pracCount === 30, `TEST 14 [${lang.toUpperCase()}]: Exactly 30 Practical (60%) questions`, `Practical: ${pracCount}/50 (${pracCount/50*100}%)`);
    assert(theoCount === 20, `TEST 14 [${lang.toUpperCase()}]: Exactly 20 Theoretical (40%) questions`, `Theoretical: ${theoCount}/50 (${theoCount/50*100}%)`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 15: Dynamic Question Rotation Across Test Retakes (Final Certification)
  // ─────────────────────────────────────────────────────────────────────────────
  careerConnectService.clearRecentQuestionIds('cert_python');
  const attempt1 = careerConnectService.generateFinalCertificationAssessment('python', 45);
  const attempt1Ids = new Set(attempt1.questions.map(q => q.id));

  const attempt2 = careerConnectService.generateFinalCertificationAssessment('python', 45);
  const attempt2Overlap = attempt2.questions.filter(q => attempt1Ids.has(q.id)).length;
  assert(attempt2Overlap === 0, 'TEST 15: Consecutive Final Certification attempts have ZERO overlapping questions', `Overlap: ${attempt2Overlap}/50 questions`);
  assert(attempt2.questions.length === 50, 'TEST 15: Second attempt generates full 50 MCQs', `Count: ${attempt2.questions.length}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 16: Strict 60% Practical / 40% Theoretical Ratio in Topic Tests
  // ─────────────────────────────────────────────────────────────────────────────
  const topic10 = generateTopicTest('python', 'functions', 'Functions, *args & **kwargs', 'Mixed', 15, 10);
  assert(topic10.questions.length === 10, 'TEST 16: Topic test of 10 questions returns exactly 10 questions', `Returned: ${topic10.questions.length}`);
  const prac10 = topic10.questions.filter(q => isPracticalQuestion(q)).length;
  const theo10 = topic10.questions.length - prac10;
  assert(prac10 === 6, 'TEST 16: 10-MCQ Topic test has exactly 6 Practical (60%) questions', `Practical: ${prac10}/10`);
  assert(theo10 === 4, 'TEST 16: 10-MCQ Topic test has exactly 4 Theoretical (40%) questions', `Theoretical: ${theo10}/10`);

  const topic15 = generateTopicTest('python', 'functions', 'Functions, *args & **kwargs', 'Mixed', 15, 15);
  assert(topic15.questions.length === 15, 'TEST 16: Topic test of 15 questions returns exactly 15 questions', `Returned: ${topic15.questions.length}`);
  const prac15 = topic15.questions.filter(q => isPracticalQuestion(q)).length;
  const theo15 = topic15.questions.length - prac15;
  assert(prac15 === 9, 'TEST 16: 15-MCQ Topic test has exactly 9 Practical (60%) questions', `Practical: ${prac15}/15`);
  assert(theo15 === 6, 'TEST 16: 15-MCQ Topic test has exactly 6 Theoretical (40%) questions', `Theoretical: ${theo15}/15`);

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 17: Dynamic Question Rotation in Topic Practice Tests
  // ─────────────────────────────────────────────────────────────────────────────
  careerConnectService.clearRecentQuestionIds('topic_python_functions');
  const topicAttempt1 = careerConnectService.generateTopicAssessment('python', 'functions', 'Functions, *args & **kwargs', 'Mixed', 15, 10);
  const topicAttempt1Ids = new Set(topicAttempt1.questions.map(q => q.id));

  const topicAttempt2 = careerConnectService.generateTopicAssessment('python', 'functions', 'Functions, *args & **kwargs', 'Mixed', 15, 10);
  const topicOverlap = topicAttempt2.questions.filter(q => topicAttempt1Ids.has(q.id)).length;
  assert(topicOverlap < 10, 'TEST 17: Consecutive Topic Tests dynamically rotate and do NOT present the identical test', `New fresh questions introduced: ${10 - topicOverlap}`);
  assert(topicAttempt2.questions.length === 10, 'TEST 17: Second attempt returns full question count', `Count: ${topicAttempt2.questions.length}`);

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
