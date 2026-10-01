import sqlite3

conn = sqlite3.connect('backend/novaresume.db')
c = conn.cursor()

rows = c.execute("""
    SELECT topic_id, topic_name, count(1) 
    FROM question_bank_items 
    WHERE topic_id IN ('conditions', 'loops', 'recursion', 'control_flow') 
    GROUP BY topic_id, topic_name
""").fetchall()

for r in rows:
    print(r)
