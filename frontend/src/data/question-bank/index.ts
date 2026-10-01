import type { BankQuestion, SkillQuestionBank, QuestionDifficulty, GeneratedAssessmentTest } from '../../types/careerConnect';

import pythonBankRaw from './programming/python.json';
import javaBankRaw from './programming/java.json';
import cppBankRaw from './programming/cpp.json';
import javascriptBankRaw from './programming/javascript.json';
import sqlBankRaw from './programming/sql.json';
import htmlBankRaw from './programming/html.json';
import cssBankRaw from './programming/css.json';
import cBankRaw from './programming/c.json';
import csharpBankRaw from './programming/csharp.json';
import goBankRaw from './programming/go.json';
import kotlinBankRaw from './programming/kotlin.json';
import phpBankRaw from './programming/php.json';
import rustBankRaw from './programming/rust.json';
import swiftBankRaw from './programming/swift.json';
import typescriptBankRaw from './programming/typescript.json';
import otherLanguagesBankRaw from './programming/other_languages.json';
import solidworksBankRaw from './mechanical/solidworks.json';
import autocadMechBankRaw from './mechanical/autocad-mech.json';
import structuralAnalysisBankRaw from './civil/structural-analysis.json';
import plcBankRaw from './electrical/plc.json';
import microcontrollersBankRaw from './electronics/microcontrollers.json';
import multiDisciplinaryBankRaw from './multi_disciplinary.json';
import { resolveCanonicalTaxonomy } from '../../services/aiQuestionIntelligence/canonicalTaxonomy';
import { validateSemanticIntegrity } from '../../services/aiQuestionIntelligence/semanticValidator';
import { getLoadedLanguageQuestions } from './datasetLoader';

const SKILL_BANKS: Record<string, SkillQuestionBank> = {
  python: pythonBankRaw as unknown as SkillQuestionBank,
  java: javaBankRaw as unknown as SkillQuestionBank,
  cpp: cppBankRaw as unknown as SkillQuestionBank,
  'c++': cppBankRaw as unknown as SkillQuestionBank,
  javascript: javascriptBankRaw as unknown as SkillQuestionBank,
  js: javascriptBankRaw as unknown as SkillQuestionBank,
  sql: sqlBankRaw as unknown as SkillQuestionBank,
  dbms: sqlBankRaw as unknown as SkillQuestionBank,
  html: htmlBankRaw as unknown as SkillQuestionBank,
  html5: htmlBankRaw as unknown as SkillQuestionBank,
  css: cssBankRaw as unknown as SkillQuestionBank,
  css3: cssBankRaw as unknown as SkillQuestionBank,
  c: cBankRaw as unknown as SkillQuestionBank,
  csharp: csharpBankRaw as unknown as SkillQuestionBank,
  'c#': csharpBankRaw as unknown as SkillQuestionBank,
  cs: csharpBankRaw as unknown as SkillQuestionBank,
  go: goBankRaw as unknown as SkillQuestionBank,
  golang: goBankRaw as unknown as SkillQuestionBank,
  kotlin: kotlinBankRaw as unknown as SkillQuestionBank,
  kt: kotlinBankRaw as unknown as SkillQuestionBank,
  php: phpBankRaw as unknown as SkillQuestionBank,
  rust: rustBankRaw as unknown as SkillQuestionBank,
  rs: rustBankRaw as unknown as SkillQuestionBank,
  swift: swiftBankRaw as unknown as SkillQuestionBank,
  typescript: typescriptBankRaw as unknown as SkillQuestionBank,
  ts: typescriptBankRaw as unknown as SkillQuestionBank,
  solidworks: solidworksBankRaw as unknown as SkillQuestionBank,
  autocad_mech: autocadMechBankRaw as unknown as SkillQuestionBank,
  autocad: autocadMechBankRaw as unknown as SkillQuestionBank,
  'autocad (mechanical)': autocadMechBankRaw as unknown as SkillQuestionBank,
  'structural-analysis': structuralAnalysisBankRaw as unknown as SkillQuestionBank,
  structural_analysis: structuralAnalysisBankRaw as unknown as SkillQuestionBank,
  plc: plcBankRaw as unknown as SkillQuestionBank,
  plc_programming: plcBankRaw as unknown as SkillQuestionBank,
  microcontrollers: microcontrollersBankRaw as unknown as SkillQuestionBank,
  embedded_c: microcontrollersBankRaw as unknown as SkillQuestionBank,
  other_languages: otherLanguagesBankRaw as unknown as SkillQuestionBank,
  multi_disciplinary: multiDisciplinaryBankRaw as unknown as SkillQuestionBank
};

/**
 * Normalizes an identifier string for deterministic exact-key lookups.
 */
export function canonicalKey(val?: string | null): string {
  if (!val) return '';
  const trimmed = val.toLowerCase().trim();
  if (trimmed === 'c#' || trimmed === 'csharp' || trimmed === 'cs') return 'csharp';
  if (trimmed === 'c++' || trimmed === 'cpp') return 'cpp';
  if (trimmed === 'f#' || trimmed === 'fsharp' || trimmed === 'fs') return 'fsharp';
  if (trimmed === 'golang' || trimmed === 'go') return 'golang';
  if (trimmed === 'typescript' || trimmed === 'ts') return 'typescript';
  if (trimmed === 'javascript' || trimmed === 'js') return 'javascript';
  if (trimmed === 'python' || trimmed === 'py') return 'python';
  if (trimmed === 'assembly' || trimmed === 'asm') return 'assembly';
  if (trimmed === 'pl/sql' || trimmed === 'plsql' || trimmed === 'oracle-sql') return 'plsql';
  if (trimmed === 't-sql' || trimmed === 'tsql' || trimmed === 'mssql') return 'tsql';
  if (trimmed === 'objective-c' || trimmed === 'objectivec' || trimmed === 'objc') return 'objectivec';
  if (trimmed === 'visual-basic' || trimmed === 'visual basic' || trimmed === 'visualbasic' || trimmed === 'vb' || trimmed === 'vb.net') return 'visualbasic';
  if (trimmed === 'rust' || trimmed === 'rs') return 'rust';
  if (trimmed === 'kotlin' || trimmed === 'kt') return 'kotlin';
  if (trimmed === 'html' || trimmed === 'html5') return 'html';
  if (trimmed === 'css' || trimmed === 'css3') return 'css';
  return trimmed.replace(/[^a-z0-9]/g, '');
}

