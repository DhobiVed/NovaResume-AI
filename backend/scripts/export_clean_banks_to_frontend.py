"""
export_clean_banks_to_frontend.py
Synchronizes clean, reclassified, 90% practical questions from backend/novaresume.db
to:
1. frontend/public/data/mcqs_100000/[lang_file] (all 50 languages, 2000+ MCQs each)
2. frontend/src/data/question-bank/programming/[lang].json (bundled static banks, ~500-600 top MCQs each)
3. frontend/src/data/question-bank/programming/other_languages.json
"""

import sqlite3
import json
import os
import random

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'novaresume.db')
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'public', 'data', 'mcqs_100000')
PROG_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'data', 'question-bank', 'programming')

LANGUAGE_FILE_MAP = {
    'java': '01_java_2000_mcqs.json',
    'python': '02_python_2000_mcqs.json',
    'javascript': '03_javascript_2000_mcqs.json',
    'cpp': '04_cpp_2000_mcqs.json',
    'csharp': '05_csharp_2000_mcqs.json',
    'sql': '06_sql_2000_mcqs.json',
    'typescript': '07_typescript_2000_mcqs.json',
    'golang': '08_golang_2000_mcqs.json',
    'rust': '09_rust_2000_mcqs.json',
    'c': '10_c_2000_mcqs.json',
    'php': '11_php_2000_mcqs.json',
    'html': '12_html_2000_mcqs.json',
    'css': '13_css_2000_mcqs.json',
    'kotlin': '14_kotlin_2000_mcqs.json',
    'swift': '15_swift_2000_mcqs.json',
    'dart': '16_dart_2000_mcqs.json',
    'bash': '17_bash_2000_mcqs.json',
    'powershell': '18_powershell_2000_mcqs.json',
    'ruby': '19_ruby_2000_mcqs.json',
    'scala': '20_scala_2000_mcqs.json',
    'r': '21_r_2000_mcqs.json',
    'assembly': '22_assembly_2000_mcqs.json',
    'solidity': '23_solidity_2000_mcqs.json',
    'lua': '24_lua_2000_mcqs.json',
    'perl': '25_perl_2000_mcqs.json',
    'julia': '26_julia_2000_mcqs.json',
    'objective-c': '27_objective-c_2000_mcqs.json',
    'groovy': '28_groovy_2000_mcqs.json',
    'matlab': '29_matlab_2000_mcqs.json',
    'visual-basic': '30_visual-basic_2000_mcqs.json',
    'zig': '31_zig_2000_mcqs.json',
    'fortran': '32_fortran_2000_mcqs.json',
    'plsql': '33_plsql_2000_mcqs.json',
    'tsql': '34_tsql_2000_mcqs.json',
    'cuda': '35_cuda_2000_mcqs.json',
    'haskell': '36_haskell_2000_mcqs.json',
    'erlang': '37_erlang_2000_mcqs.json',
    'elixir': '38_elixir_2000_mcqs.json',
    'fsharp': '39_fsharp_2000_mcqs.json',
    'clojure': '40_clojure_2000_mcqs.json',
    'lisp': '41_lisp_2000_mcqs.json',
    'prolog': '42_prolog_2000_mcqs.json',
    'ada': '43_ada_2000_mcqs.json',
    'cobol': '44_cobol_2000_mcqs.json',
    'crystal': '45_crystal_2000_mcqs.json',
    'nim': '46_nim_2000_mcqs.json',
    'v': '47_v_2000_mcqs.json',
    'ocaml': '48_ocaml_2000_mcqs.json',
    'd': '49_d_2000_mcqs.json',
    'apex': '50_apex_2000_mcqs.json'
}

LANGUAGE_ALIASES = {
    'golang': ['golang', 'go'],
    'cpp': ['cpp', 'c++'],
    'csharp': ['csharp', 'c#'],
    'visual-basic': ['visual-basic', 'visual basic', 'vb'],
    'fsharp': ['fsharp', 'f#'],
    'plsql': ['plsql', 'pl/sql'],
    'tsql': ['tsql', 't-sql']
}

