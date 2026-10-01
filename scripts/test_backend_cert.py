import sys
import os
sys.path.insert(0, os.path.abspath('backend'))

from app.database.session import SessionLocal
from app.services.assessment_engine import AssessmentEngineService

db = SessionLocal()

print("================================================================================")
print("TESTING BACKEND 50-MCQ CERTIFICATION ENGINE (MULTI-TOPIC BALANCED)")
print("================================================================================")

for lang in ['JavaScript', 'Python', 'Java', 'SQL', 'C++', 'Assembly']:
    res = AssessmentEngineService.create_test_session(
        db=db,
        language=lang,
        student_id='test-student-cert',
        count=50,
        difficulty='Mixed'
    )
    qs = res.get('questions', [])
    prac_cnt = sum(1 for q in qs if (q.get('codeSnippet') and len(q.get('codeSnippet').strip()) > 15))
    theory_cnt = len(qs) - prac_cnt
    
    diffs = {}
    topics = {}
    for q in qs:
        d = q.get('difficulty', 'Unknown')
        diffs[d] = diffs.get(d, 0) + 1
        t = q.get('topicName') or q.get('topicId') or 'general'
        topics[t] = topics.get(t, 0) + 1
        
    ids = [q['id'] for q in qs]
    dups = len(ids) - len(set(ids))
    
    # Check language contamination
    contam = 0
    norm_l = lang.lower()
    for q in qs:
        snip = q.get('codeSnippet') or ''
        if norm_l not in ['java', 'jvm']:
            if 'System.out' in snip or 'public class Loop_' in snip:
                contam += 1
        if norm_l in ['sql', 'plsql', 'tsql']:
            if 'int sum' in snip or 'for (int' in snip:
                contam += 1

    print(f"[{'PASS' if len(qs) == 50 and dups == 0 and contam == 0 else 'FAIL'}] {lang}: {len(qs)} Qs | Practical: {prac_cnt} | Theory: {theory_cnt} | Distinct Topics: {len(topics)} | Dups: {dups} | Contam: {contam}")
    print(f"       Difficulties: {diffs}")
    print(f"       Topic Distribution: {topics}")
    print("-" * 60)

db.close()
