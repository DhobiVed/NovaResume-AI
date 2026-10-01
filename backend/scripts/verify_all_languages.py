"""
Verify topic counts across ALL 50 languages in the database after full reclassification.
"""
import sqlite3
import os
import sys

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "novaresume.db")

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Get all languages
    cur.execute("SELECT DISTINCT language_id FROM question_bank_items WHERE length(language_id) < 30 ORDER BY language_id")
    langs = [r[0] for r in cur.fetchall()]

    key_topics = ['conditions', 'loops', 'recursion', 'functions', 'classes-objects',
                  'exceptions', 'arrays', 'strings', 'concurrency', 'memory-management']

    print(f"\n{'Language':<18} | {'Cond':>5} | {'Loops':>5} | {'Recur':>5} | {'Func':>6} | {'OOP':>5} | {'Excep':>5} | {'Total':>6} | Status")
    print("-" * 95)

    problem_langs = []
    for lang in langs:
        cur.execute("""
            SELECT topic_id, COUNT(*)
            FROM question_bank_items
            WHERE language_id = ? AND validation_status = 'VERIFIED'
            GROUP BY topic_id
        """, (lang,))
        topic_counts = dict(cur.fetchall())

        cond = topic_counts.get('conditions', 0) + topic_counts.get('conditionals', 0)
        loops = topic_counts.get('loops', 0)
        recur = topic_counts.get('recursion', 0)
        funcs = topic_counts.get('functions', 0) + topic_counts.get('methods', 0)
        oop = topic_counts.get('classes-objects', 0)
        excep = topic_counts.get('exceptions', 0)
        total = sum(topic_counts.values())

        # Check for problems
        has_broad = any(t in topic_counts for t in [
            'control_flow', 'syntax_basics', 'oop_abstractions',
            'data_structures', 'error_handling', 'concurrency_async',
            'io_filesystem', 'memory_management', 'functions_scope',
            'advanced_features', 'functions_async', 'syntax_dom',
            'objects_arrays', 'events_loop'
        ])

        status = "OK" if (cond > 0 or loops > 0) and not has_broad else ("BROAD!" if has_broad else "NO_TOPICS")
        if has_broad or (cond == 0 and loops == 0 and total > 100):
            problem_langs.append(lang)
            status = f"BROAD:{[t for t in topic_counts if '_' in t and t not in ['classes-objects', 'data-structures', 'classes-structs']][:3]}"

        print(f"{lang:<18} | {cond:>5} | {loops:>5} | {recur:>5} | {funcs:>6} | {oop:>5} | {excep:>5} | {total:>6} | {status}")

    print(f"\n{'='*95}")
    print(f"Total languages checked: {len(langs)}")
    if problem_langs:
        print(f"Languages still with broad topic IDs: {problem_langs}")
    else:
        print("All languages: No broad topic IDs remaining!")

    conn.close()

if __name__ == "__main__":
    main()
