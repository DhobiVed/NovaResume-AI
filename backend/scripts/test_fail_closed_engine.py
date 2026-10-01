import os
import sys
import unittest
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.services.assessment_engine import AssessmentEngineService
from app.services.question_classifier import QuestionClassifier
from app.models.schema import StudentQuestionHistory, QuestionBankItem

class TestFailClosedQuestionEngine(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_negative_topic_validator_rules(self):
        """Test strict negative validation rejecting loops, recursion, and JVM from conditions."""
        # 1. Loop code must be rejected from conditions
        is_valid, reason = QuestionClassifier.validate_negative_topic(
            "conditions",
            "java-for-loop",
            "What will this print?",
            "for (int i=0; i<5; i++) { if (i==2) break; }"
        )
        self.assertFalse(is_valid)
        self.assertIn("Loop", reason)

        # 2. Recursion must be rejected from conditions
        is_valid, reason = QuestionClassifier.validate_negative_topic(
            "conditions",
            "java-recursion",
            "What is the return value of the recursive factorial function?",
            "static int fact(int n) { if (n<=1) return 1; return n*fact(n-1); }"
        )
        self.assertFalse(is_valid)
        self.assertIn("Recursion", reason)

        # 3. JVM question must be rejected from conditions
        is_valid, reason = QuestionClassifier.validate_negative_topic(
            "conditions",
            "java-jvm-architecture",
            "What does JVM stand for?",
            ""
        )
        self.assertFalse(is_valid)
        self.assertIn("JVM Architecture", reason)

        # 4. Valid pure conditional must pass
        is_valid, reason = QuestionClassifier.validate_negative_topic(
            "conditions",
            "java-if-else",
            "What is printed when x is 10?",
            "int x = 10; if (x > 5) System.out.println(\"A\"); else System.out.println(\"B\");"
        )
        self.assertTrue(is_valid)

    def test_02_java_conditions_pure_topic_isolation(self):
        """Test Java -> Conditions test session has 100% conditional questions and 0 loops/OOP/JVM."""
        res = AssessmentEngineService.create_test_session(
            db=self.db,
            language="java",
            topic_id="conditions",
            count=50
        )
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["total_questions"], 50)
        self.assertTrue(res["is_exact_topic_locked"])

        for q in res["questions"]:
            concept = q.get("primaryConcept", "").lower()
            text = q.get("question", "").lower()
            code = (q.get("codeSnippet") or "").lower()

            # Fail-closed assertion: Zero loops
            self.assertNotIn("for-loop", concept, f"Loop concept leaked: {q['id']}")
            self.assertNotIn("while-loop", concept, f"Loop concept leaked: {q['id']}")
            self.assertNotIn("for (", code, f"Loop construct leaked in code: {q['id']}")
            self.assertNotIn("while (", code, f"Loop construct leaked in code: {q['id']}")

            # Zero JVM or Recursion
            self.assertNotIn("jvm", concept, f"JVM leaked: {q['id']}")
            self.assertNotIn("recursion", concept, f"Recursion leaked: {q['id']}")

    def test_03_duplicate_group_uniqueness(self):
        """Test single-question limit per duplicate_group_id."""
        res = AssessmentEngineService.create_test_session(
            db=self.db,
            language="java",
            topic_id="conditions",
            count=50
        )
        dgs = [q["duplicateGroupId"] for q in res["questions"] if q.get("duplicateGroupId")]
        self.assertEqual(len(dgs), len(set(dgs)), "Found repeated duplicate group IDs within single test session!")

    def test_04_zero_silent_fallback_honest_shortage(self):
        """Test that asking for 100 questions on Java conditions returns only available verified without padding."""
        res = AssessmentEngineService.create_test_session(
            db=self.db,
            language="java",
            topic_id="conditions",
            count=100
        )
        self.assertEqual(res["status"], "success")
        # Bank has 70 verified conditions questions
        self.assertLessEqual(res["total_questions"], 70)
        self.assertGreater(res["shortage"], 0)
        self.assertIsNotNone(res["shortage_message"])
        self.assertIn("No unrelated questions were added", res["shortage_message"])

    def test_05_anti_repetition_across_student_attempts(self):
        """Test that past answered questions are excluded on subsequent test sessions for that student."""
        test_student_id = "test-failclosed-student-999"
        # Cleanup past test artifacts
        self.db.query(StudentQuestionHistory).filter_by(student_id=test_student_id).delete()
        self.db.commit()

        s1 = AssessmentEngineService.create_test_session(
            db=self.db,
            language="java",
            topic_id="conditions",
            count=20,
            student_id=test_student_id
        )
        s1_ids = {q["id"] for q in s1["questions"]}

        # Simulate answering these questions
        for qid in s1_ids:
            self.db.add(StudentQuestionHistory(
                student_id=test_student_id,
                question_id=qid,
                test_session_id=s1["session_id"],
                selected_index=0,
                is_correct=True
            ))
        self.db.commit()

        # Second session for same student
        s2 = AssessmentEngineService.create_test_session(
            db=self.db,
            language="java",
            topic_id="conditions",
            count=20,
            student_id=test_student_id
        )
        s2_ids = {q["id"] for q in s2["questions"]}

        overlap = s1_ids.intersection(s2_ids)
        self.assertEqual(len(overlap), 0, f"Anti-repetition failed: repeated questions {overlap}")

        # Cleanup
        self.db.query(StudentQuestionHistory).filter_by(student_id=test_student_id).delete()
        self.db.commit()

if __name__ == "__main__":
    unittest.main()
