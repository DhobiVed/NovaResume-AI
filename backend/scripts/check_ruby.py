import sqlite3
conn = sqlite3.connect("novaresume.db")
cur = conn.cursor()
print("=== Ruby control_flow: topic/status breakdown ===")
cur.execute("SELECT topic_id, validation_status, COUNT(*) FROM question_bank_items WHERE language_id='ruby' AND subject_id='control_flow' GROUP BY topic_id, validation_status")
for r in cur.fetchall(): print(f"  {r[0]} | {r[1]} | {r[2]}")

print("\n=== Ruby ALL verified topics ===")
cur.execute("SELECT topic_id, COUNT(*) FROM question_bank_items WHERE language_id='ruby' AND validation_status='VERIFIED' GROUP BY topic_id ORDER BY COUNT(*) DESC")
for r in cur.fetchall(): print(f"  {r[0]}: {r[1]}")
conn.close()
