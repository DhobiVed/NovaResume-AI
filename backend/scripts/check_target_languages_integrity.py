import sqlite3

conn = sqlite3.connect('novaresume.db')
cur = conn.cursor()

target_langs = ['java', 'python', 'cpp', 'javascript', 'golang', 'go', 'ruby', 'rust']

print("=== Checking Syntax Integrity for Target Languages ===")
for lang in target_langs:
    cur.execute('''
        SELECT topic_id, COUNT(*), 
               SUM(CASE WHEN code_snippet LIKE '%fun %' THEN 1 ELSE 0 END) as kotlin_fun,
               SUM(CASE WHEN code_snippet LIKE '%val %' THEN 1 ELSE 0 END) as kotlin_val,
               SUM(CASE WHEN code_snippet LIKE '%System.out%' THEN 1 ELSE 0 END) as java_print,
               SUM(CASE WHEN code_snippet LIKE '%def %' THEN 1 ELSE 0 END) as python_or_ruby_def,
               SUM(CASE WHEN code_snippet LIKE '%func %' THEN 1 ELSE 0 END) as go_func,
               SUM(CASE WHEN code_snippet LIKE '%fn %' THEN 1 ELSE 0 END) as rust_fn
        FROM question_bank_items
        WHERE language_id = ? AND validation_status = 'VERIFIED'
        GROUP BY topic_id
    ''', (lang,))
    rows = cur.fetchall()
    print(f"\n--- {lang} ---")
    for r in rows:
        topic, total, k_fun, k_val, j_p, pr_def, g_fn, r_fn = r
        flags = []
        if k_fun > 0 and lang not in ['kotlin']:
            flags.append(f"KOTLIN_FUN({k_fun})")
        if k_val > 0 and lang not in ['kotlin', 'scala']:
            flags.append(f"KOTLIN_VAL({k_val})")
        flag_str = " | ".join(flags) if flags else "CLEAN"
        print(f"  {topic:<20}: total={total:<4} {flag_str}")

conn.close()
