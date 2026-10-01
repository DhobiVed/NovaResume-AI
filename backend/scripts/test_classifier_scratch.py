import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.question_classifier import QuestionClassifier

# Test 1: Genuine Java If-Else
code1 = 'int a = 10; if (a > 5) { System.out.println("High"); } else { System.out.println("Low"); }'
p1, sec1, top1, conf1 = QuestionClassifier.determine_primary_concept('java', 'conditions', 'What is the output?', code1)
val1, r1 = QuestionClassifier.validate_negative_topic('conditions', p1, 'What is the output?', code1)
print('Test 1 If-Else:', p1, top1, 'Valid:', val1, r1)
assert val1 is True

# Test 2: JVM question in conditions
p2, sec2, top2, conf2 = QuestionClassifier.determine_primary_concept('java', 'conditions', 'What does JVM stand for?', None)
val2, r2 = QuestionClassifier.validate_negative_topic('conditions', p2, 'What does JVM stand for?', None)
print('Test 2 JVM definition:', p2, top2, 'Valid:', val2, r2)
assert val2 is False

# Test 3: Loop with internal if
code3 = 'int sum = 0; for (int i = 0; i < 5; i++) { if (i == 2) continue; sum += i; }'
p3, sec3, top3, conf3 = QuestionClassifier.determine_primary_concept('java', 'conditions', 'What will be the final value of sum in the loop?', code3)
val3, r3 = QuestionClassifier.validate_negative_topic('conditions', p3, 'What will be the final value of sum in the loop?', code3)
print('Test 3 Loop with internal if:', p3, top3, 'Valid:', val3, r3)
assert val3 is False

# Test 4: Duplicate Group
dg1 = QuestionClassifier.compute_duplicate_group_id('What is output of x = 10 and x > 5?', ['10', '5', 'True', 'False'], 'int x = 10;', 'java')
dg2 = QuestionClassifier.compute_duplicate_group_id('what is output of x=10 and x>5?', ['10', '5', 'true', 'false'], 'int x = 10;', 'java')
print('Test 4 Duplicate Groups:', dg1, dg2)
assert dg1 == dg2

print('\nAll QuestionClassifier unit assertions PASSED!')
