import json

data = json.load(open('frontend/public/data/mcqs_100000/12_html_2000_mcqs.json', encoding='utf-8'))
loop_qs = [q for q in data if q.get('topicId') == 'loops'][:3]
for q in loop_qs:
    print(q.get('id'), q.get('question'))
    print(q.get('codeSnippet'))
