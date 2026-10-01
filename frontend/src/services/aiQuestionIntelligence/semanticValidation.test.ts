import { validateSemanticIntegrity } from './semanticValidator';
import type { BankQuestion } from '../../types/careerConnect';

console.log('Running Semantic Code & Construct Intelligence Tests...\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    if (detail) console.error(`       Detail: ${detail}`);
    failCount++;
  }
}

// 1. Acceptance Test 1: If-Else topic with JavaScript for-loop (from user screenshot) -> MUST REJECT
const corruptUserScreenshotQuestion1: Partial<BankQuestion> = {
  id: 'JAVA-COND-H-6',
  skillId: 'java',
  skillName: 'Java',
  programmingLanguage: 'Java',
  topicId: 'conditions',
  topicName: 'If...Else & Switch Statements',
  question: 'In a high-load Java application utilizing If...Else & Switch Statements, why might the following construct trigger unexpected behavior or performance degradation?',
  codeSnippet: '// Java performance check for If...Else & Switch Statements\nfor (let i = 0; i < collection.length; i++) {\n    performAllocation(collection[i]);\n}',
  options: ['Repeated allocations', 'Overflow', 'Lock', 'Fork'],
  correctIndex: 0,
  correctAnswer: 'Repeated allocations'
};

const res1 = validateSemanticIntegrity(corruptUserScreenshotQuestion1, 'java', 'If...Else & Switch Statements');
assert(!res1.isValid, 'Corrupt Screenshot 1 (JS for-loop in Java If-Else) is REJECTED');
assert(!res1.isLanguageMatch, 'Language mismatch detected for JavaScript let in Java');
assert(!res1.isConstructMatch, 'Construct mismatch detected: loop in if-else topic');

// 2. Acceptance Test 2: If-Else topic with Java for-loop without conditional -> MUST REJECT
const javaLoopInIfElse: Partial<BankQuestion> = {
  id: 'JAVA-COND-H-LOOP',
  skillId: 'java',
  skillName: 'Java',
  programmingLanguage: 'Java',
  topicId: 'conditions',
  topicName: 'If...Else & Switch Statements',
  question: 'What is the outcome of iterating over this array?',
  codeSnippet: 'int[] arr = {1, 2, 3};\nfor (int i = 0; i < arr.length; i++) {\n    System.out.println(arr[i]);\n}',
  options: ['1 2 3', '0', 'Error', 'None'],
  correctIndex: 0,
  correctAnswer: '1 2 3'
};

const res2 = validateSemanticIntegrity(javaLoopInIfElse, 'java', 'If...Else & Switch Statements');
assert(!res2.isValid, 'Java bare for-loop in If-Else topic is REJECTED for construct mismatch');
assert(!res2.isConstructMatch, 'Construct mismatch confirmed: LOOP without CONDITIONAL');

// 3. Acceptance Test 3: If-Else topic with authentic Java conditional branching -> MUST ACCEPT
const validJavaIfElse: Partial<BankQuestion> = {
  id: 'JAVA-COND-M-1',
  skillId: 'java',
  skillName: 'Java',
  programmingLanguage: 'Java',
  topicId: 'conditions',
  topicName: 'If...Else & Switch Statements',
  question: 'What is the output of the following nested conditional block in Java?',
  codeSnippet: 'int score = 85;\nString grade;\nif (score >= 90) {\n    grade = "A";\n} else if (score >= 80) {\n    grade = "B";\n} else {\n    grade = "C";\n}\nSystem.out.println(grade);',
  options: ['B', 'A', 'C', 'Compile Error'],
  correctIndex: 0,
  correctAnswer: 'B'
};

const res3 = validateSemanticIntegrity(validJavaIfElse, 'java', 'If...Else & Switch Statements');
assert(res3.isValid, 'Authentic Java If-Else snippet is ACCEPTED');
assert(res3.isLanguageMatch, 'Java syntax matches');
assert(res3.isConstructMatch, 'CONDITIONAL construct correctly matches topic');

// 4. Acceptance Test 4: Java question with JS Number.MAX_SAFE_INTEGER (Screenshot 2) -> MUST REJECT
const corruptUserScreenshotQuestion2: Partial<BankQuestion> = {
  id: 'JAVA-COND-H-8',
  skillId: 'java',
  skillName: 'Java',
  programmingLanguage: 'Java',
  topicId: 'conditions',
  topicName: 'If...Else & Switch Statements',
  question: 'What subtle edge-case behavior occurs when boundary limits are exceeded in Java for If...Else & Switch Statements?',
  codeSnippet: '// Boundary evaluation for If...Else & Switch Statements\nconst boundary = Number.MAX_SAFE_INTEGER || 2147483647;\nconst result = boundary + 1 === boundary + 2;',
  options: ['Overflow', 'SIGSEGV', 'Warning', 'Reset'],
  correctIndex: 0,
  correctAnswer: 'Overflow'
};

