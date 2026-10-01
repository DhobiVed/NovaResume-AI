import sys
import os
import json
import sqlite3
import re

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.assessment_engine import AssessmentEngineService
from app.database.session import SessionLocal
from app.models.schema import StudentQuestionHistory

db = SessionLocal()

test_matrix = [
    ("java", "conditions", 15, "Java", "If-Else"),
    ("java", "loops", 15, "Java", "Loops"),
    ("python", "lists", 15, "Python", "Lists"),
    ("python", "functions", 15, "Python", "Functions"),
    ("cpp", "pointers", 15, "C++", "Pointers"),
    ("javascript", "functions", 15, "JavaScript", "Functions"),
    ("golang", "loops", 15, "Go", "Loops"),
    ("ruby", "loops", 15, "Ruby", "Loops"),
    ("rust", "loops", 15, "Rust", "Loops"),
    ("java", None, 50, "Java", "Final 50-MCQ Assessment")
]

print("=" * 110)
print("EXECUTING FULL SUITE OF STUDENT-FACING MCQ TESTS & RECORDING EVIDENCE")
print("=" * 110)

evidence_records = []
all_inspected_questions = []

# Clean test student history
student_id = "test-evidence-student-1"
db.query(StudentQuestionHistory).filter(StudentQuestionHistory.student_id == student_id).delete()
db.commit()

for lang_id, topic_slug, count, lang_display, topic_display in test_matrix:
    print(f"\n>>> Running Test Session: {lang_display} -> {topic_display} (Requested: {count})")
    
    # Run 1st attempt
    res1 = AssessmentEngineService.create_test_session(
        db=db,
        language=lang_id,
        student_id=student_id,
        topic_id=topic_slug,
        count=count,
        difficulty="Mixed"
    )
    
    q_list_1 = res1.get("questions", [])
    returned_count = len(q_list_1)
    
    # Record history for attempt 1
    for q in q_list_1:
        hist = StudentQuestionHistory(
            student_id=student_id,
            question_id=q["id"],
            test_session_id=res1.get("session_id", "sess-1"),
            is_correct=True,
            response_time_seconds=25
        )
        db.add(hist)
    db.commit()
    
    # Run 2nd attempt to measure repetition avoidance
    res2 = AssessmentEngineService.create_test_session(
        db=db,
        language=lang_id,
        student_id=student_id,
        topic_id=topic_slug,
        count=count,
        difficulty="Mixed"
    )
    q_list_2 = res2.get("questions", [])
    set_q1 = {q["id"] for q in q_list_1}
    set_q2 = {q["id"] for q in q_list_2}
    repeated_in_next = len(set_q1.intersection(set_q2))
    
    # Inspect every question from attempt 1
    correct_topic_count = 0
    correct_lang_count = 0
    practical_count = 0
    theory_count = 0
    dataset_sourced_count = 0
    seen_ids = set()
    internal_duplicates = 0
    
    for idx, q in enumerate(q_list_1):
        qid = q["id"]
        qtxt = q["question"]
        code = q["codeSnippet"] or ""
        prim = q["primaryConcept"]
        top = q["topicId"]
        ptype = q["practicalType"]
        
        # Check duplicate
        if qid in seen_ids:
            internal_duplicates += 1
        seen_ids.add(qid)
        
        # Check dataset sourced
        is_ds = qid.startswith("mcq-")
        if is_ds:
            dataset_sourced_count += 1
            
        # Check practical vs theory
        has_code = bool(code.strip())
        is_prac = has_code or ptype in ["practical", "code_snippet"]
        if is_prac:
            practical_count += 1
        else:
            theory_count += 1
            
        # Topic correctness verification:
        is_topic_correct = True
        combined = f"{qtxt} {code}".lower()
        
        if topic_slug == "conditions":
            is_topic_correct = ("if" in combined or "switch" in combined or "case" in combined or "ternary" in combined or "branch" in combined or "condition" in combined)
        elif topic_slug == "loops":
            is_topic_correct = bool(re.search(r"\b(for|while|do|loop|iterate|each|range)\b", combined))
        elif topic_slug == "lists":
            is_topic_correct = bool("list" in combined or "[" in code or "append" in combined or "index" in combined)
        elif topic_slug == "functions":
            is_topic_correct = bool("func" in combined or "def " in combined or "method" in combined or "return" in combined or "argument" in combined or "call" in combined)
        elif topic_slug == "pointers":
            is_topic_correct = bool("pointer" in combined or "*" in code or "nullptr" in combined or "dynamic" in combined or "memory" in combined or "->" in code)
            
        if is_topic_correct:
            correct_topic_count += 1
            
        all_inspected_questions.append({
            "test": f"{lang_display} -> {topic_display}",
            "index": idx + 1,
            "id": qid,
            "topic": top,
            "concept": prim,
            "is_prac": is_prac,
            "source": "100K_Dataset" if is_ds else "Question_Bank",
            "topic_correct": is_topic_correct
        })
        
    prac_pct = (practical_count / returned_count * 100) if returned_count > 0 else 0
    theory_pct = (theory_count / returned_count * 100) if returned_count > 0 else 0
    ds_pct = (dataset_sourced_count / returned_count * 100) if returned_count > 0 else 0
    
    evidence_records.append({
        "language": lang_display,
        "topic": topic_display,
        "tested": returned_count,
        "correct_topic": f"{correct_topic_count}/{returned_count}",
        "prac_pct": f"{prac_pct:.1f}%",
        "theory_pct": f"{theory_pct:.1f}%",
        "duplicates": internal_duplicates,
        "repeated_next": f"{repeated_in_next} ({repeated_in_next/returned_count*100:.1f}%)" if returned_count > 0 else "0",
        "dataset_pct": f"{ds_pct:.1f}%"
    })

db.close()

print("\n" + "=" * 115)
print("EVIDENCE-BASED REPORT")
print(f"{'Language':<12} | {'Topic':<25} | {'Tested':<6} | {'Correct Topic':<13} | {'Practical %':<11} | {'Theory %':<8} | {'Dups':<4} | {'Repeated Next':<13} | {'Dataset %':<9}")
print("-" * 115)
for r in evidence_records:
    print(f"{r['language']:<12} | {r['topic']:<25} | {r['tested']:<6} | {r['correct_topic']:<13} | {r['prac_pct']:<11} | {r['theory_pct']:<8} | {r['duplicates']:<4} | {r['repeated_next']:<13} | {r['dataset_pct']:<9}")
print("=" * 115)