STATIC_BUNDLED_FILES = {
    'java': 'java.json',
    'python': 'python.json',
    'cpp': 'cpp.json',
    'javascript': 'javascript.json',
    'csharp': 'csharp.json',
    'golang': 'go.json',
    'rust': 'rust.json',
    'kotlin': 'kotlin.json',
    'swift': 'swift.json',
    'typescript': 'typescript.json',
    'php': 'php.json',
    'c': 'c.json',
    'sql': 'sql.json',
    'html': 'html.json',
    'css': 'css.json'
}

def row_to_bank_question(r):
    try:
        opts = json.loads(r['options_json']) if r['options_json'] else []
    except:
        opts = []

    c_idx = r['correct_index'] if r['correct_index'] is not None else 0
    c_ans = opts[c_idx] if (opts and 0 <= c_idx < len(opts)) else (opts[0] if opts else '')

    is_practical = bool(r['practicality_type'] == 'practical' or (r['code_snippet'] and len(r['code_snippet'].strip()) > 0))
    pt = 'output_tracing' if is_practical else 'general'

    diff = (r['difficulty'] or 'Medium').capitalize()
    if diff not in ('Easy', 'Medium', 'Hard', 'Industry'):
        diff = 'Medium'

    q_text = (r['question_text'] or '').strip()

    return {
        'id': r['id'],
        'domainId': r['domain_id'] or 'programming',
        'domainName': r['domain_name'] or 'Computer Science & Engineering',
        'categoryId': 'general_purpose',
        'categoryName': 'General-purpose',
        'skillId': r['skill_id'] or r['language_id'],
        'skillName': r['skill_name'] or (r['language_id'].title() if r['language_id'] else 'Programming'),
        'programmingLanguage': r['skill_name'] or (r['language_id'].title() if r['language_id'] else 'Programming'),
        'languageId': r['language_id'],
        'module': r['module_id'] or 'Core Fundamentals',
        'moduleId': r['module_id'] or 'fundamentals',
        'topic': r['topic_name'] or r['topic_id'] or 'General',
        'topicId': r['topic_id'] or 'general',
        'topicName': r['topic_name'] or r['topic_id'] or 'General',
        'subtopic': r['subtopic'],
        'difficulty': diff,
        'questionType': 'code_output' if is_practical else 'conceptual',
        'practicalType': pt,
        'question': q_text,
        'codeSnippet': r['code_snippet'],
        'options': opts,
        'correctIndex': c_idx,
        'correctAnswer': c_ans,
        'hint': f"Carefully analyze syntax and logic for {r['topic_name'] or r['topic_id']}.",
        'explanation': r['explanation'] or c_ans,
        'marks': 1,
        'negativeMarks': 0,
        'status': 'VERIFIED',
        'verified': True,
        'primaryConcept': r['primary_concept'] or f"{r['language_id']}-{r['topic_id']}",
        'duplicateGroupId': r['duplicate_group_id'] or ''
    }

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    print(f"Connecting to {DB_PATH}...")
    total_db_q = c.execute("SELECT count(1) FROM question_bank_items").fetchone()[0]
    print(f"Total questions in database: {total_db_q}")

    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(PROG_DIR, exist_ok=True)

    other_languages_pool = []

    # 1. Export all 50 public JSON files
    for lang_key, file_name in LANGUAGE_FILE_MAP.items():
        aliases = LANGUAGE_ALIASES.get(lang_key, [lang_key])
        placeholders = ', '.join(['?'] * len(aliases))
        query = f"""
            SELECT * FROM question_bank_items
            WHERE lower(language_id) IN ({placeholders})
               OR lower(skill_id) IN ({placeholders})
            ORDER BY 
               CASE WHEN practicality_type='practical' OR (code_snippet IS NOT NULL AND length(trim(code_snippet))>0) THEN 0 ELSE 1 END,
               id ASC
        """
        rows = c.execute(query, aliases + aliases).fetchall()
        questions = [row_to_bank_question(r) for r in rows]

        # Save to public dataset
        out_path = os.path.join(PUBLIC_DIR, file_name)
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)

        practical_count = sum(1 for q in questions if q['codeSnippet'] and len(q['codeSnippet'].strip()) > 0)
        p_ratio = (practical_count / len(questions) * 100) if questions else 0
        topics = set(q['topicId'] for q in questions)
        print(f"[Public] {file_name}: {len(questions)} MCQs across {len(topics)} topics ({p_ratio:.1f}% practical)")

        # Collect for other_languages.json if not in STATIC_BUNDLED_FILES
        if lang_key not in STATIC_BUNDLED_FILES:
            # Pick ~40-50 high-quality practical questions for bundled other_languages
            practical_subset = [q for q in questions if q['codeSnippet'] and len(q['codeSnippet'].strip()) > 0]
            theory_subset = [q for q in questions if not q['codeSnippet'] or len(q['codeSnippet'].strip()) == 0]
            sample_count = min(40, len(questions))
            p_target = int(sample_count * 0.90)
            t_target = sample_count - p_target
            selected_other = practical_subset[:p_target] + theory_subset[:t_target]
            if len(selected_other) < sample_count:
                remaining = [q for q in questions if q not in selected_other]
                selected_other.extend(remaining[:sample_count - len(selected_other)])
            other_languages_pool.extend(selected_other)

        # 2. Export bundled static JSON file if in STATIC_BUNDLED_FILES
        if lang_key in STATIC_BUNDLED_FILES:
            static_file_name = STATIC_BUNDLED_FILES[lang_key]
            static_out_path = os.path.join(PROG_DIR, static_file_name)

            # Build a well-distributed static bank across all topics
            # Group by topicId
            by_topic = {}
            for q in questions:
                tid = q['topicId']
                by_topic.setdefault(tid, []).append(q)

            bundled_questions = []

            for tid, t_qs in by_topic.items():
                p_qs = [q for q in t_qs if q['codeSnippet'] and len(q['codeSnippet'].strip()) > 0]
                t_theory = [q for q in t_qs if not q['codeSnippet'] or len(q['codeSnippet'].strip()) == 0]
                
                # Keep up to 30 practical questions per topic and max 10% theory
                p_sample = p_qs[:min(len(p_qs), 30)]
                needed_t = min(len(t_theory), max(1, int(len(p_sample) * 0.10))) if p_sample else min(len(t_theory), 5)
                t_sample = t_theory[:needed_t]
                
                bundled_questions.extend(p_sample + t_sample)

            # Cap at ~700 max questions for bundle efficiency
            if len(bundled_questions) > 700:
                random.seed(42)
                bundled_questions = bundled_questions[:700]

            skill_name = questions[0]['programmingLanguage'] if questions else lang_key.title()
            static_payload = {
                'skillId': lang_key,
                'skillName': skill_name,
                'domainId': 'programming',
                'domainName': 'Computer Science & Engineering',
                'version': '2026.3',
                'totalQuestions': len(bundled_questions),
                'questions': bundled_questions
            }
            with open(static_out_path, 'w', encoding='utf-8') as f:
                json.dump(static_payload, f, indent=2, ensure_ascii=False)

            p_cnt = sum(1 for q in bundled_questions if q['codeSnippet'] and len(q['codeSnippet'].strip()) > 0)
            p_pct = (p_cnt / len(bundled_questions) * 100) if bundled_questions else 0
            print(f"  -> [Bundled] {static_file_name}: {len(bundled_questions)} MCQs across {len(by_topic)} topics ({p_pct:.1f}% practical)")

    # 3. Export other_languages.json
    other_out_path = os.path.join(PROG_DIR, 'other_languages.json')
    other_payload = {
        'skillId': 'other_languages',
        'skillName': 'Multi-Language Programming Suite',
        'domainId': 'programming',
        'domainName': 'Computer Science & Engineering',
        'version': '2026.3',
        'totalQuestions': len(other_languages_pool),
        'questions': other_languages_pool
    }
    with open(other_out_path, 'w', encoding='utf-8') as f:
        json.dump(other_payload, f, indent=2, ensure_ascii=False)
    p_cnt = sum(1 for q in other_languages_pool if q['codeSnippet'] and len(q['codeSnippet'].strip()) > 0)
    p_pct = (p_cnt / len(other_languages_pool) * 100) if other_languages_pool else 0
    print(f"[Bundled] other_languages.json: {len(other_languages_pool)} MCQs ({p_pct:.1f}% practical)")

    print("\nDataset synchronization complete!")

if __name__ == '__main__':
    main()