const res4 = validateSemanticIntegrity(corruptUserScreenshotQuestion2, 'java', 'If...Else & Switch Statements');
assert(!res4.isValid, 'Corrupt Screenshot 2 (JS const & Number.MAX_SAFE_INTEGER in Java) is REJECTED');
assert(!res4.isLanguageMatch, 'Language mismatch detected for const and Number.MAX_SAFE_INTEGER');

// 5. Acceptance Test 5: Java question with genuine Java Integer.MAX_VALUE and conditions -> MUST ACCEPT
const validJavaBoundary: Partial<BankQuestion> = {
  id: 'JAVA-COND-H-BOUND',
  skillId: 'java',
  skillName: 'Java',
  programmingLanguage: 'Java',
  topicId: 'conditions',
  topicName: 'If...Else & Switch Statements',
  question: 'What is the output when an integer exceeds Integer.MAX_VALUE in Java?',
  codeSnippet: 'int boundary = Integer.MAX_VALUE;\nint result = boundary + 1;\nif (result < boundary) {\n    System.out.println("Wrapped to negative");\n} else {\n    System.out.println("Remained positive");\n}',
  options: ['Wrapped to negative', 'Remained positive', 'ArithmeticException', 'Compile Error'],
  correctIndex: 0,
  correctAnswer: 'Wrapped to negative'
};

const res5 = validateSemanticIntegrity(validJavaBoundary, 'java', 'If...Else & Switch Statements');
assert(res5.isValid, 'Genuine Java boundary test with conditional is ACCEPTED');

// 6. Acceptance Test 6: Python question with Java syntax -> MUST REJECT
const invalidPythonQuestion: Partial<BankQuestion> = {
  id: 'PY-FAIL-1',
  skillId: 'python',
  skillName: 'Python',
  programmingLanguage: 'Python',
  topicId: 'syntax-intro',
  topicName: 'Syntax, Indentation & Comments',
  question: 'What does this program print?',
  codeSnippet: 'public static void main(String[] args) {\n    System.out.println("Hello");\n}',
  options: ['Hello', 'None', 'Error', '0'],
  correctIndex: 0,
  correctAnswer: 'Hello'
};

const res6 = validateSemanticIntegrity(invalidPythonQuestion, 'python', 'Syntax, Indentation & Comments');
assert(!res6.isValid, 'Python question with Java keywords is REJECTED');
assert(!res6.isLanguageMatch, 'Language mismatch caught (public static void in Python)');

// 7. Acceptance Test 7: Python question with authentic Python syntax -> MUST ACCEPT
const validPythonQuestion: Partial<BankQuestion> = {
  id: 'PY-PASS-1',
  skillId: 'python',
  skillName: 'Python',
  programmingLanguage: 'Python',
  topicId: 'conditions',
  topicName: 'If, Elif & Else Conditions',
  question: 'What is printed when evaluating this conditional expression in Python?',
  codeSnippet: 'score = 75\nif score >= 90:\n    res = "Distinction"\nelif score >= 60:\n    res = "First Class"\nelse:\n    res = "Pass"\nprint(res)',
  options: ['First Class', 'Distinction', 'Pass', 'SyntaxError'],
  correctIndex: 0,
  correctAnswer: 'First Class'
};

const res7 = validateSemanticIntegrity(validPythonQuestion, 'python', 'If, Elif & Else Conditions');
assert(res7.isValid, 'Authentic Python if-elif snippet is ACCEPTED');

// 8. Acceptance Test 8: SQL question with JS loop -> MUST REJECT
const invalidSqlQuestion: Partial<BankQuestion> = {
  id: 'SQL-FAIL-1',
  skillId: 'sql',
  skillName: 'SQL',
  programmingLanguage: 'SQL',
  topicId: 'select-queries',
  topicName: 'SELECT Queries',
  question: 'How do you query users?',
  codeSnippet: 'for (let i = 0; i < users.length; i++) { console.log(users[i]); }',
  options: ['Loop', 'Select', 'None', 'Error'],
  correctIndex: 0,
  correctAnswer: 'Loop'
};

const res8 = validateSemanticIntegrity(invalidSqlQuestion, 'sql', 'SELECT Queries');
assert(!res8.isValid, 'SQL question with JS loop is REJECTED');

