import type { BankQuestion, QuestionDifficulty } from '../../types/careerConnect';

export interface DatasetQueryOptions {
  languageId: string;
  topicId?: string;
  difficulty?: QuestionDifficulty | 'Mixed';
  practicalOnly?: boolean;
  theoreticalOnly?: boolean;
  limit?: number;
  offset?: number;
  searchQuery?: string;
}

export interface DatasetCatalogItem {
  rank: number;
  languageId: string;
  languageName: string;
  category: string;
  fileName: string;
  totalCount: number;
  practicalCount: number;
  theoreticalCount: number;
  verified: boolean;
}

export interface DatasetCatalogSummary {
  datasetName: string;
  version: string;
  generatedAt: string;
  totalLanguages: number;
  totalQuestions: number;
  totalPracticalQuestions: number;
  totalTheoreticalQuestions: number;
  practicalRatio: string;
  theoreticalRatio: string;
  storagePath: string;
  languages: DatasetCatalogItem[];
}

/**
 * Deterministic mapping of 50 programming language IDs and aliases to their 2,000 MCQ JSON files.
 */
export const LANGUAGE_FILE_MAP: Record<string, string> = {
  java: '01_java_2000_mcqs.json',
  python: '02_python_2000_mcqs.json',
  javascript: '03_javascript_2000_mcqs.json',
  js: '03_javascript_2000_mcqs.json',
  cpp: '04_cpp_2000_mcqs.json',
  'c++': '04_cpp_2000_mcqs.json',
  csharp: '05_csharp_2000_mcqs.json',
  'c#': '05_csharp_2000_mcqs.json',
  cs: '05_csharp_2000_mcqs.json',
  sql: '06_sql_2000_mcqs.json',
  typescript: '07_typescript_2000_mcqs.json',
  ts: '07_typescript_2000_mcqs.json',
  golang: '08_golang_2000_mcqs.json',
  go: '08_golang_2000_mcqs.json',
  rust: '09_rust_2000_mcqs.json',
  rs: '09_rust_2000_mcqs.json',
  c: '10_c_2000_mcqs.json',
  php: '11_php_2000_mcqs.json',
  html: '12_html_2000_mcqs.json',
  html5: '12_html_2000_mcqs.json',
  css: '13_css_2000_mcqs.json',
  css3: '13_css_2000_mcqs.json',
  kotlin: '14_kotlin_2000_mcqs.json',
  kt: '14_kotlin_2000_mcqs.json',
  swift: '15_swift_2000_mcqs.json',
  dart: '16_dart_2000_mcqs.json',
  bash: '17_bash_2000_mcqs.json',
  sh: '17_bash_2000_mcqs.json',
  powershell: '18_powershell_2000_mcqs.json',
  ps1: '18_powershell_2000_mcqs.json',
  ruby: '19_ruby_2000_mcqs.json',
  rb: '19_ruby_2000_mcqs.json',
  scala: '20_scala_2000_mcqs.json',
  r: '21_r_2000_mcqs.json',
  assembly: '22_assembly_2000_mcqs.json',
  asm: '22_assembly_2000_mcqs.json',
  solidity: '23_solidity_2000_mcqs.json',
  sol: '23_solidity_2000_mcqs.json',
  lua: '24_lua_2000_mcqs.json',
  perl: '25_perl_2000_mcqs.json',
  pl: '25_perl_2000_mcqs.json',
  julia: '26_julia_2000_mcqs.json',
  jl: '26_julia_2000_mcqs.json',
  'objective-c': '27_objective-c_2000_mcqs.json',
  objc: '27_objective-c_2000_mcqs.json',
  groovy: '28_groovy_2000_mcqs.json',
  matlab: '29_matlab_2000_mcqs.json',
  'visual-basic': '30_visual-basic_2000_mcqs.json',
  vb: '30_visual-basic_2000_mcqs.json',
  zig: '31_zig_2000_mcqs.json',
  fortran: '32_fortran_2000_mcqs.json',
  f90: '32_fortran_2000_mcqs.json',
  plsql: '33_plsql_2000_mcqs.json',
  tsql: '34_tsql_2000_mcqs.json',
  cuda: '35_cuda_2000_mcqs.json',
  haskell: '36_haskell_2000_mcqs.json',
  hs: '36_haskell_2000_mcqs.json',
  erlang: '37_erlang_2000_mcqs.json',
  erl: '37_erlang_2000_mcqs.json',
  elixir: '38_elixir_2000_mcqs.json',
  ex: '38_elixir_2000_mcqs.json',
  fsharp: '39_fsharp_2000_mcqs.json',
  fs: '39_fsharp_2000_mcqs.json',
  clojure: '40_clojure_2000_mcqs.json',
  clj: '40_clojure_2000_mcqs.json',
  lisp: '41_lisp_2000_mcqs.json',
  prolog: '42_prolog_2000_mcqs.json',
  ada: '43_ada_2000_mcqs.json',
  cobol: '44_cobol_2000_mcqs.json',
  crystal: '45_crystal_2000_mcqs.json',
  cr: '45_crystal_2000_mcqs.json',
  nim: '46_nim_2000_mcqs.json',
  v: '47_v_2000_mcqs.json',
  ocaml: '48_ocaml_2000_mcqs.json',
  ml: '48_ocaml_2000_mcqs.json',
  d: '49_d_2000_mcqs.json',
  apex: '50_apex_2000_mcqs.json'
};

