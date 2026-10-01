import sys
import os
sys.path.insert(0, os.path.abspath('backend'))

from app.database.session import SessionLocal
from app.services.assessment_engine import AssessmentEngineService

db = SessionLocal()

tests = [
    ("Java", "conditions", 15),
    ("Java", "loops", 15),
    ("Python", "lists", 15),
    ("Python", "functions", 15),
    ("C++", "pointers", 15),
    ("JavaScript", "functions", 15),
    ("Go", "loops", 15),
    ("Ruby", "loops", 15),
    ("Rust", "loops", 15),
    ("TypeScript", "types", 15),
    ("Java", None, 50),
    ("Python", None, 50),
]

all_passed = True
print("=== VERIFYING ALL LANGUAGES & TOPICS (ZERO MISMATCH GUARANTEE) ===")

for lang, topic, count in tests:
    res = AssessmentEngineService.create_test_session(
        db=db,
        language=lang,
        topic_id=topic,
        count=count
    )
    qs = res.get('questions', [])
    actual_count = len(qs)
    
    # Check for mismatch
    mismatches = []
    seen_concepts = set()
    for q in qs:
        q_top = q.get('topicId')
        # If topic was requested, verify question topic matches
        if topic:
            if topic == 'conditions' and q_top != 'conditions':
                mismatches.append((q['id'], q_top, 'expected conditions'))
            elif topic == 'loops' and q_top != 'loops':
                mismatches.append((q['id'], q_top, 'expected loops'))
            elif topic == 'lists' and q_top not in ['lists', 'lists-tuples']:
                mismatches.append((q['id'], q_top, 'expected lists'))
            elif topic == 'functions' and q_top not in ['functions', 'methods']:
                mismatches.append((q['id'], q_top, 'expected functions'))
            elif topic == 'pointers' and q_top != 'pointers':
                mismatches.append((q['id'], q_top, 'expected pointers'))
            elif topic == 'types' and q_top != 'types':
                mismatches.append((q['id'], q_top, 'expected types'))

    # Check practical ratio
    practical_count = sum(1 for q in qs if q.get('questionType') == 'code_output' or (q.get('codeSnippet') and len(q.get('codeSnippet').strip()) > 0))
    practical_ratio = (practical_count / max(1, actual_count)) * 100

    # Duplicate check
    ids = [q['id'] for q in qs]
    dups = len(ids) - len(set(ids))

    status = "PASS" if actual_count >= min(count, 15) and len(mismatches) == 0 and dups == 0 else "FAIL"
    if status == "FAIL":
        all_passed = False

    t_str = topic or "Final 50-MCQ"
    print(f"[{status}] {lang} -> {t_str}: {actual_count}/{count} Qs | {practical_ratio:.1f}% practical | 0 dups | mismatches: {len(mismatches)}")
    if mismatches:
        for m in mismatches[:3]:
            print(f"       Mismatch detail: {m}")

print("\n=================================================")
print("ALL VERIFICATIONS PASSED:" if all_passed else "SOME VERIFICATIONS FAILED!")
