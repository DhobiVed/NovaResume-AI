import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "novaresume.db")

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    langs = ['python', 'cpp', 'csharp', 'javascript', 'golang', 'rust', 'php', 'ruby', 'swift', 'kotlin']
    print(f"{'Language':<12} | {'Conditions':<10} | {'Loops':<10} | {'Recursion':<10} | {'Functions':<10} | {'Data Struct':<12} | {'OOP':<10}")
    print("-" * 85)
    
    for lang in langs:
        cur.execute("""
            SELECT topic_id, count(*) 
            FROM question_bank_items 
            WHERE lower(language_id) = ? 
            GROUP BY topic_id
        """, (lang,))
        counts = dict(cur.fetchall())
        
        cond = counts.get('conditions', 0)
        loops = counts.get('loops', 0)
        rec = counts.get('recursion', 0)
        func = counts.get('functions', counts.get('functions_scope', counts.get('functions_async', 0)))
        ds = counts.get('data_structures', counts.get('objects_arrays', 0))
        oop = counts.get('classes-objects', counts.get('oop_abstractions', 0))
        
        print(f"{lang:<12} | {cond:<10} | {loops:<10} | {rec:<10} | {func:<10} | {ds:<12} | {oop:<10}")
        
    conn.close()

if __name__ == "__main__":
    main()