// In-memory cache for loaded language banks
const datasetCache = new Map<string, BankQuestion[]>();

/**
 * Normalizes an identifier string for deterministic exact-key lookups.
 */
export function normalizeLanguageKey(val?: string | null): string {
  if (!val) return '';
  const trimmed = val.toLowerCase().trim();
  if (trimmed === 'c#' || trimmed === 'csharp' || trimmed === 'cs') return 'csharp';
  if (trimmed === 'c++' || trimmed === 'cpp') return 'cpp';
  if (trimmed === 'golang' || trimmed === 'go') return 'golang';
  if (trimmed === 'typescript' || trimmed === 'ts') return 'typescript';
  if (trimmed === 'javascript' || trimmed === 'js') return 'javascript';
  return trimmed.replace(/[^a-z0-9_-]/g, '');
}

/**
 * Asynchronously loads the 2,000 MCQs for any of the 50 languages from /data/mcqs_100000/.
 * Caches in memory for instant subsequent lookups.
 */
export async function loadLanguageQuestions(languageOrSkillId: string): Promise<BankQuestion[]> {
  const key = normalizeLanguageKey(languageOrSkillId);
  if (datasetCache.has(key)) {
    return datasetCache.get(key)!;
  }

  const fileName = LANGUAGE_FILE_MAP[key];
  if (!fileName) {
    return [];
  }

  try {
    let rawText = '';
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      const response = await fetch(`/data/mcqs_100000/${fileName}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} loading ${fileName}`);
      }
      rawText = await response.text();
    } else {
      // Node.js test environment
      try {
        const modFs = 'fs';
        const modPath = 'path';
        const fs = await import(/* @vite-ignore */ modFs);
        const path = await import(/* @vite-ignore */ modPath);
        const proc = (globalThis as { process?: { cwd: () => string } }).process;
        const cwd = proc && typeof proc.cwd === 'function' ? proc.cwd() : '.';
        const candidates = [
          path.resolve(cwd, 'frontend', 'public', 'data', 'mcqs_100000', fileName),
          path.resolve(cwd, 'public', 'data', 'mcqs_100000', fileName),
          path.resolve(cwd, 'data', 'mcqs_100000', fileName)
        ];
        for (const p of candidates) {
          if (fs.existsSync(p)) {
            rawText = fs.readFileSync(p, 'utf8');
            break;
          }
        }
      } catch {}
    }

    if (!rawText) return [];

    const parsed = JSON.parse(rawText);
    const questions: BankQuestion[] = Array.isArray(parsed) ? parsed : parsed.questions || [];
    for (const q of questions) {
      if (q && q.question) {
        q.question = q.question
          .replace(/^\[(?:Concept|Case|Test|Topic|Q)\s*#?\d+\]\s*/i, '')
          .replace(/\s*\[Module:[^\]]+\]\s*$/i, '')
          .replace(/\s*\[Topic:[^\]]+\]\s*$/i, '')
          .trim();
      }
    }
    datasetCache.set(key, questions);
    return questions;
  } catch (err) {
    console.warn(`[DatasetLoader] Could not fetch ${fileName}:`, err);
    return [];
  }
}

