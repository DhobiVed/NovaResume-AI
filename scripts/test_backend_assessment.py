import sys
import os
sys.path.insert(0, os.path.abspath('backend'))

from app.database.session import SessionLocal
from app.services.assessment_engine import AssessmentEngineService

db = SessionLocal()

print("--- Test Backend with topic_id='conditions' ---")
res1 = AssessmentEngineService.create_test_session(
    db=db,
    language="Java",
    topic_id="conditions",
    count=15
)
print("Res1 status/shortage:", res1.get('status'), res1.get('shortage_message'))
print("Res1 questions count:", len(res1.get('questions', [])))
for i, q in enumerate(res1.get('questions', [])):
    print(f"  Q{i+1}: [{q['id']}] topicId={q.get('topicId')}, topic={q.get('topicName')}, snippet={q.get('codeSnippet', '')[:40]}")

print("\n--- Test Backend with topic_id='If-Else & Switch Statements' ---")
res2 = AssessmentEngineService.create_test_session(
    db=db,
    language="Java",
    topic_id="If-Else & Switch Statements",
    count=15
)
print("Res2 status/shortage:", res2.get('status'), res2.get('shortage_message'))
print("Res2 questions count:", len(res2.get('questions', [])))
for i, q in enumerate(res2.get('questions', [])):
    print(f"  Q{i+1}: [{q['id']}] topicId={q.get('topicId')}, topic={q.get('topicName')}, snippet={q.get('codeSnippet', '')[:40]}")
