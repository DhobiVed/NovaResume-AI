"""
Direct SQL repair: reinstate QUARANTINED loop/recursion/conditions questions
that were correctly classified by the v3.0 classifier but got stuck as QUARANTINED
from the old v2.0 run.

Also fixes: broad topic IDs that weren't split (remaining 'control_flow' left-overs).
"""
import sqlite3
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.question_classifier import QuestionClassifier

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "novaresume.db")

def run_targeted_repair():
    print(f"{'='*60}")
    print("TARGETED REPAIR: Reinstate + Fix Misclassified Questions")
    print(f"{'='*60}")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # ── 1. Fix QUARANTINED questions that ARE valid loops ─────────────
    print("\n[1] Reinstating correctly-classified QUARANTINED loop questions...")
    cur.execute("""
        SELECT id, language_id, topic_id, question_text, code_snippet, options_json, primary_concept
        FROM question_bank_items
        WHERE validation_status = 'QUARANTINED'
          AND (topic_id = 'loops' OR primary_concept LIKE '%-for-loop' OR primary_concept LIKE '%-while-loop'
               OR primary_concept LIKE '%-iterator-loop' OR primary_concept LIKE '%-do-while-loop'
               OR primary_concept LIKE '%-functional-iteration')
    """)
    quarantined_loops = cur.fetchall()
    print(f"  Found {len(quarantined_loops)} quarantined loop questions")

    reinstated = 0
    for r in quarantined_loops:
        qid, lang, topic, text, code, opts_json, primary = r
        constructs = QuestionClassifier.detect_constructs(text or "", code or "", lang or "")
        if constructs["is_loop"]:
            cur.execute("""
                UPDATE question_bank_items
                SET validation_status = 'VERIFIED', topic_id = 'loops', subtopic_id = 'loops'
                WHERE id = ?
            """, (qid,))
            reinstated += 1

    conn.commit()
    print(f"  Reinstated: {reinstated} loop questions")

    # ── 2. Fix remaining 'control_flow' broad topics (not yet split) ──
    print("\n[2] Splitting remaining 'control_flow' questions not yet split...")
    cur.execute("""
        SELECT id, language_id, question_text, code_snippet, options_json
        FROM question_bank_items
        WHERE topic_id = 'control_flow' AND validation_status = 'VERIFIED'
    """)
    remaining_cf = cur.fetchall()
    print(f"  Found {len(remaining_cf)} remaining 'control_flow' questions")

    split_counts = {"loops": 0, "conditions": 0, "recursion": 0, "other": 0}
    for r in remaining_cf:
        qid, lang, text, code, opts_json = r
        primary, secondaries, canonical_topic, confidence = QuestionClassifier.determine_primary_concept(
            lang or "general", "control_flow", text or "", code or ""
        )
        new_topic = canonical_topic if canonical_topic in ["loops", "conditions", "recursion"] else "control_flow"
        if new_topic != "control_flow":
            cur.execute("""
                UPDATE question_bank_items
                SET topic_id = ?, subtopic_id = ?, subject_id = 'control_flow',
                    primary_concept = ?, validation_status = 'VERIFIED'
                WHERE id = ?
            """, (new_topic, new_topic, primary, qid))
            split_counts[new_topic] = split_counts.get(new_topic, 0) + 1
        else:
            split_counts["other"] += 1

    conn.commit()
    print(f"  Split: {split_counts}")

    # ── 3. Final verification across all languages ────────────────────
    print("\n[3] Verification — Key languages after repair:")
    key_langs = [
        'java', 'python', 'javascript', 'typescript', 'golang', 'ruby', 'rust',
        'kotlin', 'swift', 'cpp', 'csharp', 'php', 'c', 'dart', 'bash',
        'scala', 'r', 'haskell', 'lua', 'perl', 'go'
    ]
    print(f"\n  {'Language':<14} {'Conditions':>10} {'Loops':>8} {'Recursion':>10} {'Total':>8}")
    print(f"  {'-'*14} {'-'*10} {'-'*8} {'-'*10} {'-'*8}")
    for lang in key_langs:
        cur.execute("""
            SELECT
              SUM(CASE WHEN topic_id = 'conditions' OR topic_id = 'conditionals' THEN 1 ELSE 0 END),
              SUM(CASE WHEN topic_id = 'loops' THEN 1 ELSE 0 END),
              SUM(CASE WHEN topic_id = 'recursion' THEN 1 ELSE 0 END),
              COUNT(*)
            FROM question_bank_items
            WHERE language_id = ? AND validation_status = 'VERIFIED'
        """, (lang,))
        row = cur.fetchone()
        cond, loops, recur, total = (row[0] or 0), (row[1] or 0), (row[2] or 0), (row[3] or 0)
        ok = "OK" if loops > 0 else "!! NO LOOPS"
        print(f"  {lang:<14} {cond:>10} {loops:>8} {recur:>10} {total:>8}  {ok}")

    conn.close()
    print(f"\n{'='*60}")
    print("Targeted repair complete.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    run_targeted_repair()
