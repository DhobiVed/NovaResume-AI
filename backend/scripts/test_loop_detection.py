import sys
sys.path.insert(0, 'C:/Users/dhobi/Downloads/chatbot-main/chatbot-main/backend')
from app.services.question_classifier import QuestionClassifier

tests = [
    ('golang', 'control_flow', 'What is the output?', 'for i := 1; i <= 6; i++ { fmt.Println(i) }'),
    ('golang', 'control_flow', 'What does this compute?', 'for _, v := range nums { sum += v }'),
    ('ruby', 'control_flow', 'Output?', '(1..5).each do |i|; puts i; end'),
    ('python', 'control_flow', 'Output?', 'for i in range(10):\n    print(i)'),
    ('rust', 'control_flow', 'What happens?', 'let mut i = 0; loop { if i >= 5 { break; } i += 1; }'),
    ('rust', 'control_flow', 'Output?', 'for i in 0..10 { println!("{}", i); }'),
    ('java', 'control_flow', 'Output?', 'for (int i = 0; i < 5; i++) { System.out.println(i); }'),
    ('java', 'control_flow', 'Output?', 'if (x > 0) { return true; } else { return false; }'),
]

print(f"{'Language':<12} {'Topic':<15} {'is_loop':<8} {'is_cond':<8} {'canonical':<20} {'primary'}")
print("-" * 100)
for lang, topic, text, code in tests:
    c = QuestionClassifier.detect_constructs(text, code, lang)
    p, s, ct, conf = QuestionClassifier.determine_primary_concept(lang, topic, text, code)
    print(f"{lang:<12} {topic:<15} {str(c['is_loop']):<8} {str(c['is_conditional']):<8} {ct:<20} {p}")
