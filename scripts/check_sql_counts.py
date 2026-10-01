import json

data = json.load(open('frontend/public/data/mcqs_100000/06_sql_2000_mcqs.json', encoding='utf-8'))
syllabus_topics = ['select', 'where', 'crud', 'orderby', 'joins', 'groupby', 'aggregate-functions', 'create-table', 'keys', 'indexes']

for st in syllabus_topics:
    matching = [q for q in data if q.get('topicId') == st or q.get('topic') == st]
    print(f"SQL syllabus topic '{st}': {len(matching)} questions")
