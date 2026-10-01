"""
fix_remaining_syllabus_mismatches.py
Cleans up the final set of AUTH questions and canonical topic synonyms so that:
1. Thread join/lock questions are strictly in 'concurrency', NOT 'exceptions'.
2. File extension questions are strictly in 'syntax-fundamentals', NOT 'classes'.
3. Entry point questions are strictly in 'syntax-fundamentals', NOT 'exceptions'.
4. Canonical topic synonyms (file-io, exception-handling, oop, data-types, types) are perfectly harmonized.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'novaresume.db')

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    print("Fixing remaining syllabus mismatches and out-of-place AUTH questions...")

    # 1. Move thread/lock/concurrency questions out of exception-handling
    c.execute("""
        UPDATE question_bank_items
        SET topic_id = 'concurrency',
            topic_name = 'Multithreading & Concurrency',
            primary_concept = language_id || '-concurrency'
        WHERE (question_text LIKE '%thread%' OR question_text LIKE '%StampedLock%' OR code_snippet LIKE '%Thread.%' OR code_snippet LIKE '%StampedLock%')
          AND lower(topic_id) IN ('exceptions', 'exception-handling')
    """)
    print(f"  Moved thread questions to concurrency: {c.rowcount} rows")

    # 2. Move entry point / main method questions out of exceptions
    c.execute("""
        UPDATE question_bank_items
        SET topic_id = 'syntax-fundamentals',
            topic_name = 'Syntax & Fundamentals',
            primary_concept = language_id || '-syntax'
        WHERE (question_text LIKE '%entry point%' OR question_text LIKE '%main function%' OR question_text LIKE '%main method%')
          AND lower(topic_id) IN ('exceptions', 'exception-handling', 'classes', 'classes-objects')
    """)
    print(f"  Moved entry point questions to syntax-fundamentals: {c.rowcount} rows")

    # 3. Move file extension questions out of classes / oop / exceptions
    c.execute("""
        UPDATE question_bank_items
        SET topic_id = 'syntax-fundamentals',
            topic_name = 'Syntax & Fundamentals',
            primary_concept = language_id || '-syntax'
        WHERE (question_text LIKE '%file extension%' OR question_text LIKE '%standard extension%')
          AND lower(topic_id) IN ('classes', 'classes-objects', 'oop', 'exceptions', 'exception-handling')
    """)
    print(f"  Moved extension questions to syntax-fundamentals: {c.rowcount} rows")

    # 4. Harmonize synonyms in DB:
    # exception-handling -> exceptions
    c.execute("UPDATE question_bank_items SET topic_id = 'exceptions' WHERE topic_id = 'exception-handling'")
    print(f"  Harmonized exception-handling -> exceptions: {c.rowcount} rows")

    # file-io -> file-handling
    c.execute("UPDATE question_bank_items SET topic_id = 'file-handling' WHERE topic_id = 'file-io'")
    print(f"  Harmonized file-io -> file-handling: {c.rowcount} rows")

    # data-types -> datatypes
    c.execute("UPDATE question_bank_items SET topic_id = 'datatypes' WHERE topic_id = 'data-types'")
    print(f"  Harmonized data-types -> datatypes: {c.rowcount} rows")

    # oop -> classes-objects
    c.execute("UPDATE question_bank_items SET topic_id = 'classes-objects' WHERE topic_id = 'oop'")
    print(f"  Harmonized oop -> classes-objects: {c.rowcount} rows")

    # pointers-memory -> pointers
    c.execute("UPDATE question_bank_items SET topic_id = 'pointers' WHERE topic_id = 'pointers-memory'")
    print(f"  Harmonized pointers-memory -> pointers: {c.rowcount} rows")

    # For TypeScript: map type-system to 'types' as well so TypeScript -> types has full coverage
    c.execute("""
        UPDATE question_bank_items 
        SET topic_id = 'types', topic_name = 'Basic Types (string, number, boolean, array, tuple)'
        WHERE lower(language_id) = 'typescript' AND topic_id = 'type-system'
    """)
    print(f"  Mapped TypeScript type-system -> types: {c.rowcount} rows")

    conn.commit()
    conn.close()
    print("Database updates committed!")

if __name__ == '__main__':
    main()
