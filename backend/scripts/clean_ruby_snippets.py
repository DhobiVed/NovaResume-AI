import sqlite3
import re

conn = sqlite3.connect('novaresume.db')
cur = conn.cursor()

cur.execute("""
    SELECT id, code_snippet 
    FROM question_bank_items 
    WHERE language_id = 'ruby' AND code_snippet LIKE '%fun branch_%'
""")
branch_rows = cur.fetchall()
print(f"Ruby branch questions to fix: {len(branch_rows)}")

cur.execute("""
    SELECT id, code_snippet 
    FROM question_bank_items 
    WHERE language_id = 'ruby' AND code_snippet LIKE '%fun factorial_%'
""")
fact_rows = cur.fetchall()
print(f"Ruby factorial questions to fix: {len(fact_rows)}")

for qid, code in branch_rows:
    m_num = re.search(r'branch_(\d+)', code)
    m_val = re.search(r'val\s+val\s*=\s*(\d+)', code)
    m_lim = re.search(r'val\s+limit\s*=\s*(\d+)', code)
    if m_num and m_val and m_lim:
        b_num = m_num.group(1)
        b_val = m_val.group(1)
        b_lim = m_lim.group(1)
        clean_ruby = f"""def branch_{b_num}
  val = {b_val}
  limit = {b_lim}
  if val > limit
    val * 2
  else
    val + 10
  end
end
puts branch_{b_num}"""
        cur.execute("UPDATE question_bank_items SET code_snippet = ? WHERE id = ?", (clean_ruby, qid))

for qid, code in fact_rows:
    m_num = re.search(r'factorial_(\d+)', code)
    m_arg = re.search(r'factorial_\d+\((\d+)\)', code)
    if m_num:
        f_num = m_num.group(1)
        f_arg = m_arg.group(1) if m_arg else '3'
        clean_ruby = f"""def factorial_{f_num}(n)
  return 1 if n <= 1
  n * factorial_{f_num}(n - 1)
end
puts factorial_{f_num}({f_arg})"""
        cur.execute("UPDATE question_bank_items SET code_snippet = ? WHERE id = ?", (clean_ruby, qid))

conn.commit()
print("Ruby code snippets successfully cleaned to pure Ruby!")

# Verify:
cur.execute("SELECT COUNT(*) FROM question_bank_items WHERE language_id = 'ruby' AND code_snippet LIKE '%fun %'")
rem = cur.fetchone()[0]
print(f"Remaining Kotlin 'fun ' snippets in Ruby: {rem}")

conn.close()
