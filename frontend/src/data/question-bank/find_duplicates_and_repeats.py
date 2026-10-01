import json
import os

base_dir = os.path.join(os.path.dirname(__file__), "programming")
all_files = [f for f in os.listdir(base_dir) if f.endswith(".json")]

print("=== CHECKING QUESTION BANKS FOR INTERNAL DUPLICATES ===")
for file in sorted(all_files):
    file_path = os.path.join(base_dir, file)
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    questions = data.get("questions", [])
    id_counts = {}
    text_counts = {}

    for q in questions:
        qid = q.get("id")
        prompt = (q.get("question") or "").strip().lower()
        id_counts[qid] = id_counts.get(qid, 0) + 1
        text_counts[prompt] = text_counts.get(prompt, 0) + 1

    dup_ids = {k: v for k, v in id_counts.items() if v > 1}
    dup_texts = {k: v for k, v in text_counts.items() if v > 1}

    print(f"{file}: {len(questions)} questions | Duplicate IDs: {len(dup_ids)} | Duplicate Prompts: {len(dup_texts)}")
    if dup_ids:
        print(f"  Sample Duplicate IDs: {list(dup_ids.items())[:3]}")
    if dup_texts:
        print(f"  Sample Duplicate Prompts: {[k[:60] for k in list(dup_texts.keys())[:3]]}")