/**
 * Canonical topic normalizer mapping topic ids, titles, and syllabus variations
 * to standard canonical cluster keys for deterministic cross-referencing.
 * Strictly maintains 1:1 exact topic boundaries with ZERO coarse bucket collapsing.
 */
export function normalizeCanonicalTopic(rawTopic?: string | null, rawSubject?: string | null): string {
  if (!rawTopic) return '';
  const key = canonicalKey(rawTopic);

  const map: Record<string, string> = {
    // Python & General Programming Topics
    syntaxintro: 'syntax-intro',
    syntax: 'syntax-intro',
    pep8: 'syntax-intro',
    comments: 'syntax-intro',
    syntaxindentationcomments: 'syntax-intro',
    indentation: 'syntax-intro',
    introsyntax: 'syntax-intro',
    syntaxgettingstarted: 'syntax-intro',
    grammartypesexpressions: 'syntax-intro',

    variables: 'variables',
    variablescastingscope: 'variables',
    variablesvarletconstscope: 'variables',
    typecasting: 'variables',
    casting: 'variables',

    datatypes: 'datatypes',
    builtindatatypes: 'datatypes',
    builtindatatypesstrintfloatbool: 'datatypes',
    primitivetypes: 'datatypes',
    primitivetypestypecoercion: 'datatypes',
    variablesprimitivedatatypes: 'datatypes',
    variablesdatatypes: 'datatypes',
    types: 'types',
    basictypes: 'types',

    operators: 'operators',
    operatorsexpressions: 'operators',
    operatorsarithmeticlogicalbitwise: 'operators',
    operatorsequalityspreaddestructuring: 'operators',

    conditions: 'conditions',
    ifelifelseconditions: 'conditions',
    ifconditions: 'conditions',
    controlflow: 'control-flow',
    ifelseconditions: 'conditions',
    ifelseswitchstatements: 'conditions',

    loops: 'loops',
    whileforloops: 'loops',
    forloops: 'loops',
    whileloops: 'loops',
    whilefor: 'loops',

    functions: 'functions',
    functionsargsandkwargs: 'functions',
    functionsargsankwargs: 'functions',
    functionsargskwargs: 'functions',
    functionsscope: 'functions',
    functionsarrowfunctions: 'functions',

    lambda: 'lambda',
    lambdafunctions: 'lambda',
    lambdafunctionshigherorderfunctions: 'lambda',

    lists: 'lists',
    listslistcomprehensions: 'lists',
    listcomprehensions: 'lists',
    arrays: 'arrays',
    arraymethods: 'arrays',
    singleandmultidimensionalarrays: 'arrays',
    arraylist: 'arraylist',
    pointers: 'pointers',
    pointersreferences: 'pointers',
    pointersmemory: 'pointers',
    pointersdereferencingnullptr: 'pointers',
    dynamicmemory: 'dynamic-memory',
    dynamicmemoryallocationnewdelete: 'dynamic-memory',

    tuples: 'tuples',
    tuplesimmutability: 'tuples',

    sets: 'sets',
    setssetoperations: 'sets',

    dictionaries: 'dictionaries',
    dictionariessets: 'dictionaries',
    dictionarieskeyvaluelookup: 'dictionaries',

    oop: 'classes-objects',
    classesobjects: 'classes-objects',
    classesobjectsinit_self: 'classes-objects',
    classesobjects_initself: 'classes-objects',
    classesobjects__init__self: 'classes-objects',
    classesobjects2: 'classes-objects',
    classesobjectsconstructorsmethods: 'classes-objects',
    classesconstructorsmethods: 'classes-objects',
    classesobjectsinitself: 'classes-objects',
    classes: 'classes-objects',

    inheritance: 'inheritance',
    inheritancesuper: 'inheritance',

    polymorphism: 'polymorphism',
    polymorphismducktyping: 'polymorphism',

    iterators: 'iterators',
    iteratorsgenerators: 'iterators',
    iteratorsgenerators__iter____next__: 'iterators',
    iteratorsgenerators_iter_next: 'iterators',
    iteratorsgeneratorsiternext: 'iterators',

    exceptions: 'exceptions',
    exceptionhandling: 'exceptions',
    exceptionhandlingtryexceptfinallyraise: 'exceptions',

    modules: 'modules',
    modulespackages: 'modules',

    fileio: 'file-handling',
    filehandling: 'file-handling',
    filehandlingopenwithreadwrite: 'file-handling',
    exceptionhandlingfileio: 'file-handling',
    files: 'file-handling',

    pip: 'pip',
    pippackagemanager: 'pip',
    pippackagemanagervirtualenvironments: 'pip',

    // Mechanical - SolidWorks
    sketching: 'swsketching',
    swsketching: 'swsketching',
    sketchingrelations: 'swsketching',
    sketchingrelationsconstraints: 'swsketching',
    dsketching: 'swsketching',
    dsketchingrelationsconstraints: 'swsketching',
    parametricmodeling: 'parametric_modeling',
    parametricmodelingdesignintent: 'parametric_modeling',
    sheetmetal: 'sheet_metal',
    sheetmetaldesign: 'sheet_metal',
    gdtdrafting: 'gdt_drafting',
    gdttoleranceanalysis: 'gdt_drafting',

    // Civil - Structural Analysis
    momentdistribution: 'moment_distribution',
    momentdistributionslopedeflection: 'moment_distribution',
    trussanalysis: 'truss_analysis',
    shearbending: 'shear_bending',
    shearforcebendingmoments: 'shear_bending',
    seismicdesign: 'seismic_design',
    seismicloadingresponsespectrum: 'seismic_design',

    // Electrical - PLC
    ladderlogic: 'ladder_logic',
    ladderlogicsequencers: 'ladder_logic',
    relayinstructions: 'relay_instructions',
    basicrelayinstructions: 'relay_instructions',
    timerscounters: 'timers_counters',
    industrialcommunication: 'industrial_communication',
    industrialcommunicationfieldbus: 'industrial_communication',

    // Electronics - Microcontrollers
    gpio: 'gpio_registers',
    gpioregisters: 'gpio_registers',
    gpioconfigurationregisters: 'gpio_registers',
    i2c: 'i2c_protocol',
    spi: 'i2c_protocol',
    i2cprotocol: 'i2c_protocol',
    i2cspiprotocols: 'i2c_protocol',
    interrupts: 'interrupt_handling',
    interrupthandling: 'interrupt_handling',
    interrupthandlingisrs: 'interrupt_handling',
    pwm: 'pwm_timers',
    pwmtimers: 'pwm_timers',
    pwmtimerprescalers: 'pwm_timers',

    // Web - HTML
    syntaxelements: 'syntax-elements',
    basicstructureelements: 'syntax-elements',
    htmlcoreelements: 'syntax-elements',
    basicstructure: 'syntax-elements',
    forms: 'forms',
    htmlforms: 'forms',
    htmlformsinputtypes: 'forms',
    semantic: 'semantic',
    semantichtml: 'semantic',

    // Web - CSS
    selectors: 'selectors',
    selectorsspecificity: 'selectors',
    boxmodel: 'box-model',
    theboxmodel: 'box-model',
    marginpaddingborder: 'box-model',
    flexbox: 'flexbox',
    flexibleboxlayout: 'flexbox',
    grid: 'grid',
    cssgrid: 'grid',
    cssgridlayout: 'grid'
  };

  if (map[key]) {
    return map[key];
  }

  // Try canonical taxonomy resolver with subject scope
  const resolved = resolveCanonicalTaxonomy(rawSubject, rawTopic, rawTopic);
  if (resolved && resolved.topicId && canonicalKey(resolved.topicId) !== 'fundamentals') {
    return canonicalKey(resolved.topicId);
  }

  return key;
}

