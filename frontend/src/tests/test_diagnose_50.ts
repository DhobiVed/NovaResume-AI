import { generateDisciplineAssessment, filterMultiDisciplinaryPool } from '../data/multiDisciplinaryQuestionBank';
import { generateFinalCertificationTest, generateTopicTest, filterExactVerifiedQuestions, getQuestionBankBySkill, feedLanguageIntoQuestionBank } from '../data/question-bank';
import { generate50QuestionTest } from '../data/questionBank';
import { loadLanguageQuestions } from '../data/question-bank/datasetLoader';

async function run() {
  console.log('=== TEST 1: generate50QuestionTest(python, Mixed, 45) ===');
  const t1 = generate50QuestionTest('python', 'Mixed', 45);
  console.log('t1 total questions:', t1?.questions?.length);

  console.log('=== TEST 2: generateFinalCertificationTest(python, 45) ===');
  const t2 = generateFinalCertificationTest('python', 45);
  console.log('t2 total questions:', t2?.questions?.length);

  console.log('=== TEST 3: generateDisciplineAssessment(python, All topics, count 50) ===');
  const t3 = generateDisciplineAssessment({
    domainId: 'cs_it',
    skillId: 'python',
    language: 'Python',
    moduleId: undefined,
    topicId: 'All',
    difficulty: 'Mixed',
    durationMinutes: 45,
    count: 50
  });
  console.log('t3 total questions:', t3?.questions?.length, 'availableCount:', t3?.availableCount);

  console.log('=== TEST 4: generateDisciplineAssessment(python, topic: functions, count 50) ===');
  const t4 = generateDisciplineAssessment({
    domainId: 'cs_it',
    skillId: 'python',
    language: 'Python',
    moduleId: undefined,
    topicId: 'functions',
    difficulty: 'Mixed',
    durationMinutes: 45,
    count: 50
  });
  console.log('t4 total questions:', t4?.questions?.length, 'availableCount:', t4?.availableCount);

  console.log('=== TEST 5: generateDisciplineAssessment(solidworks, All topics, count 50) ===');
  const t5 = generateDisciplineAssessment({
    domainId: 'mechanical',
    skillId: 'solidworks',
    language: 'SolidWorks',
    moduleId: undefined,
    topicId: 'All',
    difficulty: 'Mixed',
    durationMinutes: 45,
    count: 50
  });
  console.log('t5 total questions:', t5?.questions?.length, 'availableCount:', t5?.availableCount);

  console.log('=== TEST 6: After loading 2000 MCQs for python ===');
  const loadedPy = await loadLanguageQuestions('python');
  console.log('Loaded python MCQs count:', loadedPy.length);
  feedLanguageIntoQuestionBank('python', loadedPy);

  const t6 = generateDisciplineAssessment({
    domainId: 'cs_it',
    skillId: 'python',
    language: 'Python',
    moduleId: undefined,
    topicId: 'All',
    difficulty: 'Mixed',
    durationMinutes: 45,
    count: 50
  });
  console.log('t6 total questions:', t6?.questions?.length, 'availableCount:', t6?.availableCount);

  console.log('=== TEST 7: generateDisciplineAssessment(c++, All topics, count 50) ===');
  const t7 = generateDisciplineAssessment({
    domainId: 'cs_it',
    skillId: 'cpp',
    language: 'C++',
    moduleId: undefined,
    topicId: 'All',
    difficulty: 'Mixed',
    durationMinutes: 45,
    count: 50
  });
  console.log('t7 total questions:', t7?.questions?.length, 'availableCount:', t7?.availableCount);
}

run().catch(console.error);
