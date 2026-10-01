import sqlite3
import json
import os
import re

print("=== FIXING C# SYNTAX CONTAMINATION IN DB AND JSON FILES ===")

def clean_csharp_code(code: str) -> str:
    if not code:
        return code
    c = code
    c = c.replace("System.out.println", "Console.WriteLine")
    c = c.replace("System.out.print", "Console.Write")
    c = c.replace("public static void main(String[] args)", "static void Main(string[] args)")
    c = c.replace("public static void main(string[] args)", "static void Main(string[] args)")
    c = re.sub(r'public class (Loop_\d+|Branch_\d+|Fact_\d+|Calc_\d+)', r'class \1', c)
    c = re.sub(r'\bprint\(', 'Console.WriteLine(', c)
    return c

# 1. Update SQLite novaresume.db
conn = sqlite3.connect('backend/novaresume.db')
cursor = conn.cursor()
cursor.execute("SELECT id, code_snippet, question_text, explanation FROM question_bank_items WHERE language_id IN ('csharp', 'c#')")
rows = cursor.fetchall()
updated_db_count = 0
for q_id, snippet, q_text, exp in rows:
    needs_update = False
    new_snippet = snippet
    new_text = q_text
    new_exp = exp
    if snippet and ("System.out" in snippet or "public static void main" in snippet or "print(" in snippet):
        new_snippet = clean_csharp_code(snippet)
        needs_update = True
    if q_text and "System.out" in q_text:
        new_text = new_text.replace("System.out.println", "Console.WriteLine").replace("System.out.print", "Console.Write")
        needs_update = True
    if exp and "System.out" in exp:
        new_exp = new_exp.replace("System.out.println", "Console.WriteLine").replace("System.out.print", "Console.Write")
        needs_update = True
    
    if needs_update:
        cursor.execute("UPDATE question_bank_items SET code_snippet = ?, question_text = ?, explanation = ? WHERE id = ?",
                       (new_snippet, new_text, new_exp, q_id))
        updated_db_count += 1

conn.commit()
conn.close()
print(f"Updated {updated_db_count} C# questions in novaresume.db")

# 2. Update frontend/public/data/mcqs_100000/05_csharp_2000_mcqs.json
csharp_pub = 'frontend/public/data/mcqs_100000/05_csharp_2000_mcqs.json'
with open(csharp_pub, 'r', encoding='utf-8') as f:
    data = json.load(f)
qs = data if isinstance(data, list) else data.get('questions', [])
updated_pub_count = 0
for q in qs:
    snip = q.get('codeSnippet')
    if snip and ("System.out" in snip or "public static void main" in snip or "print(" in snip):
        q['codeSnippet'] = clean_csharp_code(snip)
        updated_pub_count += 1
    if q.get('question') and "System.out" in q['question']:
        q['question'] = q['question'].replace("System.out.println", "Console.WriteLine")
    if q.get('explanation') and "System.out" in q['explanation']:
        q['explanation'] = q['explanation'].replace("System.out.println", "Console.WriteLine")

with open(csharp_pub, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
print(f"Updated {updated_pub_count} C# questions in {csharp_pub}")

# 3. Update frontend/src/data/question-bank/programming/csharp.json
csharp_src = 'frontend/src/data/question-bank/programming/csharp.json'
with open(csharp_src, 'r', encoding='utf-8') as f:
    data_src = json.load(f)
qs_src = data_src.get('questions', []) if isinstance(data_src, dict) else data_src
updated_src_count = 0
for q in qs_src:
    snip = q.get('codeSnippet')
    if snip and ("System.out" in snip or "public static void main" in snip or "print(" in snip):
        q['codeSnippet'] = clean_csharp_code(snip)
        updated_src_count += 1
    if q.get('question') and "System.out" in q['question']:
        q['question'] = q['question'].replace("System.out.println", "Console.WriteLine")
    if q.get('explanation') and "System.out" in q['explanation']:
        q['explanation'] = q['explanation'].replace("System.out.println", "Console.WriteLine")

with open(csharp_src, 'w', encoding='utf-8') as f:
    json.dump(data_src, f, indent=2)
print(f"Updated {updated_src_count} C# questions in {csharp_src}")

# Verify 0 System.out in C# now
with open(csharp_pub, 'r', encoding='utf-8') as f:
    c_check = json.load(f)
sys_remaining = sum(1 for q in c_check if 'System.out' in str(q))
print(f"Remaining System.out in C# public file: {sys_remaining}")