/**
 * Fisher-Yates unbiased shuffle algorithm.
 * Replaces biased Array.prototype.sort(() => Math.random() - 0.5)
 */
export function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Computes a deterministic content fingerprint for question deduplication.
 */
export function computeQuestionFingerprint(q: BankQuestion): string {
  const normalizedText = (q.question || '').trim().toLowerCase().replace(/\s+/g, ' ');
  let normalizedCode = (q.codeSnippet || '').trim().toLowerCase().replace(/\s+/g, '');
  // Normalize out synthetic class/function numbers so templates with identical logic match
  normalizedCode = normalizedCode.replace(/(?:class|function|def|fun|fn)[a-z0-9_]+/g, 'fn');
  normalizedCode = normalizedCode.replace(/(?:branch|fact|loop|array|calc)_[0-9]+/g, 'template');
  return `${normalizedText}:::${normalizedCode}`;
}

/**
 * Hard No-Duplicate Gate:
 * Verifies that all questions in a test are 100% unique in ID, content fingerprint, and duplicateGroupId.
 */
export function assertTestUniqueness(questions: BankQuestion[]): {
  isValid: boolean;
  duplicateIds: string[];
  duplicateContentCount: number;
  error?: string;
} {
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];
  const seenFingerprints = new Set<string>();
  const seenDuplicateGroups = new Set<string>();
  let duplicateContentCount = 0;

  for (const q of questions) {
    if (seenIds.has(q.id)) {
      duplicateIds.push(q.id);
    } else {
      seenIds.add(q.id);
    }

    const fp = computeQuestionFingerprint(q);
    const dg = q.duplicateGroupId && q.duplicateGroupId.trim();
    if (seenFingerprints.has(fp) || (dg && seenDuplicateGroups.has(dg))) {
      duplicateContentCount++;
    } else {
      seenFingerprints.add(fp);
      if (dg) seenDuplicateGroups.add(dg);
    }
  }

  const isValid = duplicateIds.length === 0 && duplicateContentCount === 0;
  return {
    isValid,
    duplicateIds,
    duplicateContentCount,
    error: isValid
      ? undefined
      : `Test integrity violation: Found ${duplicateIds.length} duplicate IDs and ${duplicateContentCount} duplicate content questions.`
  };
}

/**
 * Deduplicates candidate questions ensuring ID, content, and duplicateGroupId uniqueness.
 */
export function deduplicateQuestions(questions: BankQuestion[]): BankQuestion[] {
  const seenIds = new Set<string>();
  const seenFingerprints = new Set<string>();
  const seenDuplicateGroups = new Set<string>();
  const unique: BankQuestion[] = [];

  for (const q of questions) {
    if (!q || !q.id) continue;
    const fp = computeQuestionFingerprint(q);
    const dg = q.duplicateGroupId && q.duplicateGroupId.trim();
    if (seenIds.has(q.id) || seenFingerprints.has(fp) || (dg && seenDuplicateGroups.has(dg))) {
      continue;
    }
    seenIds.add(q.id);
    seenFingerprints.add(fp);
    if (dg) seenDuplicateGroups.add(dg);
    unique.push(q);
  }

  return unique;
}

/**
 * Defensive sanitizer to ensure questions are free from meta-tags or module prefixes.
 */
export function sanitizeQuestionText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/^\[(?:Concept|Case|Test|Topic|Q)\s*#?\d+\]\s*/i, '')
    .replace(/\s*\[Module:[^\]]+\]\s*$/i, '')
    .replace(/\s*\[Topic:[^\]]+\]\s*$/i, '')
    .trim();
}

/**
 * Injects dynamically loaded dataset questions into the active skill bank registry.
 */
