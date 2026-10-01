import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.assessment_engine import AssessmentEngineService
from app.database.session import SessionLocal
from app.models.schema import StudentQuestionHistory

db = SessionLocal()

student_id = "test-repetition-student-99"

# Clean any existing history for this test student
db.query(StudentQuestionHistory).filter(StudentQuestionHistory.student_id == student_id).delete()
db.commit()

print(f"=== Testing Repetition Avoidance across 3 consecutive sessions for Student: {student_id} ===")

test_configs = [
    ("golang", "loops", 15, "Go -> Loops"),
    ("java", "loops", 15, "Java -> Loops"),
    ("python", "functions", 15, "Python -> Functions")
]

for lang, topic, count, label in test_configs:
    print(f"\n------------------------------------------------------------")
    print(f"Testing {label} (Target count={count})")
    print(f"------------------------------------------------------------")
    
    session_qids = []
    
    for attempt in range(1, 4):
        res = AssessmentEngineService.create_test_session(
            db=db,
            language=lang,
            student_id=student_id,
            topic_id=topic,
            count=count,
            difficulty="Mixed"
        )
        qids = [q["id"] for q in res.get("questions", [])]
        session_qids.append(qids)
        print(f"  Attempt {attempt}: returned {len(qids)} questions")
        
        # Simulate student answering these questions (record into StudentQuestionHistory)
        for qid in qids:
            hist = StudentQuestionHistory(
                student_id=student_id,
                question_id=qid,
                test_session_id=res.get("session_id", "sess-test"),
                is_correct=True,
                response_time_seconds=30
            )
            db.add(hist)
        db.commit()
    
    # Calculate overlap
    set1 = set(session_qids[0])
    set2 = set(session_qids[1])
    set3 = set(session_qids[2])
    
    overlap_1_2 = len(set1.intersection(set2))
    overlap_2_3 = len(set2.intersection(set3))
    overlap_1_3 = len(set1.intersection(set3))
    total_unique = len(set1.union(set2).union(set3))
    
    print(f"  Attempt 1 questions: {len(set1)}")
    print(f"  Attempt 2 questions: {len(set2)} | Overlap with Attempt 1: {overlap_1_2} ({overlap_1_2/15*100:.1f}%)")
    print(f"  Attempt 3 questions: {len(set3)} | Overlap with Attempt 2: {overlap_2_3} ({overlap_2_3/15*100:.1f}%)")
    print(f"  Total distinct questions seen across 3 attempts: {total_unique} / 45")

db.close()
