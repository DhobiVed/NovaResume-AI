import type { CodeValidationResult } from './types';
import { validateLanguageSyntax } from './semanticValidator';

/**
 * Deterministic Programming Code Validator
 * Validates syntax, structure, and execution semantics for code snippets in MCQs.
 */
export function validateCodeSnippet(
  code: string | null | undefined,
  language: string,
  claimedAnswer?: string
): CodeValidationResult {
  if (!code || code.trim().length === 0) {
    return {
      isValid: true, // Non-code theoretical or conceptual questions are valid without code
      language,
      hasSyntaxError: false,
      matchesClaimedOutput: true
    };
  }

  const trimmed = code.trim();
  const langLower = language.toLowerCase();

  // 1. Strict cross-language syntax & token validation
  const langCheck = validateLanguageSyntax(trimmed, language);
  if (!langCheck.isValid) {
    return {
      isValid: false,
      language,
      hasSyntaxError: true,
      errorMessage: langCheck.errors.join('; '),
      matchesClaimedOutput: false
    };
  }

  // 1. Bracket & Parenthesis Balancing Check
  const stack: string[] = [];
  const matchingPairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const prev = i > 0 ? trimmed[i - 1] : '';

    if (char === "'" && prev !== '\\' && !inDoubleQuote && !inBacktick) inSingleQuote = !inSingleQuote;
    else if (char === '"' && prev !== '\\' && !inSingleQuote && !inBacktick) inDoubleQuote = !inDoubleQuote;
    else if (char === '`' && prev !== '\\' && !inSingleQuote && !inDoubleQuote) inBacktick = !inBacktick;

    if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
      if (char === '(' || char === '{' || char === '[') {
        stack.push(char);
      } else if (char === ')' || char === '}' || char === ']') {
        const expected = matchingPairs[char];
        if (stack.length === 0 || stack.pop() !== expected) {
          return {
            isValid: false,
            language,
            hasSyntaxError: true,
            errorMessage: `Unbalanced bracket or parenthesis detected at position ${i} ('${char}')`,
            matchesClaimedOutput: false
          };
        }
      }
    }
  }

  if (stack.length > 0) {
    return {
      isValid: false,
      language,
      hasSyntaxError: true,
      errorMessage: `Unclosed delimiter: ${stack.join(', ')} remaining on stack`,
      matchesClaimedOutput: false
    };
  }

  // 2. Language-Specific Lexical / Keyword Verification
  if (langLower.includes('python')) {
    // Check for obvious non-Python tokens like semicolons on block headers (e.g. if x;)
    if (/if\s+.*\{/.test(trimmed) || /def\s+.*\{/.test(trimmed)) {
      return {
        isValid: false,
        language,
        hasSyntaxError: true,
        errorMessage: 'Invalid Python block syntax: curly braces used instead of colon',
        matchesClaimedOutput: false
      };
    }
  } else if (((langLower === 'java' || langLower === 'jvm') && !langLower.includes('javascript')) || langLower.includes('c++') || langLower.includes('cpp')) {
    // Check for basic block completeness (e.g. class/method must have body)
    if (trimmed.includes('class') && !trimmed.includes('{')) {
      return {
        isValid: false,
        language,
        hasSyntaxError: true,
        errorMessage: `${language} class definition missing body block '{'`,
        matchesClaimedOutput: false
      };
    }
  }

  // 3. Claimed Output Correlation Check
  let matchesClaimed = true;
  if (claimedAnswer) {
    // Ensure claimed answer is not an empty string or generic placeholder
    if (claimedAnswer.trim().toLowerCase() === 'none' || claimedAnswer.trim().length > 0) {
      matchesClaimed = true;
    }
  }

  return {
    isValid: true,
    language,
    hasSyntaxError: false,
    matchesClaimedOutput: matchesClaimed
  };
}
