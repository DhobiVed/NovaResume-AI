import json
import sqlite3
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.assessment_engine import AssessmentEngineService
from app.database.session import SessionLocal

db = SessionLocal()

test_cases = [
    ("java", "conditions", 15, "Java -> If-Else"),
    ("java", "loops", 15, "Java -> Loops"),
    ("python", "lists", 15, "Python -> Lists"),
    ("python", "functions", 15, "Python -> Functions"),
    ("cpp", "pointers", 15, "C++ -> Pointers"),
    ("javascript", "functions", 15, "JavaScript -> Functions"),
    ("golang", "loops", 15, "Go -> Loops"),
    ("ruby", "loops", 15, "Ruby -> Loops"),
    ("rust", "loops", 15, "Rust -> Loops"),
    ("java", None, 50, "Final 50-MCQ Assessment (Java)")
]

results = []

for lang, topic, count, label in test_cases:
    print(f"\n==================================================")
    print(f"RUNNING TEST: {label} (count={count})")
    print(f"==================================================")
    
    session_res = AssessmentEngineService.create_test_session(
        db=db,
        language=lang,
        student_id="test-student-e2e-1",
        topic_id=topic,
        count=count,
        difficulty="Mixed"
    )
    
    status = session_res.get("status")
    questions = session_res.get("questions", [])
    shortage = session_res.get("shortage", 0)
    avail = session_res.get("available_count", 0)
    
    print(f"Status: {status} | Available: {avail} | Returned: {len(questions)} | Shortage: {shortage}")
    if session_res.get("shortage_message"):
        print(f"Shortage Message: {session_res.get('shortage_message')}")
        
    # Inspect every question
    prac_count = 0
    theory_count = 0
    seen_ids = set()
    dup_count = 0
    dataset_sourced = 0
    
    for i, q in enumerate(questions):
        qid = q.get("id")
        qtxt = q.get("question", "")[:60].replace("\n", " ")
        code = q.get("codeSnippet") or ""
        ptype = q.get("practicalType")
        prim = q.get("primaryConcept")
        top = q.get("topicId")
        dg = q.get("duplicateGroupId")
        
        is_prac = bool(code.strip()) or ptype in ["practical", "code_snippet"]
        if is_prac:
            prac_count += 1
        else:
            theory_count += 1
            
        if qid in seen_ids:
            dup_count += 1
        seen_ids.add(qid)
        
        if qid.startswith("mcq-"):
            dataset_sourced += 1
            
        print(f"  [{i+1:02d}] {qid} | topic={top} | prim={prim} | is_prac={is_prac} | q={qtxt}")
        if not is_prac:
            print(f"       -> THEORY: {qtxt}")
        if i < 3 and code:
            print(f"       -> CODE SAMPLE: {code[:70].replace(chr(10), ' ')}")
            
    total_q = len(questions)
    prac_pct = (prac_count / total_q * 100) if total_q > 0 else 0
    theory_pct = (theory_count / total_q * 100) if total_q > 0 else 0
    ds_pct = (dataset_sourced / total_q * 100) if total_q > 0 else 0
    
    results.append({
        "label": label,
        "lang": lang,
        "topic": topic,
        "requested": count,
        "returned": total_q,
        "prac_pct": prac_pct,
        "theory_pct": theory_pct,
        "duplicates": dup_count,
        "dataset_pct": ds_pct,
        "status": status
    })

db.close()

print("\n" + "="*80)
print("E2E RUN SUMMARY:")
print(f"{'Test':<30} | {'Req':<4} | {'Ret':<4} | {'Prac%':<6} | {'Thry%':<6} | {'Dups':<4} | {'Dataset%':<8}")
print("-" * 80)
for r in results:
    print(f"{r['label']:<30} | {r['requested']:<4} | {r['returned']:<4} | {r['prac_pct']:<6.1f} | {r['theory_pct']:<6.1f} | {r['duplicates']:<4} | {r['dataset_pct']:<8.1f}")