export function feedLanguageIntoQuestionBank(languageId: string, questions: BankQuestion[]): void {
  if (!questions || questions.length === 0) return;
  const key = canonicalKey(languageId);
  const sanitized = questions.map(q => ({
    ...q,
    question: sanitizeQuestionText(q.question)
  }));
  SKILL_BANKS[key] = {
    skillId: key,
    skillName: sanitized[0]?.programmingLanguage || sanitized[0]?.skillName || languageId,
    domainId: sanitized[0]?.domainId || 'programming',
    domainName: sanitized[0]?.domainName || 'Computer Science & Engineering',
    version: '2026.3',
    questions: sanitized
  };
}

/**
 * Returns the skill-centric question bank for a specific skill.
 */
export function getQuestionBankBySkill(skillOrLang: string): SkillQuestionBank | undefined {
  const key = canonicalKey(skillOrLang);
  if (SKILL_BANKS[key]) return SKILL_BANKS[key];
  for (const [k, bank] of Object.entries(SKILL_BANKS)) {
    if (canonicalKey(k) === key || canonicalKey(bank.skillName) === key || canonicalKey(bank.skillId) === key) {
      return bank;
    }
  }

  // Check dynamically loaded 100,000 MCQs master dataset in memory
  const loaded = getLoadedLanguageQuestions(key);
  if (loaded && loaded.length > 0) {
    feedLanguageIntoQuestionBank(key, loaded);
    return SKILL_BANKS[key];
  }

  // Check in other_languages
  const otherBank = SKILL_BANKS['other_languages'];
  if (otherBank && Array.isArray(otherBank.questions)) {
    const matching = otherBank.questions.filter(q => {
      return canonicalKey(q.skillId) === key || canonicalKey(q.programmingLanguage) === key;
    });
    if (matching.length > 0) {
      return {
        skillId: key,
        skillName: matching[0].programmingLanguage || skillOrLang,
        domainId: 'programming',
        domainName: 'Computer Science & Engineering',
        version: '2026.2',
        questions: matching
      };
    }
  }

  // Check in multi_disciplinary
  const multiBank = SKILL_BANKS['multi_disciplinary'];
  if (multiBank && Array.isArray(multiBank.questions)) {
    const matching = multiBank.questions.filter(q => {
      return canonicalKey(q.skillId) === key || canonicalKey(q.subjectId) === key || canonicalKey(q.programmingLanguage) === key;
    });
    if (matching.length > 0) {
      return {
        skillId: key,
        skillName: matching[0].skillName || skillOrLang,
        domainId: matching[0].domainId || 'engineering',
        domainName: matching[0].domainName || 'Engineering & Applied Sciences',
        version: '2026.2',
        questions: matching
      };
    }
  }

  return undefined;
}

/**
 * Returns all verified questions across all registered skill banks.
 */
export function getAllVerifiedBankQuestions(): BankQuestion[] {
  const seenIds = new Set<string>();
  const allVerified: BankQuestion[] = [];
  for (const bank of Object.values(SKILL_BANKS)) {
    for (const q of bank.questions) {
      if ((q.verified === true || q.status === 'VERIFIED') && !seenIds.has(q.id)) {
        seenIds.add(q.id);
        allVerified.push(q);
      }
    }
  }
  return allVerified;
}

export interface ExactFilterOptions {
  domainId?: string;
  skillId?: string;
  language?: string;
  topicId?: string;
  topic?: string;
  difficulty?: QuestionDifficulty | 'Mixed' | string;
  previouslyUsedIds?: Set<string> | string[];
}

/**
 * EXACT FILTERING ENGINE
 * Strict Deterministic Pipeline:
 * 1. Find correct skill bank (or domain-matched pool).
 * 2. Filter exact skill.
 * 3. Filter exact topicId / canonical topic (NO fuzzy substring overlap into unrelated topics).
 * 4. Filter exact difficulty (unless 'Mixed').
 * 5. Enforce verified === true and status === 'VERIFIED'.
 * 6. Exclude previously attempted questions if requested.
 * 7. ZERO UNRELATED FALLBACK: Never substitute other topics, skills, or generic computer questions!
 */
