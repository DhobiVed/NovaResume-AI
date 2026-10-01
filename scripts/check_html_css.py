import json

for lang, fpath in [('HTML', '12_html_2000_mcqs.json'), ('CSS', '13_css_2000_mcqs.json')]:
    data = json.load(open(f'frontend/public/data/mcqs_100000/{fpath}', encoding='utf-8'))
    print(f"=== {lang} Topics ===")
    topics = {}
    for q in data:
        t = q.get('topicId') or q.get('topic')
        topics[t] = topics.get(t, 0) + 1
    for t, c in sorted(topics.items()):
        print(f"  {t}: {c}")
