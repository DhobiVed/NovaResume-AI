"""
align_all_topic_ids_to_reality.py
Realigns all 106,791 questions in novaresume.db so topic_id exactly matches the actual code construct.
Prevents loops, conditions, factorials, and arrays from polluting other modules (concurrency, exceptions, data-structures).
"""

import sqlite3
import os
import re

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'novaresume.db')

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    print("Beginning comprehensive reality-alignment on novaresume.db...")

    # 1. Align branch_ questions to 'conditions'
    print("Aligning branching / conditional questions...")
    c.execute("""
        UPDATE question_bank_items
        SET topic_id = 'conditions',
            topic_name = 'If...Else & Switch Statements',
            module_id = 'control-flow',
            primary_concept = language_id || '-if-else'
        WHERE (
            code_snippet LIKE '%branch_%' OR 
            code_snippet LIKE '%Branch_%' OR
            code_snippet LIKE '%limit = 19%' OR
            code_snippet LIKE '%limit = 23%' OR
            code_snippet LIKE '%limit = 25%' OR
            code_snippet LIKE '%limit = 31%' OR
            code_snippet LIKE '%limit = 33%' OR
            primary_concept LIKE '%-if-else' OR
            primary_concept LIKE '%-ternary-operator'
        )
        AND lower(topic_id) != 'conditions'
    """)
    print(f"  Realigned to 'conditions': {c.rowcount} rows")

    # 2. Align loop_ questions to 'loops'
    print("Aligning loop / iteration questions...")
    c.execute("""
        UPDATE question_bank_items
        SET topic_id = 'loops',
            topic_name = 'While, For & For-Each Loops',
            module_id = 'control-flow',
            primary_concept = language_id || '-for-loop'
        WHERE (
            code_snippet LIKE '%loop_%' OR 
            code_snippet LIKE '%Loop_%' OR
            code_snippet LIKE '%while (%' OR
            code_snippet LIKE '%while val <%' OR
            code_snippet LIKE '%while (val <%' OR
            code_snippet LIKE '%for (int %' OR
            code_snippet LIKE '%for (auto %' OR
            code_snippet LIKE '%for i in range%' OR
            code_snippet LIKE '%for x in %' OR
            code_snippet LIKE '%loop do%' OR
            primary_concept LIKE '%-for-loop' OR
            primary_concept LIKE '%-while-loop'
        )
        AND lower(topic_id) != 'loops'
    """)
    print(f"  Realigned to 'loops': {c.rowcount} rows")

    # 3. Align factorial_ questions to 'recursion'
    print("Aligning factorial / recursion questions...")
    c.execute("""
        UPDATE question_bank_items
        SET topic_id = 'recursion',
            topic_name = 'Recursion & Recursive Functions',
            module_id = 'functions',
            primary_concept = language_id || '-recursion'
        WHERE (
            code_snippet LIKE '%factorial_%' OR 
            code_snippet LIKE '%Factorial_%' OR
            code_snippet LIKE '%def fact(%' OR
            code_snippet LIKE '%int fact(%' OR
            code_snippet LIKE '%fn factorial%' OR
            primary_concept LIKE '%-recursion'
        )
        AND lower(topic_id) != 'recursion'
    """)
    print(f"  Realigned to 'recursion': {c.rowcount} rows")

    # 4. Align array_ questions to 'arrays' (or 'lists' in Python)
    print("Aligning array / list questions...")
    c.execute("""
        UPDATE question_bank_items
        SET topic_id = CASE WHEN lower(language_id) = 'python' THEN 'lists' ELSE 'arrays' END,
            topic_name = CASE WHEN lower(language_id) = 'python' THEN 'Lists & List Comprehensions' ELSE 'Single & Multidimensional Arrays' END,
            module_id = 'data-structures',
            primary_concept = language_id || CASE WHEN lower(language_id) = 'python' THEN '-lists' ELSE '-arrays' END
        WHERE (
            code_snippet LIKE '%array_%' OR 
            code_snippet LIKE '%Array_%' OR
            primary_concept LIKE '%-arrays' OR
            primary_concept LIKE '%-lists'
        )
        AND lower(topic_id) NOT IN ('arrays', 'lists')
    """)
    print(f"  Realigned to 'arrays'/'lists': {c.rowcount} rows")

    # 5. Fix any remaining AUTH questions with extension questions
    print("Sanitizing AUTH file extension questions...")
    c.execute("""
        UPDATE question_bank_items
        SET topic_id = 'syntax-fundamentals',
            topic_name = 'Syntax & Fundamentals',
            module_id = 'fundamentals',
            primary_concept = language_id || '-syntax'
        WHERE question_text LIKE '%file extension%'
          AND lower(topic_id) IN ('loops', 'conditions', 'recursion', 'functions', 'pointers')
    """)
    print(f"  Realigned extension AUTH questions: {c.rowcount} rows")

    # 6. Ensure C++ pointer MCQs are mapped to 'pointers'
    print("Ensuring C++ pointers are strictly mapped to 'pointers'...")
    c.execute("""
        UPDATE question_bank_items
        SET topic_id = 'pointers',
            topic_name = 'Pointers & References',
            module_id = 'memory',
            primary_concept = 'cpp-pointers'
        WHERE (lower(language_id) = 'cpp' OR lower(language_id) = 'c++')
          AND (
            code_snippet LIKE '%*ptr%' OR
            code_snippet LIKE '%int* %' OR
            code_snippet LIKE '%int *%' OR
            question_text LIKE '%pointer%' OR
            question_text LIKE '%dereference%'
          )
          AND lower(topic_id) NOT IN ('pointers')
    """)
    print(f"  Realigned C++ pointer questions: {c.rowcount} rows")

    conn.commit()
    print("Database updates committed successfully!")

    # Verify key target topic counts
    targets = [
        ('java', 'conditions'),
        ('java', 'loops'),
        ('python', 'lists'),
        ('python', 'functions'),
        ('cpp', 'pointers'),
        ('javascript', 'functions'),
        ('golang', 'loops'),
        ('ruby', 'loops'),
        ('rust', 'loops')
    ]

    print("\n--- Verified Target Counts After Alignment ---")
    for lang, top in targets:
        r = c.execute("""
            SELECT count(1), 
                   sum(case when practicality_type='practical' or (code_snippet is not null and length(trim(code_snippet)) > 0) then 1 else 0 end)
            FROM question_bank_items
            WHERE (lower(language_id)=? OR lower(skill_id)=?)
              AND lower(topic_id)=?
        """, (lang, lang, top)).fetchone()
        p_pct = (r[1] / r[0] * 100) if r[0] else 0
        print(f"{lang:<12} -> {top:<12}: Total={r[0]:<5} Practical={r[1]:<5} ({p_pct:.1f}%)")

    # Check concurrency purity: verify NO loops or branches remain in concurrency
    c_polluted = c.execute("""
        SELECT count(1) FROM question_bank_items
        WHERE topic_id = 'concurrency'
          AND (code_snippet LIKE '%branch_%' OR code_snippet LIKE '%loop_%' OR code_snippet LIKE '%factorial_%')
    """).fetchone()[0]
    print(f"\nRemaining polluted loop/branch items in 'concurrency': {c_polluted} (Should be 0)")

    conn.close()

if __name__ == '__main__':
    main()
