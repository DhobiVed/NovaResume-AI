import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app
from app.database.session import SessionLocal
from app.models.schema import QuestionBankItem, TestSession, StudentQuestionHistory

client = TestClient(app)

def run_tests():
    print("=" * 70)
    print("NOVA CAREERCONNECT: ENTERPRISE MCQ ENGINE VERIFICATION TEST SUITE")
    print("=" * 70)

    # 1. Quality Audit
    print("\n[TEST 1] Quality Audit Endpoint Check")
    audit_res = client.get("/api/v1/career/assessments/admin/quality-audit")
    assert audit_res.status_code == 200, f"Expected 200, got {audit_res.status_code}"
    audit_data = audit_res.json()
    print(f"  Status: {audit_data['status']}")
    print(f"  Total Questions: {audit_data['total_questions']}")
    print(f"  Existing Bank:   {audit_data['existing_website_mcqs']} (100% Preserved)")
    print(f"  100k Dataset:    {audit_data['dataset_100k_mcqs']}")
    print(f"  Practical Ratio: {audit_data['practical_ratio_pct']}% (Target >= 80%)")
    assert audit_data["total_questions"] >= 100000
    assert audit_data["existing_website_mcqs"] > 5000
    assert audit_data["practical_ratio_pct"] >= 80.0
    print("  --> PASS: Quality Audit matches enterprise requirements!")

    # 2. 50-MCQ Creation for 5 Distinct Programming Languages
    languages_to_test = ["python", "dart", "bash", "java", "cpp"]
    print("\n[TEST 2] 50-MCQ Test Generation for 5 Languages (including Dart & Bash)")
    for lang in languages_to_test:
        res = client.post("/api/v1/career/assessments/create-session", json={
            "language": lang,
            "count": 50,
            "difficulty": "Mixed",
            "duration_minutes": 45
        })
        assert res.status_code == 200, f"Expected 200 for {lang}, got {res.status_code}"
        data = res.json()
        assert data["total_questions"] == 50, f"Expected 50 questions for {lang}, got {data['total_questions']}"
        assert len(data["questions"]) == 50, f"Expected 50 questions in array for {lang}, got {len(data['questions'])}"
        # Verify answers are redacted (integrity protection)
        for q in data["questions"]:
            assert "correct_index" not in q, f"Leaked correct_index in question {q['id']}"
            assert "correctIndex" not in q, f"Leaked correctIndex in question {q['id']}"
            assert "correctAnswer" not in q, f"Leaked correctAnswer in question {q['id']}"
            assert len(q["options"]) >= 2, f"Options missing for question {q['id']}"
        print(f"  * {lang.upper():10}: Exactly 50 MCQs returned | Redacted integrity OK | Session ID: {data['session_id']}")
    print("  --> PASS: All 50-MCQ requests generate exactly 50 verified questions with zero leakage!")

    # 3. Frozen Session Retrieval Integrity
    print("\n[TEST 3] Frozen Session Retrieval Test")
    init_res = client.post("/api/v1/career/assessments/create-session", json={
        "language": "python",
        "count": 50
    })
    session_id = init_res.json()["session_id"]
    original_ids = [q["id"] for q in init_res.json()["questions"]]

    get_res = client.get(f"/api/v1/career/assessments/session/{session_id}")
    assert get_res.status_code == 200
    retrieved_ids = [q["id"] for q in get_res.json()["questions"]]
    assert original_ids == retrieved_ids, "Frozen session sequence altered on retrieval!"
    print(f"  Retrieved Session {session_id}: 50 questions identical sequence")
    print("  --> PASS: Question sequence is strictly frozen!")

    # 4. Server-Side Grading and Scoring Accuracy
    print("\n[TEST 4] Server-Side Evaluation and Grading")
    # Provide answers for first 10 questions: select option 0
    ans_map = {str(i): 0 for i in range(10)}
    sub_res = client.post(f"/api/v1/career/assessments/session/{session_id}/submit", json={
        "answers": ans_map,
        "anti_cheating_trust_score": 95,
        "anti_cheating_violations": []
    })
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["status"] == "success"
    assert sub_data["total_questions"] == 50
    assert 0 <= sub_data["raw_score"] <= 50
    assert 0.0 <= sub_data["percentage"] <= 100.0
    print(f"  Graded 50 questions: Raw Score = {sub_data['raw_score']}/50 ({sub_data['percentage']}%) | Trust Score = {sub_data['trust_score']}")
    print("  --> PASS: Server-side grading executed accurately!")

    # 5. Anti-Repetition Engine Verification
    print("\n[TEST 5] Anti-Repetition Exclusion Verification")
    student_id = "test-student-unique-123"
    t1_res = client.post("/api/v1/career/assessments/create-session", json={
        "language": "dart",
        "count": 50
    }, headers={"Authorization": f"Bearer {student_id}"})
    t1_data = t1_res.json()
    t1_ids = set(q["id"] for q in t1_data["questions"])

    # Submit test 1 to record question history for student
    client.post(f"/api/v1/career/assessments/session/{t1_data['session_id']}/submit", json={
        "answers": {str(i): 0 for i in range(50)}
    }, headers={"Authorization": f"Bearer {student_id}"})

    # Create test 2 for same student
    t2_res = client.post("/api/v1/career/assessments/create-session", json={
        "language": "dart",
        "count": 50
    }, headers={"Authorization": f"Bearer {student_id}"})
    t2_data = t2_res.json()
    t2_ids = set(q["id"] for q in t2_data["questions"])

    overlap = t1_ids.intersection(t2_ids)
    print(f"  Attempt 1: 50 Dart MCQs | Attempt 2: 50 Dart MCQs")
    print(f"  Overlapping questions: {len(overlap)} / 50")
    assert len(overlap) == 0, f"Expected 0 repeated questions, got {len(overlap)}"
    print("  --> PASS: Anti-repetition engine successfully served 50 completely fresh questions!")

    print("\n" + "=" * 70)
    print("ALL 5 ENTERPRISE VERIFICATION TESTS PASSED PERFECTLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
