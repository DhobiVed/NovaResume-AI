import json

with open('../data/mcqs_100000/08_golang_2000_mcqs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cf = [q for q in data if q.get('topicId') == 'control_flow']

print("=== Go Control Flow Questions: Sample 1-5 ===")
for q in cf[0:3]:
    print(q['id'], q['question'])
    print(q['codeSnippet'])
    print("-" * 50)

print("=== Go Control Flow Questions: Recursion (indices 60-63) ===")
for q in cf[60:63]:
    print(q['id'], q['question'])
    print(q['codeSnippet'])
    print("-" * 50)

print("=== Go Control Flow Questions: Branching (indices 120-123) ===")
for q in cf[120:123]:
    print(q['id'], q['question'])
    print(q['codeSnippet'])
    print("-" * 50)
