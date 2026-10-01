import json
import os
import re

base_dir = os.path.join(os.path.dirname(__file__), "programming")

# Regex rules for Python / Other Languages
FORBIDDEN_PATTERNS = [
    re.compile(r'\bconsole\.log\s*\('),
    re.compile(r'\bNumber\.MAX_SAFE_INTEGER\b'),
    re.compile(r'===')
]

def cleanse_file(filename, default_lang):
    file_path = os.path.join(base_dir, filename)
    if not os.path.exists(file_path):
        return

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    quarantined = 0
    cleansed_questions = []

    for q in data["questions"]:
        code = q.get("codeSnippet") or ""
        topic = (q.get("topicName") or q.get("topic") or "").lower()
        lang = (q.get("programmingLanguage") or default_lang).lower()

        is_corrupt = False
        reason = ""

        # Check forbidden tokens if non-JS
        if "javascript" not in lang and "js" not in lang and "typescript" not in lang:
            for pat in FORBIDDEN_PATTERNS:
                if pat.search(code):
                    is_corrupt = True
                    reason = "Cross-language token mismatch"
                    break

        # Check if-else with only loop
        if ("if" in topic or "condition" in topic) and not ("loop" in topic):
            has_cond = bool(re.search(r'\b(if|else|switch|elif)\b', code, re.IGNORECASE))
            has_loop = bool(re.search(r'\b(for|while)\b', code, re.IGNORECASE))
            if has_loop and not has_cond:
                is_corrupt = True
                reason = "Construct mismatch: Loop in if-else topic"

        if is_corrupt:
            quarantined += 1
            q["status"] = "QUARANTINED"
            q["verified"] = False
            q["rejectionReasons"] = [reason]
        
        cleansed_questions.append(q)

    data["questions"] = cleansed_questions
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"[OK] {filename}: marked {quarantined} questions as QUARANTINED.")

cleanse_file("other_languages.json", "other")
cleanse_file("python.json", "python")
