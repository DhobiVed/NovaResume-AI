import sqlite3

conn = sqlite3.connect('novaresume.db')
cur = conn.cursor()

print("=== Go Language ID Counts ===")
cur.execute("SELECT language_id, COUNT(*) FROM question_bank_items WHERE language_id IN ('go', 'golang') GROUP BY language_id")
for r in cur.fetchall():
    print(r)

print("\n=== GO-AUTH Questions Count and Topics ===")
cur.execute("SELECT topic_id, COUNT(*) FROM question_bank_items WHERE id LIKE 'GO-AUTH-%' GROUP BY topic_id")
for r in cur.fetchall():
    print(r)

print("\n=== Golang Imported Dataset Questions (mcq-golang-%) Topics ===")
cur.execute("SELECT topic_id, COUNT(*) FROM question_bank_items WHERE id LIKE 'mcq-golang-%' GROUP BY topic_id")
for r in cur.fetchall():
    print(r)

conn.close()