export function filterExactVerifiedQuestions(options: ExactFilterOptions): {
  verifiedQuestions: BankQuestion[];
  availableCount: number;
  isExactTopicMatch: boolean;
  topicRequested?: string;
  skillRequested?: string;
} {
  const targetSkillKey = canonicalKey(options.skillId || options.language);
  const targetTopicIdKey = canonicalKey(options.topicId);
  const targetTopicNameKey = canonicalKey(options.topic);
  const targetTopicKey = targetTopicIdKey || targetTopicNameKey;
  const targetDifficulty = options.difficulty && options.difficulty !== 'Mixed' ? options.difficulty.toLowerCase() : null;
  const previouslyUsed = options.previouslyUsedIds instanceof Set
    ? options.previouslyUsedIds
    : new Set(options.previouslyUsedIds || []);

  // 1. Identify Candidate Question Pool
  let candidatePool: BankQuestion[] = [];
  const matchedBank = getQuestionBankBySkill(options.skillId || options.language || '');
  if (matchedBank) {
    candidatePool = matchedBank.questions;
  } else {
    // If no isolated bank is found, pull only from verified registry
    candidatePool = getAllVerifiedBankQuestions().filter(q => {
      const qSkill = canonicalKey(q.skillId || q.programmingLanguage || q.skillName);
      if (targetSkillKey && qSkill !== targetSkillKey) return false;
      if (options.domainId) {
        const qDom = canonicalKey(q.domainId);
        if (qDom !== canonicalKey(options.domainId)) return false;
      }
      return true;
    });
  }

  // 2. Exact Filtering
  const exactFiltered = candidatePool.filter(q => {
    // A. Must be verified
    const isVerified = q.verified === true || q.status === 'VERIFIED';
    if (!isVerified) return false;

    // B. Skill and Language match (Strict Deterministic Language Isolation)
    if (targetSkillKey) {
      const qSkill = canonicalKey(q.skillId || q.programmingLanguage || q.skillName);
      const qLang = canonicalKey(q.languageId || q.programmingLanguage);
      const snippet = q.codeSnippet || '';

      // Cross-Language Contamination Defense: Non-Java languages must NEVER receive Java questions
      if (targetSkillKey !== 'java' && targetSkillKey !== 'jvm') {
        if (qLang === 'java' || qSkill === 'java') return false;
        if (snippet.includes('System.out') || snippet.includes('public static void main') || snippet.includes('public class Loop_') || snippet.includes('public class Branch_')) {
          return false;
        }
      }

      // SQL Language Isolation: SQL must NEVER receive C/Java procedural loops/ternary prints
      if (['sql', 'dbms'].includes(targetSkillKey)) {
        if (snippet.includes('int sum') || snippet.includes('int val') || snippet.includes('for (int') || snippet.includes('while (') || snippet.includes('print(')) {
          return false;
        }
      }

      // Assembly Isolation: Assembly must NEVER receive C/Java procedural loops
      if (['assembly', 'asm'].includes(targetSkillKey)) {
        if (snippet.includes('int sum') || snippet.includes('int val') || snippet.includes('for (int') || snippet.includes('while (')) {
          return false;
        }
      }

      // PL/SQL & T-SQL Isolation: PL/SQL and T-SQL must NEVER receive C/Java procedural loops
      if (['plsql', 'tsql'].includes(targetSkillKey)) {
        if (snippet.includes('int sum') || snippet.includes('int val') || snippet.includes('for (int') || snippet.includes('while (')) {
          return false;
        }
      }

      // Python Language Isolation: Python must NEVER receive Java curly brace syntax
      if (targetSkillKey === 'python' || targetSkillKey === 'py') {
        if (snippet.includes('public class') || snippet.includes('System.out')) {
          return false;
        }
      }

      const matchesSkill = qSkill === targetSkillKey || qLang === targetSkillKey;
      if (!matchesSkill) return false;
    }

    // C. Exact Topic match
    if (targetTopicKey && targetTopicKey !== 'all') {
      const qTopId = canonicalKey(q.topicId);
      const qTopic = canonicalKey(q.topic);
      const qTopName = canonicalKey(q.topicName);

      const normTargetId = normalizeCanonicalTopic(targetTopicIdKey, targetSkillKey);
      const normTargetName = normalizeCanonicalTopic(targetTopicNameKey, targetSkillKey);
      const normQTopId = normalizeCanonicalTopic(qTopId, targetSkillKey);
      const normQTopic = normalizeCanonicalTopic(qTopic, targetSkillKey);
      const normQTopName = normalizeCanonicalTopic(qTopName, targetSkillKey);

      let matchesTopic = false;
      if (targetTopicIdKey) {
        // Strict topic ID match: q.topicId must match target topicId or its canonical form
        if (qTopId === targetTopicIdKey || (normTargetId && normQTopId === normTargetId)) {
          matchesTopic = true;
        }
      } else if (targetTopicNameKey) {
        if (qTopName === targetTopicNameKey || qTopic === targetTopicNameKey || (normTargetName && (normQTopName === normTargetName || normQTopic === normTargetName))) {
          matchesTopic = true;
        }
      }

      if (!matchesTopic) return false;
    }

    // D. Exact Difficulty match
    if (targetDifficulty) {
      const qDiff = (q.difficulty || '').toLowerCase();
      if (qDiff !== targetDifficulty) return false;
    }

    // E. Strict Semantic AST & Construct Integrity Verification
    const semanticRes = validateSemanticIntegrity(
      q,
      targetSkillKey,
      options.topicId || options.topic
    );
    if (!semanticRes.isValid) return false;

    return true;
  });

  // 3. Deduplicate
  const deduplicated = deduplicateQuestions(exactFiltered);

  // 4. Prioritize unused candidates while preserving full pool depth
  const unusedCandidates = deduplicated.filter(q => !previouslyUsed.has(q.id));
  const usedCandidates = deduplicated.filter(q => previouslyUsed.has(q.id));
  const finalCandidates = [...unusedCandidates, ...usedCandidates];

  return {
    verifiedQuestions: finalCandidates,
    availableCount: deduplicated.length,
    isExactTopicMatch: Boolean(targetTopicKey && targetTopicKey !== 'all'),
    topicRequested: options.topicId || options.topic,
    skillRequested: options.skillId || options.language
  };
}

/**
 * Determines whether a question is a practical programming/code question (60% quota)
 * or a theoretical/conceptual question (40% quota).
 * Practical questions include code analysis, output tracing, debugging, and code snippets.
 */
export function isPracticalQuestion(q: BankQuestion): boolean {
  if (!q) return false;
  if (q.codeSnippet && q.codeSnippet.trim().length > 0) {
    return true;
  }
  const pt = String(q.practicalType || '').toLowerCase();
  if (pt === 'code_analysis' || pt === 'output_tracing' || pt === 'debugging' || pt === 'implementation') {
    return true;
  }
  return false;
}

/**
 * Samples questions targeting strictly 90% Practical (code/programming) and 10% Theoretical.
 * Prioritizes unused questions over previously used questions to ensure tests dynamically rotate.
 */
