import json
import glob
import os

files = glob.glob('../data/mcqs_100000/*.json')
print(f"Found {len(files)} JSON files")

results = []
for fpath in sorted(files):
    fname = os.path.basename(fpath)
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading {fname}: {e}")
        continue
    
    if not isinstance(data, list):
        print(f"{fname} is not a list, it is {type(data)}")
        continue

    cf = [q for q in data if isinstance(q, dict) and q.get('topicId') == 'control_flow']
    loops = 0
    recur = 0
    branch = 0
    theory = 0
    kotlin_syntax = 0
    for q in cf:
        code = q.get('codeSnippet') or ''
        qid = q.get('id', '')
        if '-t-' in qid or not code.strip():
            theory += 1
        elif 'loop_' in code or 'for ' in code or '.each' in code:
            loops += 1
        elif 'factorial_' in code or 'recur' in code.lower():
            recur += 1
        elif 'branch_' in code or 'if ' in code:
            branch += 1
        if 'fun ' in code or 'val ' in code:
            kotlin_syntax += 1

    results.append((fname, len(data), len(cf), loops, recur, branch, theory, kotlin_syntax))

print(f"{'Filename':<32} | {'Total':<5} | {'CF':<4} | {'Loop':<4} | {'Rec':<4} | {'Brch':<4} | {'Thry':<4} | {'Kotlin?':<7}")
print("-" * 80)
for r in results:
    print(f"{r[0]:<32} | {r[1]:<5} | {r[2]:<4} | {r[3]:<4} | {r[4]:<4} | {r[5]:<4} | {r[6]:<4} | {r[7]:<7}")
