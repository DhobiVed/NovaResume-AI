import re

with open('../frontend/src/data/programmingLanguagesData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

langs = re.findall(r'"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', text)
print(f"Total languages found: {len(langs)}")
for lid, lname in langs:
    if any(k in lid.lower() or k in lname.lower() for k in ['c++', 'cpp', 'python', 'java', 'go', 'ruby', 'rust', 'pointer']):
        print(f"  {lid}: {lname}")

for target in ['java', 'python', 'javascript', 'cpp', 'golang', 'rust', 'ruby']:
    pos = text.find(f'"id": "{target}"')
    if pos != -1:
        print(f"\n--- {target.upper()} Topics ---")
        end_pos = text.find('},\n  {', pos)
        if end_pos == -1:
            end_pos = pos + 3000
        block = text[pos:end_pos]
        topics = re.findall(r'"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)"', block)
        for tid, ttitle in topics:
            print(f"  {tid:<25}: {ttitle}")