// 9. Acceptance Test 9: SQL question with authentic declarative SQL -> MUST ACCEPT
const validSqlQuestion: Partial<BankQuestion> = {
  id: 'SQL-PASS-1',
  skillId: 'sql',
  skillName: 'SQL',
  programmingLanguage: 'SQL',
  topicId: 'select-queries',
  topicName: 'SELECT Queries',
  question: 'Which query retrieves all active employees with a salary exceeding 50000?',
  codeSnippet: 'SELECT employee_id, full_name, department\nFROM employees\nWHERE is_active = 1 AND salary > 50000;',
  options: [
    'SELECT employee_id, full_name, department FROM employees WHERE is_active = 1 AND salary > 50000;',
    'FIND ALL FROM employees WHERE salary > 50000',
    'FILTER employees BY salary > 50000',
    'GET employees WHERE salary > 50000'
  ],
  correctIndex: 0,
  correctAnswer: 'SELECT employee_id, full_name, department FROM employees WHERE is_active = 1 AND salary > 50000;'
};

const res9 = validateSemanticIntegrity(validSqlQuestion, 'sql', 'SELECT Queries');
assert(res9.isValid, 'Authentic declarative SQL query is ACCEPTED');

// 10. Acceptance Test 10: Assembly question with corrupt JS boilerplate (User's exact reported screenshot) -> MUST REJECT
const corruptAssemblyScreenshotQuestion: Partial<BankQuestion> = {
  id: 'ASSEMBLY-X86-REGISTERS-H-6',
  skillId: 'assembly',
  skillName: 'Assembly',
  programmingLanguage: 'Assembly',
  topicId: 'x86-registers',
  topicName: 'x86-64 Registers & Machine Instructions',
  question: 'In a high-load Assembly application utilizing x86-64 Registers & Machine Instructions, why might the following routine cause significant runtime degradation?',
  codeSnippet: '// Assembly performance check for x86-64 Registers & Machine Instructions\nfor (let i = 0; i < collection.length; i++) {\n  performAllocation(collection[i]);\n}',
  options: [
    'Repeated allocations inside a hot loop cause severe garbage collection / memory fragmentation overhead.',
    'The loop index counter overflows signed 16-bit registers on every modern CPU.',
    'Stack frames are destroyed by tail-call recursion.',
    'Register RAX is cleared by kernel interrupts.'
  ],
  correctIndex: 0,
  correctAnswer: 'Repeated allocations inside a hot loop cause severe garbage collection / memory fragmentation overhead.'
};

const res10 = validateSemanticIntegrity(corruptAssemblyScreenshotQuestion, 'assembly', 'x86-64 Registers & Machine Instructions');
assert(!res10.isValid, 'Corrupt Assembly question with JS for-loop & performAllocation is REJECTED');
assert(!res10.isLanguageMatch, 'Language mismatch detected: JS boilerplate forbidden in Assembly');

// 11. Acceptance Test 11: Authentic x86-64 Assembly question -> MUST ACCEPT
const validAssemblyQuestion: Partial<BankQuestion> = {
  id: 'ASSEMBLY-X86-REGISTERS-E-1',
  skillId: 'assembly',
  skillName: 'Assembly',
  programmingLanguage: 'Assembly',
  topicId: 'x86-registers',
  topicName: 'x86-64 Registers & Machine Instructions',
  question: 'In x86-64 architecture, what happens to the upper 32 bits of a 64-bit general-purpose register (e.g. RAX) when a 32-bit sub-register instruction such as "MOV EAX, 1" executes?',
  codeSnippet: 'mov eax, 1',
  options: [
    'The upper 32 bits of RAX are automatically zero-extended (cleared to 0).',
    'The upper 32 bits of RAX retain their previous values unchanged.',
    'The instruction causes a General Protection Fault (#GP) in 64-bit mode.',
    'The upper 32 bits are sign-extended from bit 31 of EAX.'
  ],
  correctIndex: 0,
  correctAnswer: 'The upper 32 bits of RAX are automatically zero-extended (cleared to 0).'
};

const res11 = validateSemanticIntegrity(validAssemblyQuestion, 'assembly', 'x86-64 Registers & Machine Instructions');
assert(res11.isValid, 'Authentic x86-64 Assembly question is ACCEPTED');
assert(res11.isLanguageMatch, 'x86-64 Assembly instructions recognized and validated');

console.log(`\n========================================`);
console.log(`Summary: ${passCount} Passed, ${failCount} Failed`);
console.log(`========================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('All Semantic Acceptance Tests PASSED successfully!');
}

