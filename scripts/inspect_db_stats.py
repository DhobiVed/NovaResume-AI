import sqlite3

conn = sqlite3.connect('backend/novaresume.db')
cursor = conn.cursor()
cursor.execute('SELECT distinct language_id FROM question_bank_items')
langs = [r[0] for r in cursor.fetchall()]
print(f"Total languages in novaresume.db: {len(langs)}")
print(f"Languages sample: {langs[:20]}")

cursor.execute("SELECT count(*) FROM question_bank_items WHERE validation_status = 'VERIFIED'")
print(f"Total verified in DB: {cursor.fetchone()[0]}")

for sample_lang in ['java', 'python', 'javascript', 'sql', 'cpp', 'assembly']:
    cursor.execute("SELECT count(*), count(distinct topic_id), count(distinct primary_concept) FROM question_bank_items WHERE language_id = ? AND validation_status = 'VERIFIED'", (sample_lang,))
    q_cnt, top_cnt, con_cnt = cursor.fetchone()
    print(f"DB {sample_lang}: {q_cnt} questions, {top_cnt} topics, {con_cnt} concepts")
conn.close()