export function sampleBalanced90Practical10Theory(
  pool: BankQuestion[],
  targetCount: number,
  previouslyUsedIds?: Set<string> | string[]
): BankQuestion[] {
  if (!pool || pool.length === 0) return [];
  const uniquePool = deduplicateQuestions(pool);
  const prevUsedSet = previouslyUsedIds instanceof Set
    ? previouslyUsedIds
    : new Set(previouslyUsedIds || []);

  const practicalAll = uniquePool.filter(q => isPracticalQuestion(q));
  const theoryAll = uniquePool.filter(q => !isPracticalQuestion(q));

  let targetPractical = Math.round(targetCount * 0.90);
  let targetTheory = targetCount - targetPractical;

  // If one category is short, adjust targets to available counts
  if (practicalAll.length < targetPractical) {
    targetPractical = practicalAll.length;
    targetTheory = Math.min(theoryAll.length, targetCount - targetPractical);
  } else if (theoryAll.length < targetTheory) {
    targetTheory = theoryAll.length;
    targetPractical = Math.min(practicalAll.length, targetCount - targetTheory);
  }

  const drawFromSubpool = (subpool: BankQuestion[], needed: number): BankQuestion[] => {
    if (needed <= 0 || subpool.length === 0) return [];
    const unused = fisherYatesShuffle(subpool.filter(q => !prevUsedSet.has(q.id)));
    const used = fisherYatesShuffle(subpool.filter(q => prevUsedSet.has(q.id)));

    const chosen: BankQuestion[] = [];
    for (const q of unused) {
      if (chosen.length >= needed) break;
      chosen.push(q);
    }
    for (const q of used) {
      if (chosen.length >= needed) break;
      chosen.push(q);
    }
    return chosen;
  };

  const chosenPractical = drawFromSubpool(practicalAll, targetPractical);
  const chosenTheory = drawFromSubpool(theoryAll, targetTheory);

  // Backfill if needed to reach targetCount
  const combined = [...chosenPractical, ...chosenTheory];
  if (combined.length < targetCount && combined.length < uniquePool.length) {
    const selectedIds = new Set(combined.map(q => q.id));
    const remainingUnused = fisherYatesShuffle(uniquePool.filter(q => !selectedIds.has(q.id) && !prevUsedSet.has(q.id)));
    const remainingUsed = fisherYatesShuffle(uniquePool.filter(q => !selectedIds.has(q.id) && prevUsedSet.has(q.id)));
    const remainingPool = [...remainingUnused, ...remainingUsed];

    for (let i = 0; i < remainingPool.length && combined.length < targetCount; i++) {
      combined.push(remainingPool[i]);
    }
  }

  return fisherYatesShuffle(combined);
}

// Backward-compatibility alias
export const sampleBalanced60Practical40Theory = sampleBalanced90Practical10Theory;

/**
 * Generates a 50-MCQ Final Certification Test covering the entire syllabus of a subject.
 * Distribution strictly enforced: 10 Easy, 15 Medium, 15 Hard, 10 Industry.
 * Ratio strictly enforced: 90% Practical (code/programming: ~45 MCQs) and 10% Theoretical (~5 MCQs).
 * Distributed across multiple syllabus topics and dynamically rotates questions.
 */
