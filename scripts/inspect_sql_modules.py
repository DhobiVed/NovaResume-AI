with open('frontend/src/data/programmingLanguagesData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

for target in ['"id": "plsql"', '"id": "tsql"']:
    idx = text.find(target)
    if idx != -1:
        print(f"=== {target} ===")
        print(text[idx:idx+1500])
