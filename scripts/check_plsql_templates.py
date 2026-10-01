import json

for file in ['33_plsql_2000_mcqs.json', '34_tsql_2000_mcqs.json']:
    with open('frontend/public/data/mcqs_100000/' + file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"=== {file} ===")
    procedural = [q for q in data if 'int sum' in (q.get('codeSnippet') or '')]
    print(f"Total procedural questions: {len(procedural)}")
    snippets = set()
    for q in procedural[:10]:
        print(f"ID: {q['id']}, Topic: {q['topicId']}")
        print(q['codeSnippet'])
        print("-" * 40)