/**
 * Synchronous getter from in-memory cache if already preloaded.
 */
export function getLoadedLanguageQuestions(languageOrSkillId: string): BankQuestion[] {
  const key = normalizeLanguageKey(languageOrSkillId);
  return datasetCache.get(key) || [];
}

/**
 * Evaluates whether a question is practical (90% quota) with a real code snippet,
 * or theoretical (10% quota) focusing on architecture and concepts.
 */
export function isPracticalMcq(q: BankQuestion): boolean {
  if (!q) return false;
  if (q.codeSnippet && q.codeSnippet.trim().length > 0) return true;
  const pt = String(q.practicalType || '').toLowerCase();
  return (
    pt === 'output_tracing' ||
    pt === 'debugging' ||
    pt === 'code_analysis' ||
    pt === 'edge_cases' ||
    pt === 'syntax_behavior' ||
    pt === 'runtime_analysis'
  );
}

/**
 * Samples questions strictly targeting 90% Practical and 10% Theoretical.
 * Adheres to the user's required 90/10 ratio.
 */
export function sample90Practical10Theory(
  pool: BankQuestion[],
  targetCount: number,
  previouslyUsedIds?: Set<string> | string[]
): BankQuestion[] {
  if (!pool || pool.length === 0) return [];
  const prevUsedSet = previouslyUsedIds instanceof Set
    ? previouslyUsedIds
    : new Set(previouslyUsedIds || []);

  const practicalAll = pool.filter(q => isPracticalMcq(q));
  const theoryAll = pool.filter(q => !isPracticalMcq(q));

  let targetPractical = Math.round(targetCount * 0.90);
  let targetTheory = targetCount - targetPractical;

  if (practicalAll.length < targetPractical) {
    targetPractical = practicalAll.length;
    targetTheory = Math.min(theoryAll.length, targetCount - targetPractical);
  } else if (theoryAll.length < targetTheory) {
    targetTheory = theoryAll.length;
    targetPractical = Math.min(practicalAll.length, targetCount - targetTheory);
  }

  const shuffle = <T>(arr: T[]): T[] => {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  };

  const drawFromSubpool = (subpool: BankQuestion[], needed: number): BankQuestion[] => {
    if (needed <= 0 || subpool.length === 0) return [];
    const unused = shuffle(subpool.filter(q => !prevUsedSet.has(q.id)));
    const used = shuffle(subpool.filter(q => prevUsedSet.has(q.id)));

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

  const combined = shuffle([...chosenPractical, ...chosenTheory]);
  return combined.slice(0, targetCount);
}

/**
 * Metadata descriptor for the 100,000 MCQs master dataset.
 */
export const DATASET_100K_METADATA = {
  totalQuestions: 100000,
  totalLanguages: 50,
  questionsPerLanguage: 2000,
  practicalPerLanguage: 1800,
  theoreticalPerLanguage: 200,
  practicalRatio: 0.90,
  theoreticalRatio: 0.10,
  fileExplorerPath: 'C:\\Users\\dhobi\\Downloads\\nova_mcqs_100000_dataset',
  projectDataPath: 'data/mcqs_100000'
} as const;

