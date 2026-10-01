import sqlite3

conn = sqlite3.connect('backend/novaresume.db')
c = conn.cursor()

for qid in ['mcq-python-p-01233', 'mcq-python-p-01013', 'mcq-javascript-p-00843']:
    r = c.execute("SELECT id, topic_id, subtopic_id, topic_name, module_id, question_text FROM question_bank_items WHERE id = ?", (qid,)).fetchone()
    print(r)
