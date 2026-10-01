import json

data = json.load(open('frontend/public/data/mcqs_100000/06_sql_2000_mcqs.json', encoding='utf-8'))
qs = data if isinstance(data, list) else data.get('questions', [])
procedural = []
for q in qs:
    snip = q.get('codeSnippet') or ''
    if 'int ' in snip or 'for (' in snip or 'while (' in snip or 'print(' in snip:
        procedural.append(q)

print(f"Total SQL questions: {len(qs)}")
print(f"Total procedural questions in SQL: {len(procedural)}")
print(f"Pure SQL questions: {len(qs) - len(procedural)}")
topics_proc = {}
for q in procedural:
    t = q.get('topicId') or q.get('topic')
    topics_proc[t] = topics_proc.get(t, 0) + 1
print(f"Procedural questions by topic in SQL: {topics_proc}")
