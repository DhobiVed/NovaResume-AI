import json

with open('../data/mcqs_100000/08_golang_2000_mcqs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('Total questions in Go file:', len(data))
topics = {}
for q in data:
    t = q.get('topicId')
    topics[t] = topics.get(t, 0) + 1
print('Topic distribution in Go file:', topics)

cf_questions = [q for q in data if q.get('topicId') == 'control_flow']
print('Total control_flow questions:', len(cf_questions))

indices = [0, 10, 59, 60, 70, 119, 120, 130, 179, 180, 199]
for i in indices:
    if i < len(cf_questions):
        q = cf_questions[i]
        code = (q.get('codeSnippet') or '')[:100].replace('\n', ' ')
        qid = q.get('id')
        qtxt = q.get('question', '')[:50]
        print(f"[{i}] id={qid} q={qtxt} code={code}")
