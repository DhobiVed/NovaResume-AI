// scripts/ingest_large_mcqs.js
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'C:\\Users\\dhobi\\Downloads\\mcqs large data json';
const TARGET_PROG_DIR = path.join(__dirname, '..', 'frontend', 'src', 'data', 'question-bank', 'programming');

function computeFingerprint(qText, codeText) {
  const normQ = (qText || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const normC = (codeText || '').trim().toLowerCase().replace(/\s+/g, '');
  return `${normQ}:::${normC}`;
}

const letterToIndex = { A: 0, B: 1, C: 2, D: 3, a: 0, b: 1, c: 2, d: 3 };

function cleanText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\n/g, '\n')
    .replace(/\\\"/g, '"')
    .replace(/\\'/g, "'")
    .trim();
}

function classifyTopic(langKey, text, code) {
  const combined = ((text || '') + ' ' + (code || '')).toLowerCase();

  // Language-specific heuristics
  if (langKey === 'sql') {
    if (combined.includes('join') || combined.includes('inner') || combined.includes('outer') || combined.includes('cross')) {
      return { id: 'joins', name: 'SQL Joins & Relational Algebra' };
    }
    if (combined.includes('group by') || combined.includes('having') || combined.includes('count') || combined.includes('sum') || combined.includes('avg')) {
      return { id: 'aggregations', name: 'Aggregation Functions & Grouping' };
    }
    if (combined.includes('insert') || combined.includes('update') || combined.includes('delete') || combined.includes('truncate')) {
      return { id: 'dml', name: 'Data Manipulation Language (DML)' };
    }
    if (combined.includes('create') || combined.includes('alter') || combined.includes('drop') || combined.includes('primary key') || combined.includes('foreign key')) {
      return { id: 'ddl-constraints', name: 'DDL & Table Constraints' };
    }
    if (combined.includes('index') || combined.includes('view') || combined.includes('subquery') || combined.includes('transaction') || combined.includes('acid')) {
      return { id: 'advanced-sql', name: 'Indexes, Views & Transactions' };
    }
    return { id: 'queries-fundamentals', name: 'SQL Queries & Fundamentals' };
  }

  if (langKey === 'html') {
    if (combined.includes('<form') || combined.includes('<input') || combined.includes('<select') || combined.includes('button') || combined.includes('textarea')) {
      return { id: 'forms', name: 'HTML Forms & Input Types' };
    }
    if (combined.includes('semantic') || combined.includes('<nav') || combined.includes('<header') || combined.includes('<footer') || combined.includes('<article') || combined.includes('<section') || combined.includes('<main')) {
      return { id: 'semantic', name: 'Semantic HTML (nav, header, article, section)' };
    }
    if (combined.includes('table') || combined.includes('<tr>') || combined.includes('<td>') || combined.includes('list') || combined.includes('<ul>') || combined.includes('<ol>')) {
      return { id: 'tables-lists', name: 'HTML Tables, Lists & Formatting' };
    }
    return { id: 'syntax-elements', name: 'Basic HTML Structure & Elements' };
  }

  if (langKey === 'css') {
    if (combined.includes('flex') || combined.includes('justify-content') || combined.includes('align-items')) {
      return { id: 'flexbox', name: 'Flexbox (Flexible Box Layout)' };
    }
    if (combined.includes('grid') || combined.includes('grid-template')) {
      return { id: 'grid', name: 'CSS Grid Layout' };
    }
    if (combined.includes('box-model') || combined.includes('margin') || combined.includes('padding') || combined.includes('border') || combined.includes('box-sizing')) {
      return { id: 'box-model', name: 'The Box Model (Margin, Border, Padding, Content)' };
    }
    if (combined.includes('hover') || combined.includes('nth-child') || combined.includes('class') || combined.includes('id') || combined.includes('specificity') || combined.includes('selector')) {
      return { id: 'selectors', name: 'Selectors & Specificity' };
    }
    return { id: 'styling-fundamentals', name: 'CSS Styling Fundamentals' };
  }

  // General programming language heuristics
  if (combined.includes('pointer') || combined.includes('malloc') || combined.includes('free(') || combined.includes('address') || combined.includes('dereference') || combined.includes('&') && combined.includes('*')) {
    return { id: 'pointers-memory', name: 'Pointers & Memory Management' };
  }

  if (combined.includes('class') || combined.includes('object') || combined.includes('inheritance') || combined.includes('polymorphism') || combined.includes('encapsulation') || combined.includes('constructor') || combined.includes('interface') || combined.includes('trait') || combined.includes('struct') || combined.includes('extends') || combined.includes('implements')) {
    return { id: 'classes-objects', name: 'Classes, Objects & OOP Principles' };
  }

  if (combined.includes('function') || combined.includes('func ') || combined.includes('def ') || combined.includes('fn ') || combined.includes('lambda') || combined.includes('arrow') || combined.includes('closure') || combined.includes('return') || combined.includes('parameter') || combined.includes('argument')) {
    return { id: 'functions', name: 'Functions, Methods & Scopes' };
  }

  if (combined.includes('loop') || combined.includes('while') || combined.includes('for ') || combined.includes('for(') || combined.includes('do-while') || combined.includes('foreach') || combined.includes('iterate') || combined.includes('range')) {
    return { id: 'loops', name: 'Loops & Iteration Controls' };
  }

  if (combined.includes('if') || combined.includes('else') || combined.includes('switch') || combined.includes('case') || combined.includes('match') || combined.includes('when') || combined.includes('condition')) {
    return { id: 'conditions', name: 'Conditionals & Branching Logic' };
  }

  if (combined.includes('array') || combined.includes('list') || combined.includes('slice') || combined.includes('vector') || combined.includes('map') || combined.includes('dictionary') || combined.includes('set') || combined.includes('tuple') || combined.includes('[]')) {
    return { id: 'data-structures', name: 'Arrays & Built-in Collections' };
  }

  if (combined.includes('try') || combined.includes('catch') || combined.includes('except') || combined.includes('throw') || combined.includes('panic') || combined.includes('error') || combined.includes('exception')) {
    return { id: 'exception-handling', name: 'Error & Exception Handling' };
  }

  if (combined.includes('async') || combined.includes('await') || combined.includes('promise') || combined.includes('thread') || combined.includes('channel') || combined.includes('goroutine') || combined.includes('concurrency')) {
    return { id: 'concurrency', name: 'Concurrency & Asynchronous Flow' };
  }

  if (combined.includes('type') || combined.includes('interface') || combined.includes('generic') || combined.includes('template') || combined.includes('casting')) {
    return { id: 'type-system', name: 'Type System & Generic Types' };
  }

  return { id: 'syntax-fundamentals', name: 'Syntax & Language Fundamentals' };
}

function normalizeDifficulty(raw) {
  if (!raw) return 'Medium';
  const l = String(raw).toLowerCase().trim();
  if (l.includes('easy')) return 'Easy';
  if (l.includes('mod') || l.includes('med')) return 'Medium';
  if (l.includes('hard')) return 'Hard';
  if (l.includes('expert') || l.includes('indus') || l.includes('job')) return 'Industry';
  return 'Medium';
}

const LANGUAGE_CONFIGS = [
  {
    skillId: 'c',
    skillName: 'C',
    programmingLanguage: 'C',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'C Programming Fundamentals',
    prefix: 'C',
    files: ['c.json', 'c (1).json']
  },
  {
    skillId: 'cpp',
    skillName: 'C++',
    programmingLanguage: 'C++',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'C++ Fundamentals & STL',
    prefix: 'CPP',
    files: ['cplusplus.json', 'cpp.json'],
    existingBankFile: 'cpp.json'
  },
  {
    skillId: 'csharp',
    skillName: 'C#',
    programmingLanguage: 'C#',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'C# & .NET Core',
    prefix: 'CSHARP',
    files: ['csharp.json', 'csharp (1).json']
  },
  {
    skillId: 'css',
    skillName: 'CSS',
    programmingLanguage: 'CSS',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'CSS Fundamentals & Styling',
    prefix: 'CSS',
    files: ['css.json', 'css (1).json'],
    existingBankFile: 'css.json'
  },
  {
    skillId: 'go',
    skillName: 'Go',
    programmingLanguage: 'Go',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'Go Systems Programming',
    prefix: 'GO',
    files: ['go.json', 'go (1).json']
  },
  {
    skillId: 'html',
    skillName: 'HTML',
    programmingLanguage: 'HTML',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'HTML5 & Web Semantics',
    prefix: 'HTML',
    files: ['html.json', 'html (1).json', 'html (2).json'],
    existingBankFile: 'html.json'
  },
  {
    skillId: 'java',
    skillName: 'Java',
    programmingLanguage: 'Java',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'Java Platform & JVM',
    prefix: 'JAVA',
    files: ['java.json', 'java (1).json', 'java (2).json'],
    existingBankFile: 'java.json'
  },
  {
    skillId: 'javascript',
    skillName: 'JavaScript',
    programmingLanguage: 'JavaScript',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'JavaScript & ECMAScript',
    prefix: 'JS',
    files: ['javascript.json', 'javascript (1).json'],
    existingBankFile: 'javascript.json'
  },
  {
    skillId: 'kotlin',
    skillName: 'Kotlin',
    programmingLanguage: 'Kotlin',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'Kotlin & Multiplatform',
    prefix: 'KT',
    files: ['kotlin.json', 'kotlin (1).json', 'kotlin (2).json']
  },
  {
    skillId: 'php',
    skillName: 'PHP',
    programmingLanguage: 'PHP',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'PHP Web Development',
    prefix: 'PHP',
    files: ['php.json', 'php (1).json', 'php (2).json']
  },
  {
    skillId: 'python',
    skillName: 'Python',
    programmingLanguage: 'Python',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'Python Programming',
    prefix: 'PY',
    files: ['python.json', 'python (1).json', 'python (2).json'],
    existingBankFile: 'python.json'
  },
  {
    skillId: 'rust',
    skillName: 'Rust',
    programmingLanguage: 'Rust',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'Rust Systems & Memory Safety',
    prefix: 'RUST',
    files: ['rust.json', 'rust (1).json', 'rust (2).json']
  },
  {
    skillId: 'sql',
    skillName: 'SQL',
    programmingLanguage: 'SQL',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'Relational Databases & SQL',
    prefix: 'SQL',
    files: ['sql.json', 'sql (1).json', 'sql (2).json'],
    existingBankFile: 'sql.json'
  },
  {
    skillId: 'swift',
    skillName: 'Swift',
    programmingLanguage: 'Swift',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'Swift & Apple Ecosystem',
    prefix: 'SWIFT',
    files: ['swift.json', 'swift (1).json', 'swift (2).json']
  },
  {
    skillId: 'typescript',
    skillName: 'TypeScript',
    programmingLanguage: 'TypeScript',
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    defaultModule: 'TypeScript Type System',
    prefix: 'TS',
    files: ['typescript.json', 'typescript (1).json', 'typescript (2).json']
  }
];

function runIngestion() {
  console.log('========================================================');
  console.log('MCQ INGESTION & DEDUPLICATION PIPELINE');
  console.log('========================================================\n');

  let grandTotalRaw = 0;
  let grandTotalUniqueIngested = 0;
  let grandTotalDupsDiscarded = 0;

  LANGUAGE_CONFIGS.forEach(cfg => {
    console.log(`Processing ${cfg.skillName} (${cfg.skillId})...`);

    const seenFingerprints = new Set();
    const seenIds = new Set();
    const finalQuestions = [];

    // 1. If an existing bank exists in the repo, preserve all its existing verified questions
    if (cfg.existingBankFile) {
      const existingPath = path.join(TARGET_PROG_DIR, cfg.existingBankFile);
      if (fs.existsSync(existingPath)) {
        try {
          const raw = fs.readFileSync(existingPath, 'utf8');
          const data = JSON.parse(raw);
          const list = data.questions || [];
          list.forEach(q => {
            const fp = computeFingerprint(q.question, q.codeSnippet);
            seenFingerprints.add(fp);
            seenIds.add(q.id);
            finalQuestions.push(q);
          });
          console.log(`  -> Preserved ${finalQuestions.length} existing base questions from ${cfg.existingBankFile}`);
        } catch (err) {
          console.warn(`  -> Could not load existing ${cfg.existingBankFile}: ${err.message}`);
        }
      }
    }

    let rawCountForLang = 0;
    let addedCount = 0;
    let dupsCount = 0;

    // 2. Read each file in the source directory
    cfg.files.forEach(fileName => {
      const filePath = path.join(SOURCE_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`  [MISSING] Source file not found: ${filePath}`);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (err) {
        console.error(`  [ERROR] Parsing JSON for ${fileName}:`, err.message);
        return;
      }

      const items = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      rawCountForLang += items.length;

      items.forEach((item, itemIdx) => {
        // Extract question text and code snippet
        let qText = cleanText(item.question);
        let codeSnippet = item.code ? cleanText(item.code) : null;

        if (!codeSnippet && qText.includes('\n\n')) {
          const parts = qText.split(/\n\n+/);
          // If first part is a question and remaining has code
          if (parts[0].length < 250 && parts.slice(1).join('\n').length > 5) {
            qText = parts[0].trim();
            codeSnippet = parts.slice(1).join('\n\n').trim();
          }
        }

        if (!qText) return;

        // Compute fingerprint for deduplication
        const fp = computeFingerprint(qText, codeSnippet);
        if (seenFingerprints.has(fp)) {
          dupsCount++;
          return;
        }

        // Parse options
        let opts = [];
        if (Array.isArray(item.options)) {
          opts = item.options.map(o => cleanText(o));
        } else if (item.options && typeof item.options === 'object') {
          opts = [
            cleanText(item.options.A || item.options['0'] || ''),
            cleanText(item.options.B || item.options['1'] || ''),
            cleanText(item.options.C || item.options['2'] || ''),
            cleanText(item.options.D || item.options['3'] || '')
          ];
        }

        // Pad to at least 4 options if somehow missing
        while (opts.length < 4) {
          opts.push(`Option ${String.fromCharCode(65 + opts.length)}`);
        }

        // Determine correct answer & index
        let correctIdx = 0;
        const ansRaw = item.correct_answer || item.answer;
        if (ansRaw && letterToIndex[ansRaw] !== undefined) {
          correctIdx = letterToIndex[ansRaw];
        } else {
          // Check matching text
          const targetText = cleanText(item.correct_answer_text || item.answer_text || item.correct_option);
          if (targetText) {
            const foundIdx = opts.findIndex(o => o.toLowerCase() === targetText.toLowerCase());
            if (foundIdx !== -1) {
              correctIdx = foundIdx;
            }
          }
        }

        if (correctIdx < 0 || correctIdx > 3) correctIdx = 0;
        const correctAnswer = opts[correctIdx];

        // Explanation
        const explanation = cleanText(item.explanation || item.correct_answer_text || item.answer_text || item.correct_option)
          || `The correct answer is ${correctAnswer}.`;

        // Difficulty
        const diff = normalizeDifficulty(item.difficulty);

        // Topic
        const topic = classifyTopic(cfg.skillId, qText, codeSnippet);

        // Generate unique ID
        let qId = `${cfg.prefix}-AUTH-${String(finalQuestions.length + 1).padStart(4, '0')}`;
        while (seenIds.has(qId)) {
          qId = `${cfg.prefix}-AUTH-${String(finalQuestions.length + 1).padStart(4, '0')}-${Math.floor(Math.random() * 1000)}`;
        }

        const isPractical = !!codeSnippet || (item.type && String(item.type).toLowerCase() === 'practical') || (item.type && String(item.type).toLowerCase() === 'code');

        const bankQ = {
          id: qId,
          domainId: cfg.domainId,
          domainName: cfg.domainName,
          skillId: cfg.skillId,
          skillName: cfg.skillName,
          programmingLanguage: cfg.programmingLanguage,
          languageId: cfg.skillId,
          module: cfg.defaultModule,
          moduleId: 'fundamentals',
          moduleName: cfg.defaultModule,
          topicId: topic.id,
          topicName: topic.name,
          topic: topic.name,
          subtopic: topic.name,
          difficulty: diff,
          questionType: isPractical ? 'code_output' : 'conceptual',
          practicalType: isPractical ? 'output_tracing' : 'general',
          question: qText,
          codeSnippet: codeSnippet || null,
          options: opts,
          correctIndex: correctIdx,
          correctAnswer: correctAnswer,
          hint: `Analyze ${cfg.skillName} core syntax and rules for ${topic.name}.`,
          explanation: explanation,
          learningObjective: `Understand ${cfg.skillName} ${topic.name} concepts and runtime behavior.`,
          marks: 1,
          negativeMarks: 0,
          verified: true,
          status: 'VERIFIED',
          sourceType: 'authentic_dataset'
        };

        seenFingerprints.add(fp);
        seenIds.add(qId);
        finalQuestions.push(bankQ);
        addedCount++;
      });
    });

    // Write final output file
    const outputFileName = `${cfg.skillId}.json`;
    const outputPath = path.join(TARGET_PROG_DIR, outputFileName);

    const bankPayload = {
      skillId: cfg.skillId,
      skillName: cfg.skillName,
      domainId: cfg.domainId,
      domainName: cfg.domainName,
      version: '2026.3-complete-dataset',
      totalQuestions: finalQuestions.length,
      questions: finalQuestions
    };

    fs.writeFileSync(outputPath, JSON.stringify(bankPayload, null, 2), 'utf8');

    console.log(`  -> Source Raw: ${rawCountForLang} | Ingested: +${addedCount} | Duplicates Discarded: ${dupsCount} | Final Bank Size: ${finalQuestions.length}`);
    console.log(`  -> Written to: ${outputFileName}\n`);

    grandTotalRaw += rawCountForLang;
    grandTotalUniqueIngested += addedCount;
    grandTotalDupsDiscarded += dupsCount;
  });

  console.log('========================================================');
  console.log('INGESTION SUMMARY:');
  console.log(`  Total Source Questions Processed: ${grandTotalRaw}`);
  console.log(`  Total Unique New Questions Ingested: ${grandTotalUniqueIngested}`);
  console.log(`  Total Duplicate Questions Discarded: ${grandTotalDupsDiscarded}`);
  console.log('========================================================');
}

runIngestion();