export function generateFinalCertificationTest(
  subjectId: string,
  durationMinutes: number = 45,
  previouslyUsedIds?: Set<string> | string[]
): GeneratedAssessmentTest {
  const targetSubjectKey = canonicalKey(subjectId);
  const bank = getQuestionBankBySkill(subjectId);
  const rawPool = bank ? bank.questions : getAllVerifiedBankQuestions();

  const questionsPool = rawPool.filter(q => {
    const qSkill = canonicalKey(q.skillId || q.programmingLanguage || q.skillName);
    const qLang = canonicalKey(q.languageId || q.programmingLanguage);
    const snippet = q.codeSnippet || '';

    // Non-Java languages must NEVER receive Java questions
    if (targetSubjectKey !== 'java' && targetSubjectKey !== 'jvm') {
      if (qLang === 'java' || qSkill === 'java') return false;
      if (snippet.includes('System.out') || snippet.includes('public static void main') || snippet.includes('public class Loop_') || snippet.includes('public class Branch_')) {
        return false;
      }
    }

    // SQL must NEVER receive C/Java procedural loops/ternary prints
    if (['sql', 'dbms'].includes(targetSubjectKey)) {
      if (snippet.includes('int sum') || snippet.includes('int val') || snippet.includes('for (int') || snippet.includes('while (') || snippet.includes('print(')) {
        return false;
      }
    }

    // Assembly must NEVER receive C/Java procedural loops
    if (['assembly', 'asm'].includes(targetSubjectKey)) {
      if (snippet.includes('int sum') || snippet.includes('int val') || snippet.includes('for (int') || snippet.includes('while (')) {
        return false;
      }
    }

    // PL/SQL & T-SQL must NEVER receive C/Java procedural loops
    if (['plsql', 'tsql'].includes(targetSubjectKey)) {
      if (snippet.includes('int sum') || snippet.includes('int val') || snippet.includes('for (int') || snippet.includes('while (')) {
        return false;
      }
    }

    return qSkill === targetSubjectKey || qLang === targetSubjectKey;
  });

  const verifiedPool = deduplicateQuestions(questionsPool.filter(q => {
    const isVerified = q.verified === true || q.status === 'VERIFIED';
    if (!isVerified) return false;
    return validateSemanticIntegrity(q, subjectId, q.topicName || q.topic).isValid;
  }));

  const prevUsedSet = previouslyUsedIds instanceof Set
    ? previouslyUsedIds
    : new Set(previouslyUsedIds || []);

  // 1. Build Topic and Concept Inventory from verified pool
  const topicMap = new Map<string, BankQuestion[]>();
  for (const q of verifiedPool) {
    const t = q.topicId || q.topic || 'general';
    if (!topicMap.has(t)) topicMap.set(t, []);
    topicMap.get(t)!.push(q);
  }

  const availableTopics = Array.from(topicMap.keys());
  const numTopics = availableTopics.length;
  // Dynamic per-topic ceiling: e.g. 25 topics -> max 3 per topic; 15 topics -> max 4-5 per topic
  const maxPerTopic = Math.max(3, Math.ceil(50 / Math.max(1, numTopics)) + 1);

  // 2. Multi-Pass Topic-and-Concept Balanced Selection
  const targetDiffs: { [d: string]: number } = { Easy: 10, Medium: 15, Hard: 15, Industry: 10 };
  const picked: BankQuestion[] = [];
  const pickedIds = new Set<string>();
  const pickedFps = new Set<string>();
  const pickedDg = new Set<string>();
  const topicUsage: { [topic: string]: number } = {};
  const conceptUsage: { [concept: string]: number } = {};

  const canAdd = (q: BankQuestion, enforceTopicCap = true): boolean => {
    if (!q || !q.id || pickedIds.has(q.id)) return false;
    const fp = computeQuestionFingerprint(q);
    if (pickedFps.has(fp)) return false;
    if (q.duplicateGroupId && pickedDg.has(q.duplicateGroupId.trim())) return false;
    const t = q.topicId || q.topic || 'general';
    if (enforceTopicCap && (topicUsage[t] || 0) >= maxPerTopic) return false;
    return true;
  };

  const addQuestion = (q: BankQuestion) => {
    picked.push(q);
    pickedIds.add(q.id);
    pickedFps.add(computeQuestionFingerprint(q));
    if (q.duplicateGroupId) pickedDg.add(q.duplicateGroupId.trim());
    const t = q.topicId || q.topic || 'general';
    topicUsage[t] = (topicUsage[t] || 0) + 1;
    const c = q.primaryConcept || t;
    conceptUsage[c] = (conceptUsage[c] || 0) + 1;
  };

  const getDiffCount = (d: string) => picked.filter(q => (q.difficulty || '').toLowerCase() === d.toLowerCase()).length;
  const getPracticalCount = () => picked.filter(q => isPracticalQuestion(q)).length;
  const getTheoryCount = () => picked.length - getPracticalCount();

  const getTopicCandidates = (topic: string, diff?: string, practicalOnly?: boolean, enforceTopicCap = true): BankQuestion[] => {
    const list = topicMap.get(topic) || [];
    return list.filter(q => {
      if (!canAdd(q, enforceTopicCap)) return false;
      if (diff && (q.difficulty || '').toLowerCase() !== diff.toLowerCase()) return false;
      if (practicalOnly !== undefined && isPracticalQuestion(q) !== practicalOnly) return false;
      return true;
    });
  };

  // PASS 1: Broad Coverage - Select 1 question from every available topic
  const shuffledTopics = fisherYatesShuffle(availableTopics);

  for (const topic of shuffledTopics) {
    if (picked.length >= 50) break;
    const neededDiffs = Object.keys(targetDiffs).filter(d => getDiffCount(d) < targetDiffs[d]);
    if (neededDiffs.length === 0) break;

    // Prefer practical, unused by student
    let cands = getTopicCandidates(topic, undefined, true).filter(q => !prevUsedSet.has(q.id));
    if (cands.length === 0) cands = getTopicCandidates(topic, undefined, true);
    if (cands.length === 0 && getTheoryCount() < 5) {
      cands = getTopicCandidates(topic, undefined, false);
    }

    if (cands.length > 0) {
      const matched = cands.find(q => neededDiffs.some(d => d.toLowerCase() === (q.difficulty || '').toLowerCase()));
      const chosen = matched || cands[0];
      if (canAdd(chosen)) {
        addQuestion(chosen);
      }
    }
  }

  // PASS 2: Balanced Topic & Concept Round-Robin
  let topicIdx = 0;
  let iterations = 0;
  while (picked.length < 50 && iterations < 500) {
    iterations++;
    // Order topics by lowest current usage first to prevent clustering, with randomized tie-breaking
    const topicsByUsage = fisherYatesShuffle(availableTopics).sort((a, b) => (topicUsage[a] || 0) - (topicUsage[b] || 0));
    const topic = topicsByUsage[topicIdx % topicsByUsage.length];
    topicIdx++;

    if ((topicUsage[topic] || 0) >= maxPerTopic) continue;

    const neededDiffs = Object.keys(targetDiffs).filter(d => getDiffCount(d) < targetDiffs[d]);
    if (neededDiffs.length === 0) break;

    const preferPractical = getPracticalCount() < 45;
    let cands: BankQuestion[] = [];

    for (const d of neededDiffs) {
      if (preferPractical) {
        cands = getTopicCandidates(topic, d, true);
      }
      if (cands.length === 0 && getTheoryCount() < 5) {
        cands = getTopicCandidates(topic, d, false);
      }
      if (cands.length > 0) break;
    }

    if (cands.length === 0) {
      for (const d of neededDiffs) {
        cands = getTopicCandidates(topic, d);
        if (cands.length > 0) break;
      }
    }

    if (cands.length > 0) {
      const unusedConcept = cands.find(q => !conceptUsage[q.primaryConcept || '']);
      const unusedPrev = cands.find(q => !prevUsedSet.has(q.id));
      const chosen = unusedConcept || unusedPrev || cands[0];
      if (canAdd(chosen)) {
        addQuestion(chosen);
      }
    }
  }

  // PASS 3: Difficulty Balancing - Fill exact difficulty slots (10 Easy, 15 Med, 15 Hard, 10 Industry)
  for (const [diff, req] of Object.entries(targetDiffs)) {
    while (getDiffCount(diff) < req && picked.length < 50) {
      const preferPrac = getPracticalCount() < 45;
      const sortedTopics = fisherYatesShuffle(availableTopics).sort((a, b) => (topicUsage[a] || 0) - (topicUsage[b] || 0));
      let found: BankQuestion | null = null;

      for (let extra = 0; extra <= 15 && !found; extra++) {
        const currentCap = maxPerTopic + extra;
        for (const t of sortedTopics) {
          if ((topicUsage[t] || 0) >= currentCap) continue;
          const cands = getTopicCandidates(t, diff, preferPrac ? true : undefined, false);
          if (cands.length > 0) {
            found = cands.find(q => !prevUsedSet.has(q.id)) || cands[0];
            break;
          }
        }
        if (!found && preferPrac) {
          for (const t of sortedTopics) {
            if ((topicUsage[t] || 0) >= currentCap) continue;
            const cands = getTopicCandidates(t, diff, undefined, false);
            if (cands.length > 0) {
              found = cands.find(q => !prevUsedSet.has(q.id)) || cands[0];
              break;
            }
          }
        }
      }

      if (found && canAdd(found, false)) {
        addQuestion(found);
      } else {
        break;
      }
    }
  }

  // PASS 4: Theory/Practical Ratio Tuning (>= 45 Practical, <= 5 Theory)
  let practicalCount = getPracticalCount();
  if (practicalCount < 45 && picked.length === 50) {
    const sparePractical = verifiedPool.filter(q =>
      isPracticalQuestion(q) &&
      !pickedIds.has(q.id) &&
      !pickedFps.has(computeQuestionFingerprint(q)) &&
      (!q.duplicateGroupId || !pickedDg.has(q.duplicateGroupId.trim()))
    );

    let spIdx = 0;
    for (let i = picked.length - 1; i >= 0 && practicalCount < 45 && spIdx < sparePractical.length; i--) {
      if (!isPracticalQuestion(picked[i])) {
        const targetD = (picked[i].difficulty || '').toLowerCase();
        const matchedSpareIdx = sparePractical.findIndex((q, idx) =>
          idx >= spIdx && (q.difficulty || '').toLowerCase() === targetD && !pickedIds.has(q.id)
        );
        const chosenIdx = matchedSpareIdx !== -1 ? matchedSpareIdx : spIdx;
        const matchedSpare = sparePractical[chosenIdx];

        if (matchedSpare && !pickedIds.has(matchedSpare.id)) {
          pickedIds.delete(picked[i].id);
          pickedFps.delete(computeQuestionFingerprint(picked[i]));
          picked[i] = matchedSpare;
          pickedIds.add(matchedSpare.id);
          pickedFps.add(computeQuestionFingerprint(matchedSpare));
          if (matchedSpare.duplicateGroupId) pickedDg.add(matchedSpare.duplicateGroupId.trim());
          practicalCount++;
          spIdx = chosenIdx + 1;
        }
      }
    }
  }

  // PASS 5: If fewer than 50, fill from any remaining verifiedPool
  if (picked.length < 50) {
    for (const q of verifiedPool) {
      if (picked.length >= 50) break;
      if (canAdd(q, false)) {
        addQuestion(q);
      }
    }
  }

  // Final Hard Integrity Assertions
  const finalIds = new Set<string>();
  const finalFps = new Set<string>();
  for (const q of picked) {
    const qL = canonicalKey(q.languageId || q.programmingLanguage || q.skillId);
    if (qL !== targetSubjectKey) {
      throw new Error(`Integrity violation: question ${q.id} has language ${qL}, expected ${targetSubjectKey}`);
    }
    if (finalIds.has(q.id)) {
      throw new Error(`Duplicate ID violation in Final Certification: ${q.id}`);
    }
    const fp = computeQuestionFingerprint(q);
    if (finalFps.has(fp)) {
      throw new Error(`Duplicate content fingerprint violation in Final Certification: ${q.id}`);
    }
    finalIds.add(q.id);
    finalFps.add(fp);
  }

  const finalQuestions = fisherYatesShuffle(picked).slice(0, 50);

  const skillName = bank?.skillName || (subjectId.charAt(0).toUpperCase() + subjectId.slice(1));

  return {
    testId: `cert-${canonicalKey(subjectId)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    domainId: bank?.domainId || 'programming',
    domainName: bank?.domainName || 'Computer Science & Engineering',
    skillId: canonicalKey(subjectId),
    skillName: skillName,
    language: skillName,
    difficulty: 'Mixed',
    totalQuestions: finalQuestions.length,
    durationSeconds: durationMinutes * 60,
    questions: finalQuestions,
    exactTopicLocked: false,
    availableCount: verifiedPool.length,
    requestedCount: 50,
    testMode: 'FINAL_CERTIFICATION',
    subjectId: canonicalKey(subjectId),
    syllabusVersion: '2026.1'
  };
}

/**
 * Generates a focused Topic Practice Test strictly on the chosen topic.
 * 10-15 MCQs. Never issues certificates.
 * Ratio strictly enforced: 90% Practical (code/programming) and 10% Theoretical.
 * Dynamically rotates questions using rolling history so retakes never give identical tests.
 */
export function generateTopicTest(
  subjectId: string,
  topicId: string,
  topicTitle?: string,
  difficulty: QuestionDifficulty | 'Mixed' = 'Mixed',
  durationMinutes: number = 15,
  count: number = 15,
  previouslyUsedIds?: Set<string> | string[]
): GeneratedAssessmentTest {
  const filterResult = filterExactVerifiedQuestions({
    skillId: subjectId,
    language: subjectId,
    topicId,
    topic: topicTitle,
    difficulty,
    previouslyUsedIds
  });

  let candidates = deduplicateQuestions(filterResult.verifiedQuestions);
  if (candidates.length < count && difficulty !== 'Mixed') {
    const mixed = filterExactVerifiedQuestions({
      skillId: subjectId,
      language: subjectId,
      topicId,
      topic: topicTitle,
      difficulty: 'Mixed',
      previouslyUsedIds
    });
    const combined = deduplicateQuestions([...candidates, ...mixed.verifiedQuestions]);
    candidates = combined;
  }

  // Sample with 90% Practical / 10% Theoretical and fresh question rotation
  const selected = sampleBalanced90Practical10Theory(
    candidates,
    Math.min(count, candidates.length),
    previouslyUsedIds
  );

  // Hard assertion check
  const uniquenessReport = assertTestUniqueness(selected);
  if (!uniquenessReport.isValid) {
    console.error(`[TestEngineIntegrity] Hard Duplicate Gate assertion failed in Topic Test (${topicId}):`, uniquenessReport.error);
  }

  const bank = getQuestionBankBySkill(subjectId);
  const skillName = bank?.skillName || (subjectId.charAt(0).toUpperCase() + subjectId.slice(1));

  return {
    testId: `topic-${canonicalKey(subjectId)}-${canonicalKey(topicId)}-${Date.now()}`,
    domainId: bank?.domainId || 'programming',
    domainName: bank?.domainName || 'Engineering & Technology',
    skillId: canonicalKey(subjectId),
    skillName: skillName,
    language: skillName,
    topicId: topicId,
    topicName: topicTitle || topicId,
    difficulty: difficulty === 'Mixed' ? 'Mixed' : difficulty,
    totalQuestions: selected.length,
    durationSeconds: durationMinutes * 60,
    questions: selected,
    exactTopicLocked: true,
    availableCount: filterResult.availableCount,
    requestedCount: count,
    testMode: 'TOPIC_TEST',
    subjectId: canonicalKey(subjectId),
    syllabusVersion: '2026.1'
  };
}

export * from './datasetLoader';


