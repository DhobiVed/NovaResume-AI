import sqlite3
import re

conn = sqlite3.connect('novaresume.db')
cur = conn.cursor()

# 1. Clean array_ questions
cur.execute("""
    SELECT id, code_snippet 
    FROM question_bank_items 
    WHERE language_id = 'ruby' AND code_snippet LIKE '%fun array_%'
""")
for qid, code in cur.fetchall():
    m_num = re.search(r'array_(\d+)', code)
    m_arr = re.search(r'val\s+arr\s*=\s*\[([^\]]+)\]', code)
    m_ret = re.search(r'return\s+([^;]+);', code)
    if m_num and m_arr and m_ret:
        num = m_num.group(1)
        arr = m_arr.group(1)
        ret = m_ret.group(1)
        clean = f"""def array_{num}
  arr = [{arr}]
  {ret}
end
puts array_{num}"""
        cur.execute("UPDATE question_bank_items SET code_snippet = ? WHERE id = ?", (clean, qid))

# 2. Clean stream_ questions
cur.execute("""
    SELECT id, code_snippet 
    FROM question_bank_items 
    WHERE language_id = 'ruby' AND code_snippet LIKE '%fun stream_%'
""")
for qid, code in cur.fetchall():
    m_num = re.search(r'stream_(\d+)', code)
    m_items = re.search(r'val\s+items\s*=\s*\[([^\]]+)\]', code)
    m_mult = re.search(r'x\s*\*\s*(\d+)', code)
    if m_num and m_items and m_mult:
        num = m_num.group(1)
        items = m_items.group(1)
        mult = m_mult.group(1)
        clean = f"""def stream_{num}
  items = [{items}]
  items.map {{ |x| x * {mult} }}.sum
end
puts stream_{num}"""
        cur.execute("UPDATE question_bank_items SET code_snippet = ? WHERE id = ?", (clean, qid))

conn.commit()

cur.execute("SELECT COUNT(*) FROM question_bank_items WHERE language_id = 'ruby' AND code_snippet LIKE '%fun %'")
rem = cur.fetchone()[0]
print(f"Remaining Kotlin 'fun ' snippets in Ruby: {rem}")

conn.close()
