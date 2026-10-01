import sqlite3, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.question_classifier import QuestionClassifier

conn = sqlite3.connect(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "novaresume.db"))
cur = conn.cursor()

print("=== Ruby topic distribution ===")
cur.execute("SELECT topic_id, COUNT(*) FROM question_bank_items WHERE language_id='ruby' AND validation_status='VERIFIED' GROUP BY topic_id ORDER BY COUNT(*) DESC")
for r in cur.fetchall()[:20]: print(f"  {r[0]}: {r[1]}")

print("\n=== Ruby control_flow sample questions ===")
cur.execute("SELECT id, topic_id, code_snippet, primary_concept FROM question_bank_items WHERE language_id='ruby' AND subject_id='control_flow' LIMIT 10")
rows = cur.fetchall()
for r in rows:
    code = (r[2] or "")[:120]
    constructs = QuestionClassifier.detect_constructs("", r[2] or "", "ruby")
    print(f"  topic={r[1]} | primary={r[3]} | is_loop={constructs['is_loop']} | has_ruby_iter={constructs.get('has_ruby_iter')}")
    print(f"    code: {code!r}")

print("\n=== Ruby: Search for loop questions ===")
cur.execute("SELECT topic_id, code_snippet FROM question_bank_items WHERE language_id='ruby' AND subject_id='control_flow' AND topic_id='loops' LIMIT 5")
for r in cur.fetchall():
    print(f"  loops: {r[1][:80]!r}")

conn.close()
