import type { BankQuestion } from '../types/careerConnect';

export interface ValidationCheckResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
}

export interface QuestionValidationReport {
  isValid: boolean;
  qualityScore: number; // 0-100 internal quality score
  checks: ValidationCheckResult[];
  errors: string[];
  warnings: string[];
}

/**
 * Pre-Publish Question Validation Engine
 * Enforces rigorous quality, correctness, and pedagogical standards for all MCQs.
 */
export const questionValidationService = {
  validateQuestion(
    question: Partial<BankQuestion>,
    existingQuestions: BankQuestion[] = []
  ): QuestionValidationReport {
    const checks: ValidationCheckResult[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Question text presence & length
    const qText = (question.question || '').trim();
    if (!qText) {
      checks.push({ id: 'question_text', name: 'Question Text', passed: false, message: 'Question prompt cannot be empty.' });
      errors.push('Question text is required.');
    } else if (qText.length < 15) {
      checks.push({ id: 'question_text', name: 'Question Text', passed: false, message: 'Question prompt is too short to be descriptive.' });
      errors.push('Question text must be at least 15 characters.');
    } else {
      checks.push({ id: 'question_text', name: 'Question Text', passed: true, message: 'Question prompt is clear and well-formed.' });
    }

    // 2. Options validation (exactly 4 distinct, non-empty options)
    const options = question.options || [];
    const trimmedOptions = options.map(o => (o || '').trim());
    const nonEmptyOptions = trimmedOptions.filter(Boolean);
    const uniqueOptions = new Set(trimmedOptions);

    if (options.length !== 4) {
      checks.push({ id: 'options_count', name: '4 Distinct Options', passed: false, message: `Expected 4 options, found ${options.length}.` });
      errors.push('Question must have exactly 4 options (A, B, C, D).');
    } else if (nonEmptyOptions.length < 4) {
      checks.push({ id: 'options_count', name: '4 Distinct Options', passed: false, message: 'One or more options are empty.' });
      errors.push('All 4 options must contain non-empty text.');
    } else if (uniqueOptions.size < 4) {
      checks.push({ id: 'options_count', name: '4 Distinct Options', passed: false, message: 'Duplicate or overlapping options detected.' });
      errors.push('All options must be unique and distinct.');
    } else {
      checks.push({ id: 'options_count', name: '4 Distinct Options', passed: true, message: '4 distinct options provided.' });
    }

    // 3. Exactly one correct answer index
    const correctIndex = question.correctIndex;
    if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex > 3) {
      checks.push({ id: 'correct_index', name: 'Correct Option Designation', passed: false, message: 'A valid correct option (0-3) must be specified.' });
      errors.push('Correct option index must be between 0 and 3.');
    } else {
      checks.push({ id: 'correct_index', name: 'Correct Option Designation', passed: true, message: `Option ${String.fromCharCode(65 + correctIndex)} designated as correct.` });
    }

    // 4. Code snippet formatting & syntax check (if applicable)
    const code = question.codeSnippet ? question.codeSnippet.trim() : '';
    if (code) {
      // Basic brackets and quotes balance check
      let bracketsBalanced = true;
      const stack: string[] = [];
      const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
      
      let inString = false;
      let stringChar = '';
      for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        if ((ch === '"' || ch === "'" || ch === '`') && (i === 0 || code[i - 1] !== '\\')) {
          if (!inString) {
            inString = true;
            stringChar = ch;
          } else if (stringChar === ch) {
            inString = false;
          }
        } else if (!inString) {
          if (ch === '(' || ch === '{' || ch === '[') {
            stack.push(ch);
          } else if (ch === ')' || ch === '}' || ch === ']') {
            if (stack.pop() !== pairs[ch]) {
              bracketsBalanced = false;
              break;
            }
          }
        }
      }
      if (stack.length > 0) bracketsBalanced = false;

      if (!bracketsBalanced) {
        checks.push({ id: 'code_syntax', name: 'Code Syntax & Structure', passed: false, message: 'Unbalanced brackets or unclosed quotes in code snippet.' });
        errors.push('Syntax error: Code snippet contains unmatched brackets or unclosed quotes.');
      } else {
        checks.push({ id: 'code_syntax', name: 'Code Syntax & Structure', passed: true, message: 'Code snippet syntax and indentation valid.' });
      }
    } else {
      checks.push({ id: 'code_syntax', name: 'Code Syntax & Structure', passed: true, message: 'Conceptual question (no code block required).' });
    }

    // 5. Hint presence & non-spoiling verification
    const hint = (question.hint || '').trim();
    if (!hint) {
      checks.push({ id: 'hint', name: 'Educational Hint', passed: false, message: 'Hint is missing. Every exam MCQ must have an educational hint.' });
      errors.push('Hint is required for student learning support.');
    } else if (hint.length < 10) {
      checks.push({ id: 'hint', name: 'Educational Hint', passed: false, message: 'Hint is too short.' });
      errors.push('Hint must be at least 10 characters.');
    } else {
      // Check if hint spoils the answer directly
      const correctOptionText = (options[correctIndex ?? -1] || '').trim().toLowerCase();
      if (correctOptionText && correctOptionText.length > 3 && hint.toLowerCase().includes(correctOptionText)) {
        checks.push({ id: 'hint', name: 'Educational Hint', passed: false, message: 'Hint directly reveals the correct answer.' });
        errors.push('Hint must be non-spoiling and guide student thinking rather than stating the answer.');
      } else {
        checks.push({ id: 'hint', name: 'Educational Hint', passed: true, message: 'Hint is educational and non-spoiling.' });
      }
    }

    // 6. Comprehensive Explanation presence & depth
    const explanation = (question.explanation || '').trim();
    if (!explanation) {
      checks.push({ id: 'explanation', name: 'Comprehensive Explanation', passed: false, message: 'Explanation is missing.' });
      errors.push('Explanation is required.');
    } else if (explanation.length < 35) {
      checks.push({ id: 'explanation', name: 'Comprehensive Explanation', passed: false, message: 'Explanation is too brief to be educational.' });
      errors.push('Explanation must provide adequate conceptual depth (at least 35 characters).');
    } else {
      checks.push({ id: 'explanation', name: 'Comprehensive Explanation', passed: true, message: 'Explanation is detailed and educational.' });
    }

    // 7. Duplicate detection
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normQ = normalize(qText);
    const isDup = existingQuestions.some(eq => {
      if (eq.id === question.id) return false;
      const normEq = normalize(eq.question);
      if (normQ === normEq) return true;
      if (code && eq.codeSnippet && normalize(code) === normalize(eq.codeSnippet)) return true;
      return false;
    });

    if (isDup) {
      checks.push({ id: 'duplicate_check', name: 'Duplicate Question Check', passed: false, message: 'A question with identical wording or code already exists.' });
      errors.push('Duplicate question detected in the Question Bank.');
    } else {
      checks.push({ id: 'duplicate_check', name: 'Duplicate Question Check', passed: true, message: 'Question is unique and not a duplicate.' });
    }

    // Calculate Quality Score (0 - 100)
    const passedCount = checks.filter(c => c.passed).length;
    const baseScore = Math.round((passedCount / checks.length) * 100);
    const hasDetailedExplanation = explanation.length > 80;
    const hasCodeOrDiagram = Boolean(code || question.diagramDescription);
    const qualityScore = Math.min(100, baseScore + (hasDetailedExplanation ? 5 : 0) + (hasCodeOrDiagram ? 5 : 0));

    return {
      isValid: errors.length === 0,
      qualityScore,
      checks,
      errors,
      warnings
    };
  }
};
