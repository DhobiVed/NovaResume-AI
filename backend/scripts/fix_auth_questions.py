import sqlite3
import re

conn = sqlite3.connect('novaresume.db')
cur = conn.cursor()

print("=== Fixing *-AUTH-* Mislabeled Questions ===")

# Query all AUTH questions
cur.execute("""
    SELECT id, language_id, topic_id, question_text, code_snippet 
    FROM question_bank_items 
    WHERE id LIKE '%-AUTH-%'
""")
rows = cur.fetchall()
print(f"Total *-AUTH-* questions: {len(rows)}")

reclassified = 0
quarantined = 0

for r in rows:
    qid, lang, topic, text, code = r
    text_lower = (text or "").lower()
    code_str = code or ""

    # Check if this is one of the templated environmental/tooling questions
    is_tooling = bool(re.search(
        r"\b(file extension|compiler|runtime|typing|package manager|entrypoint|enum|union|intersection|optional property|identifier is exported|never use it|import a package)\b",
        text_lower
    ))

    if is_tooling and topic in ['loops', 'classes-objects', 'conditions', 'functions', 'concurrency', 'data-structures']:
        # This question was falsely tagged as loops/classes/conditions/etc.
        new_topic = "syntax-fundamentals"
        cur.execute("""
            UPDATE question_bank_items 
            SET topic_id = ?, subtopic_id = ?, primary_concept = ?
            WHERE id = ?
        """, (new_topic, new_topic, f"{lang}-syntax-fundamentals", qid))
        reclassified += 1

    elif topic == 'loops':
        # Check if question actually tests loops
        has_loop = bool(re.search(r"\b(for\s+loop|while\s+loop|do-while|looping|iteration|iterates|iterating)\b", text_lower))
        has_loop_code = bool(re.search(r"\b(for\s*\(|for\s+\w|while\s*\(|while\s+\w|\.each\b|loop\s*\{)", code_str))
        if not has_loop and not has_loop_code:
            # Not a loop question!
            cur.execute("""
                UPDATE question_bank_items 
                SET topic_id = 'syntax-fundamentals', subtopic_id = 'syntax-fundamentals', primary_concept = ?
                WHERE id = ?
            """, (f"{lang}-syntax-fundamentals", qid))
            reclassified += 1

    elif topic in ['conditions', 'conditionals']:
        has_cond = bool(re.search(r"\b(if-else|if statement|switch statement|case statement|conditional|boolean expression)\b", text_lower))
        has_cond_code = bool(re.search(r"\b(if\s*\(|if\s+\w|switch\s*\(|\?\s*[^:]+\s*:)", code_str))
        if not has_cond and not has_cond_code:
            cur.execute("""
                UPDATE question_bank_items 
                SET topic_id = 'syntax-fundamentals', subtopic_id = 'syntax-fundamentals', primary_concept = ?
                WHERE id = ?
            """, (f"{lang}-syntax-fundamentals", qid))
            reclassified += 1

conn.commit()
print(f"Reclassified {reclassified} fake *-AUTH-* questions to syntax-fundamentals!")

# Check remaining *-AUTH-* in loops
cur.execute("SELECT COUNT(*) FROM question_bank_items WHERE id LIKE '%-AUTH-%' AND topic_id = 'loops'")
remaining_loops = cur.fetchone()[0]
print(f"Remaining *-AUTH-* in loops: {remaining_loops}")

cur.execute("SELECT COUNT(*) FROM question_bank_items WHERE id LIKE '%-AUTH-%' AND topic_id = 'conditions'")
remaining_cond = cur.fetchone()[0]
print(f"Remaining *-AUTH-* in conditions: {remaining_cond}")

conn.close()
