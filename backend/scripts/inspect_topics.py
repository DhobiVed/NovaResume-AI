import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'novaresume.db')
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Check cross-contamination in DB
rows = c.execute("""
    SELECT id, language_id, skill_id, topic_id, question_text, code_snippet 
    FROM question_bank_items 
    WHERE language_id = 'javascript' AND (code_snippet LIKE '%public static void%' OR code_snippet LIKE '%System.out.println%' OR question_text LIKE '%In Java%')
    LIMIT 10
""").fetchall()
for r in rows:
    print(f"ID: {r[0]} | lang: {r[1]} | skill: {r[2]} | topic: {r[3]}")
    print(f"  Question: {r[4]}")
    print(f"  Code: {repr((r[5] or '')[:100])}")
conn.close()
