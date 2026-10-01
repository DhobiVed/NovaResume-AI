"""Check remaining control_flow questions that couldn't be split"""
import sqlite3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.question_classifier import QuestionClassifier

conn = sqlite3.connect(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "novaresume.db"))
cur = conn.cursor()

# Sample the unsplittable control_flow questions
cur.execute("""
    SELECT language_id, id, question_text, code_snippet, primary_concept
    FROM question_bank_items
    WHERE topic_id = 'control_flow' AND validation_status = 'VERIFIED'
    LIMIT 20
""")
rows = cur.fetchall()
print(f"Remaining 'control_flow' questions: {len(rows)} sample")
for r in rows:
    lang, qid, text, code, primary = r
    constructs = QuestionClassifier.detect_constructs(text or "", code or "", lang or "")
    print(f"  lang={lang} | is_loop={constructs['is_loop']} | is_cond={constructs['is_conditional']} | has_recur={constructs['has_recursion']} | primary={primary}")
    print(f"    q: {(text or '')[:80]!r}")
    print(f"    code: {(code or '')[:80]!r}")
    print()

# Count by language
cur.execute("SELECT language_id, COUNT(*) FROM question_bank_items WHERE topic_id='control_flow' AND validation_status='VERIFIED' GROUP BY language_id ORDER BY COUNT(*) DESC")
print("By language:")
for r in cur.fetchall(): print(f"  {r[0]}: {r[1]}")
conn.close()
