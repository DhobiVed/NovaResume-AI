import type { BankQuestion } from '../../types/careerConnect';

export interface SemanticValidationResult {
  isValid: boolean;
  status: 'VERIFIED' | 'QUARANTINED' | 'REJECTED';
  reasons: string[];
  detectedLanguage?: string;
  detectedConstructs: string[];
  expectedConstructs: string[];
  isLanguageMatch: boolean;
  isConstructMatch: boolean;
}

/**
 * Normalized token patterns for language syntax detection.
 */
interface LanguageRules {
  forbiddenTokens: RegExp[];
  forbiddenTokenDescriptions: string[];
  allowedPatterns: RegExp[];
}

const LANGUAGE_RULES: Record<string, LanguageRules> = {
  java: {
    forbiddenTokens: [
      /\bconsole\.log\s*\(/i,
      /\blet\s+[a-zA-Z_$]/,
      /\bconst\s+[a-zA-Z_$]/,
      /\bvar\s+[a-zA-Z_$]/,
      /===/,
      /!==/,
      /\bNumber\.MAX_SAFE_INTEGER\b/,
      /\bNumber\.MIN_SAFE_INTEGER\b/,
      /\bdef\s+[a-zA-Z_]/,
      /\belif\b/,
      /\bstd::/i,
      /#include\s*</,
      /\bfmt\.Print/,
      /\bfn\s+[a-zA-Z_]/,
      /\bSELECT\s+.+\s+FROM\s+/i
    ],
    forbiddenTokenDescriptions: [
      'JavaScript console.log() is invalid in Java',
      'JavaScript let declaration is invalid in Java (use typed declaration like int, String)',
      'JavaScript const declaration is invalid in Java (use final Type)',
      'Untyped var declaration without type context is discouraged/invalid here',
      'JavaScript strict equality operator (===) is invalid in Java (use == or .equals())',
      'JavaScript strict inequality operator (!==) is invalid in Java (use != or !.equals())',
      'JavaScript Number.MAX_SAFE_INTEGER is invalid in Java (use Integer.MAX_VALUE or Long.MAX_VALUE)',
      'JavaScript Number.MIN_SAFE_INTEGER is invalid in Java (use Integer.MIN_VALUE or Long.MIN_VALUE)',
      'Python def keyword is invalid in Java',
      'Python elif keyword is invalid in Java (use else if)',
      'C++ std:: namespace is invalid in Java',
      'C++ #include preprocessor directive is invalid in Java (use import)',
      'Go fmt.Print is invalid in Java',
      'Rust fn keyword is invalid in Java',
      'Raw SQL query detected where Java code expected'
    ],
    allowedPatterns: [
      /\bSystem\.out\.(println|print|printf)\b/,
      /\b(public|private|protected|static|final|class|interface|enum|void|int|double|float|long|short|byte|char|boolean|String)\b/,
      /\bnew\s+[A-Z][a-zA-Z0-9_]*\s*\(/,
      /;\s*$/m
    ]
  },
  cpp: {
    forbiddenTokens: [
      /\bconsole\.log\s*\(/i,
      /\bSystem\.out\./,
      /\bpublic\s+static\s+void\s+main\b/,
      /===/,
      /!==/,
      /\bNumber\.MAX_SAFE_INTEGER\b/,
      /\bdef\s+[a-zA-Z_]/,
      /\belif\b/,
      /\bSELECT\s+.+\s+FROM\s+/i
    ],
    forbiddenTokenDescriptions: [
      'JavaScript console.log() is invalid in C++',
      'Java System.out is invalid in C++ (use std::cout)',
      'Java public static void main signature is invalid in C++ (use int main())',
      'JavaScript strict equality (===) is invalid in C++',
      'JavaScript strict inequality (!==) is invalid in C++',
      'JavaScript Number.MAX_SAFE_INTEGER is invalid in C++',
      'Python def keyword is invalid in C++',
      'Python elif keyword is invalid in C++',
      'Raw SQL query detected where C++ code expected'
    ],
    allowedPatterns: [
      /#include/,
      /\bstd::/,
      /\b(cout|cin|endl)\b/,
      /\b(int|float|double|char|bool|void|auto|const|struct|class|template|nullptr)\b/,
      /;\s*$/m
    ]
  },
  python: {
    forbiddenTokens: [
      /\bconsole\.log\s*\(/i,
      /\bSystem\.out\./,
      /\bpublic\s+static\s+void\b/,
      /\bpublic\s+class\b/,
      /#include\s*</,
      /\bstd::/,
      /\blet\s+[a-zA-Z_$]/,
      /\bconst\s+[a-zA-Z_$]/,
      /===/,
      /!==/,
      /;\s*$/m,
      /\bfunction\s+[a-zA-Z_]/
    ],
    forbiddenTokenDescriptions: [
      'JavaScript console.log() is invalid in Python (use print())',
      'Java System.out is invalid in Python (use print())',
      'Java public static void is invalid in Python',
      'Java public class is invalid in Python',
      'C++ #include is invalid in Python',
      'C++ std:: is invalid in Python',
      'JavaScript let declaration is invalid in Python',
      'JavaScript const declaration is invalid in Python',
      'Strict equality (===) is invalid in Python (use == or is)',
      'Strict inequality (!==) is invalid in Python (use != or is not)',
      'Trailing semicolons terminating Python lines are unidiomatic / invalid',
      'JavaScript function keyword is invalid in Python (use def)'
    ],
    allowedPatterns: [
      /\b(def|class|if|elif|else|for|while|import|from|return|yield|try|except|finally|raise|pass|lambda)\b/,
      /\bprint\s*\(/,
      /:\s*$/m
    ]
  },
  sql: {
    forbiddenTokens: [
      /\bconsole\.log\s*\(/i,
      /\bSystem\.out\./,
      /\blet\s+[a-zA-Z_$]/,
      /\bconst\s+[a-zA-Z_$]/,
      /\bfor\s*\(/,
      /\bwhile\s*\(/,
      /\bfunction\s+[a-zA-Z_]/,
      /\bdef\s+[a-zA-Z_]/
    ],
    forbiddenTokenDescriptions: [
      'JavaScript console.log() is invalid in SQL',
      'Java System.out is invalid in SQL',
      'JavaScript let declaration is invalid in SQL',
      'JavaScript const declaration is invalid in SQL',
      'Procedural for-loop is invalid in standard declarative SQL',
      'Procedural while-loop is invalid in standard declarative SQL',
      'JavaScript function declaration is invalid in SQL',
      'Python def keyword is invalid in SQL'
    ],
    allowedPatterns: [
      /\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|GROUP\s+BY|HAVING|ORDER\s+BY|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|UNION|VALUES)\b/i
    ]
  },
  javascript: {
    forbiddenTokens: [
      /\bSystem\.out\./,
      /\bpublic\s+static\s+void\b/,
      /#include\s*</,
      /\bstd::/
    ],
    forbiddenTokenDescriptions: [
      'Java System.out is invalid in JavaScript (use console.log)',
      'Java public static void signature is invalid in JavaScript',
      'C++ #include is invalid in JavaScript',
      'C++ std:: is invalid in JavaScript'
    ],
    allowedPatterns: [
      /\b(const|let|var|function|return|if|else|switch|for|while|class|import|export|console\.log)\b/,
      /=>/
    ]
  }
};

// Aliases for language lookup
const LANG_ALIASES: Record<string, string> = {
  java: 'java',
  jvm: 'java',
  python: 'python',
  py: 'python',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  javascript: 'javascript',
  js: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  sql: 'sql',
  dbms: 'sql',
  mysql: 'sql',
  postgresql: 'sql',
  assembly: 'assembly',
  asm: 'assembly',
  bash: 'bash',
  powershell: 'powershell',
  rust: 'rust',
  go: 'golang',
  golang: 'golang',
  html: 'html',
  css: 'css',
  csharp: 'csharp',
  'c#': 'csharp',
  cs: 'csharp'
};

/**
 * Normalized token patterns for extracting constructs from code snippets.
 */
export const CONSTRUCT_PATTERNS = {
  CONDITIONAL: [
    /\bif\b/i,
    /\belse\s+if\b/i,
    /\belif\b/i,
    /\belse\b/i,
    /\bswitch\b/i,
    /\bcase\s+[^:]+:/i,
    /\bmatch\b/i,
    /\?\s*[^:]+\s*:/ // ternary
  ],
  LOOP: [
    /\bfor\b/i,
    /\bwhile\b/i,
    /\bloop\s*\{/i,
    /\bdo\s*\{/i,
    /\bdo\b/i,
    /\buntil\b/i
  ],
  FUNCTION: [
    /\b(def|function|func|fn|fun|sub)\s+[a-zA-Z_]/i,
    /\b(void|int|double|String|boolean|float)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{/i,
    /=>/,
    /\breturn\b/i
  ],
  OOP: [
    /\bclass\s+[a-zA-Z_]/i,
    /\binterface\s+[a-zA-Z_]/i,
    /\bextends\s+[a-zA-Z_]/i,
    /\bimplements\s+[a-zA-Z_]/i,
    /\bnew\s+[A-Z][a-zA-Z0-9_]*\s*\(/i,
    /\bthis\./i,
    /\bself\./i,
    /\bsuper\s*(\(|\.)/i
  ],
  EXCEPTION: [
    /\btry\s*(\{|:)/i,
    /\bcatch\s*\(/i,
    /\bfinally\s*(\{|:)/i,
    /\bthrow\s+/i,
    /\bthrows\s+/i,
    /\bexcept\s*(\(|:)/i,
    /\braise\s+/i
  ],
  ARRAY_COLLECTION: [
    /\[\s*[^\]]+\s*\]/,
    /\b(ArrayList|HashMap|HashSet|LinkedList|List|Map|Set|Vector)\b/,
    /\bvector<.+>/,
    /\barray\b/i
  ],
  OPERATORS: [
    /\+\+/,
    /--/,
    /\+=|-=|\*=\/%=/,
    /&&|\|\|/,
    /&|\||\^|~|<<|>>|>>>/,
    /==|!=|<=|>=|<|>/
  ],
  STRINGS: [
    /\bString\b/,
    /\bstr\b/,
    /\.charAt\(/,
    /\.substring\(/,
    /\.length\(\)/,
    /\.equals\(/,
    /\.indexOf\(/,
    /\.split\(/,
    /\.trim\(/,
    /\.toUpperCase\(/,
    /\.toLowerCase\(/
  ]
};

export type ConstructType =
  | 'CONDITIONAL'
  | 'LOOP'
  | 'FUNCTION'
  | 'OOP'
  | 'EXCEPTION'
  | 'ARRAY_COLLECTION'
  | 'OPERATORS'
  | 'STRINGS';

/**
 * Extracts constructs present in a code snippet.
 */
export function extractCodeConstructs(codeSnippet: string): ConstructType[] {
  const detected: ConstructType[] = [];
  const cleanCode = codeSnippet.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ''); // strip single & multi-line comments

  for (const [construct, patterns] of Object.entries(CONSTRUCT_PATTERNS) as [ConstructType, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(cleanCode)) {
        detected.push(construct);
        break;
      }
    }
  }

  return detected;
}

/**
 * Determines expected constructs based on canonical topic identifier, title, and language.
 */
export function getExpectedConstructsForTopic(topicId?: string, topicTitle?: string, language?: string): ConstructType[] {
  const combined = `${topicId || ''} ${topicTitle || ''}`.toLowerCase();
  const langLower = (language || '').toLowerCase().trim();

  // Declarative SQL does not use procedural IF-ELSE or imperative LOOPS
  if (langLower === 'sql' || langLower === 'dbms' || langLower === 'mysql' || langLower === 'postgresql') {
    return [];
  }

  // JS Event Loop is an asynchronous runtime concept, not a programming for/while loop construct
  if (combined.includes('event loop') || combined.includes('event-loop') || combined.includes('event_loop')) {
    return [];
  }

  if (/if[-_ ]?else|condition|switch|branch|case|relational/.test(combined)) {
    return ['CONDITIONAL'];
  }
  if (/loop|while|for[-_ ]?loop|iteration|foreach/.test(combined)) {
    return ['LOOP'];
  }
  if (/method|function|procedure|parameter|overload|lambda/.test(combined)) {
    return ['FUNCTION'];
  }
  if (/class|object|oop|constructor|inherit|polymorph|encapsulat|abstract|interface/.test(combined)) {
    return ['OOP'];
  }
  if (/exception|error[-_ ]?handling|try[-_ ]?catch|throw/.test(combined)) {
    return ['EXCEPTION'];
  }
  if (/array|list|collection|matrix|vector|map|dictionary/.test(combined)) {
    return ['ARRAY_COLLECTION'];
  }
  if (/operator|expression|arithmetic|bitwise/.test(combined)) {
    return ['OPERATORS'];
  }
  if (/string|text|regex|char/.test(combined)) {
    return ['STRINGS'];
  }

  return [];
}

/**
 * Validates language boundaries and prevents cross-language code contamination.
 */
export function validateLanguageSyntax(
  codeSnippet: string,
  language: string
): { isValid: boolean; errors: string[] } {
  const langKey = LANG_ALIASES[language.toLowerCase().trim()] || language.toLowerCase().trim();
  const errors: string[] = [];

  // 1. Universal Cross-Language Synthetic Boilerplate Guard
  const isJsOrTs = langKey === 'javascript' || langKey === 'js' || langKey === 'typescript' || langKey === 'ts';
  if (!isJsOrTs) {
    if (/\bcollection\.length\b/.test(codeSnippet) ||
        /\bperformAllocation\s*\(/.test(codeSnippet) ||
        /\bNumber\.MAX_SAFE_INTEGER\b/.test(codeSnippet) ||
        /\bcalculateBoundaryOffset\b/.test(codeSnippet) ||
        /status\s*=\s*"initialized"/.test(codeSnippet) ||
        /\bfunction\s+checkState\s*\(/.test(codeSnippet)) {
      errors.push(`Cross-Language Contamination: Synthetic JavaScript boilerplate snippet detected in ${language} question.`);
    }

    // Languages with zero JavaScript syntax
    const strictlyNoJs = [
      'assembly', 'c', 'fortran', 'cobol', 'bash', 'powershell',
      'html', 'css', 'sql', 'plsql', 'tsql', 'r', 'matlab', 'prolog', 'lisp', 'python', 'java', 'cpp'
    ];
    if (strictlyNoJs.includes(langKey)) {
      if (/\bfor\s*\(\s*let\s+/.test(codeSnippet)) {
        errors.push(`Invalid Syntax: JavaScript 'for (let ...)' loop detected in ${language} snippet.`);
      }
      if (/\bconsole\.log\s*\(/.test(codeSnippet)) {
        errors.push(`Invalid Syntax: JavaScript 'console.log' detected in ${language} snippet.`);
      }
    }

    // Assembly-specific strict validation:
    if (langKey === 'assembly') {
      const codeClean = codeSnippet.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      if (/\b(function|class|let|var|public|private)\b/.test(codeClean)) {
        errors.push(`Invalid Assembly Syntax: High-level language keywords found in Assembly snippet.`);
      }
    }
  }

  // 2. Rulebook-based token checks
  const rules = LANGUAGE_RULES[langKey];
  if (rules) {
    // Strip comments from code snippet before checking forbidden syntax tokens
    const codeWithoutComments = codeSnippet.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    for (let i = 0; i < rules.forbiddenTokens.length; i++) {
      const pattern = rules.forbiddenTokens[i];
      if (pattern.test(codeWithoutComments)) {
        errors.push(rules.forbiddenTokenDescriptions[i]);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Deep Semantic Validator for AI and Question Bank MCQs.
 * Enforces AST/lexical constructs, cross-language isolation, and pedagogical topic relevance.
 */
export function validateSemanticIntegrity(
  question: Partial<BankQuestion>,
  targetLanguage?: string,
  targetTopic?: string
): SemanticValidationResult {
  const reasons: string[] = [];
  const lang = targetLanguage || question.programmingLanguage || question.skillName || question.skillId || '';
  const topicId = question.topicId || '';
  const topicName = targetTopic || question.topicName || question.topic || '';
  const code = question.codeSnippet || null;

  let isLanguageMatch = true;
  let isConstructMatch = true;
  let detectedConstructs: string[] = [];
  const expectedConstructs: string[] = getExpectedConstructsForTopic(topicId, topicName, lang);

  // 1. If question has a code snippet, run deep language syntax validation
  if (code && code.trim().length > 0) {
    const langCheck = validateLanguageSyntax(code, lang);
    if (!langCheck.isValid) {
      isLanguageMatch = false;
      reasons.push(...langCheck.errors);
    }

    detectedConstructs = extractCodeConstructs(code);

    // 2. Construct relevance gating:
    // If the topic is CONDITIONAL (e.g. if-else, switch):
    if (expectedConstructs.includes('CONDITIONAL')) {
      const hasConditional = detectedConstructs.includes('CONDITIONAL');
      const hasOnlyLoop = detectedConstructs.includes('LOOP') && !hasConditional;

      if (hasOnlyLoop) {
        isConstructMatch = false;
        reasons.push(
          `Construct Mismatch: Topic is '${topicName || topicId}' (Conditional Branching), but code contains a LOOP construct ('for'/'while') without conditional branching.`
        );
      } else if (!hasConditional && detectedConstructs.length > 0) {
        // Code exists and has constructs, but zero conditional statements
        isConstructMatch = false;
        reasons.push(
          `Construct Mismatch: Topic is '${topicName || topicId}', but code does not contain any if, else, or switch statements.`
        );
      }
    }

    // If the topic is LOOP:
    if (expectedConstructs.includes('LOOP')) {
      const hasLoop = detectedConstructs.includes('LOOP');
      if (!hasLoop && detectedConstructs.length > 0 && !code.toLowerCase().includes('loop')) {
        isConstructMatch = false;
        reasons.push(
          `Construct Mismatch: Topic is '${topicName || topicId}' (Loops), but code does not contain any loop construct (for/while/do-while).`
        );
      }
    }

    // If the topic is OOP / Classes:
    if (expectedConstructs.includes('OOP')) {
      const hasOop = detectedConstructs.includes('OOP');
      if (!hasOop && detectedConstructs.length > 0 && !code.toLowerCase().includes('class')) {
        isConstructMatch = false;
        reasons.push(
          `Construct Mismatch: Topic is '${topicName || topicId}' (OOP/Classes), but code lacks class, object, or constructor constructs.`
        );
      }
    }
  }

  // 3. Question premise semantic check
  // E.g., question text mentions "If...Else" but the question scenario is about "performAllocation" in a loop
  if (expectedConstructs.includes('CONDITIONAL') && question.question) {
    const qLower = question.question.toLowerCase();
    if (
      (qLower.includes('performallocation') || qLower.includes('loop index counter')) &&
      !qLower.includes('if') &&
      !qLower.includes('else') &&
      !qLower.includes('switch')
    ) {
      isConstructMatch = false;
      reasons.push(
        `Semantic Prompt Mismatch: Question premise is discussing loop allocations rather than conditional branching for topic '${topicName || topicId}'.`
      );
    }
  }

  const isValid = isLanguageMatch && isConstructMatch;
  let status: 'VERIFIED' | 'QUARANTINED' | 'REJECTED' = 'REJECTED';

  if (isValid) {
    status = 'VERIFIED';
  } else if (!isLanguageMatch) {
    status = 'REJECTED'; // Hard reject on cross-language contamination
  } else {
    status = 'QUARANTINED'; // Topic/construct mismatch quarantined
  }

  return {
    isValid,
    status,
    reasons,
    detectedLanguage: lang,
    detectedConstructs,
    expectedConstructs,
    isLanguageMatch,
    isConstructMatch
  };
}
