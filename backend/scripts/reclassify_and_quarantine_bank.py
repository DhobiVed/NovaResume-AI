"""
Full-spectrum reclassification + quarantine script.
Processes ALL 106,771 questions:
  - Splits 'control_flow' → conditions / loops / recursion
  - Splits 'syntax_basics' → syntax-fundamentals / variables-datatypes / operators
  - Splits 'functions_scope' → functions / recursion / closures
  - Splits 'data_structures' → arrays / data-structures / strings / collections
  - Splits 'oop_abstractions' → classes-objects / inheritance / polymorphism / interfaces
  - Splits 'error_handling' → exceptions
  - Splits 'memory_management' → memory-management / pointers-memory
  - Splits 'concurrency_async' → concurrency / threads-concurrency / async-await
  - Splits 'io_filesystem' → file-io
  - Splits 'advanced_features' → generics / lambda / templates
  - JS-specific: 'syntax_dom', 'objects_arrays', 'functions_async', etc.
  - Computes duplicate group IDs for ALL questions
  - Quarantines confirmed misclassified questions
"""
import sqlite3
import json
import time
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.question_classifier import QuestionClassifier, BROAD_TOPIC_SPLIT_MAP

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "novaresume.db")

# All broad source topic IDs from the JSON dataset files
BROAD_TOPIC_IDS = set(BROAD_TOPIC_SPLIT_MAP.keys())


def run_full_reclassification():
    print(f"\n{'='*70}")
    print("FULL-SPECTRUM RECLASSIFICATION & QUARANTINE")
    print(f"{'='*70}")
    print(f"Database: {DB_PATH}")
    start_time = time.time()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    print("\nFetching all questions...")
    cur.execute("""
        SELECT id, language_id, topic_id, question_text, code_snippet, options_json, validation_status
        FROM question_bank_items
    """)
    rows = cur.fetchall()
    total_count = len(rows)
    print(f"Loaded {total_count} questions. Processing...")

    updates = []
    quarantined_count = 0
    duplicate_groups: set = set()

    # Stats tracking per broad topic
    broad_split_stats = {t: {} for t in BROAD_TOPIC_IDS}
    unchanged_broad = 0  # broad topics that classifier couldn't split
    fine_grained_count = 0  # already fine-grained
    reclassified_conditions = 0  # legacy condition tags fixed

    for idx, r in enumerate(rows):
        qid, lang, topic_id, q_text, code_snippet, opts_json, current_val_status = r
        lang = (lang or "general").lower()
        topic = topic_id or ""
        text = q_text or ""
        code = code_snippet or ""

        try:
            options = json.loads(opts_json) if opts_json else []
        except Exception:
            options = []

        # 1. Compute Duplicate Group ID
        dg_id = QuestionClassifier.compute_duplicate_group_id(text, options, code, lang)
        duplicate_groups.add(dg_id)

        # 2. Determine authoritative Primary Concept & Canonical Topic
        primary, secondaries, canonical_topic, confidence = QuestionClassifier.determine_primary_concept(
            lang, topic, text, code
        )

        new_topic_id = topic
        new_subtopic_id = None
        new_subject_id = None
        # Default: VERIFIED. We only quarantine on explicit validation failure.
        # IMPORTANT: Do NOT carry over old QUARANTINED status for questions that came from
        # broad topic IDs — they are being freshly reclassified and should be reinstated.
        val_status = "VERIFIED"

        # 3. Classify based on original topic_id
        if topic in BROAD_TOPIC_IDS:
            # Use the new classify_broad_topic helper
            fine_topic = QuestionClassifier.classify_broad_topic(topic, primary, canonical_topic)
            new_subject_id = topic  # preserve original broad topic as subject
            new_topic_id = fine_topic
            new_subtopic_id = fine_topic
            val_status = "VERIFIED"  # always reinstate when reclassifying from broad topic

            # Track stats
            if fine_topic not in broad_split_stats[topic]:
                broad_split_stats[topic][fine_topic] = 0
            broad_split_stats[topic][fine_topic] += 1

        elif topic in ["loops", "conditions", "recursion", "functions", "methods", "arrays",
                       "strings", "exceptions", "classes-objects", "inheritance", "concurrency",
                       "file-io", "memory-management", "algorithms", "data-structures",
                       "if-else", "if_else", "conditionals", "conditional-statements"]:
            # Fine-grained topic from previous run — validate and keep or fix
            fine_grained_count += 1
            if topic in ["conditions", "if-else", "if_else", "conditionals", "conditional-statements"]:
                is_valid, reason = QuestionClassifier.validate_negative_topic(
                    "conditions", primary, text, code
                )
                if not is_valid:
                    if canonical_topic and canonical_topic not in ["conditions", "general", "fundamentals"]:
                        new_topic_id = canonical_topic
                        new_subtopic_id = canonical_topic
                        reclassified_conditions += 1
                    else:
                        val_status = "QUARANTINED"
                        quarantined_count += 1
            else:
                # loops/recursion/functions etc — always VERIFIED (was correctly classified)
                val_status = "VERIFIED"

        else:
            # Unknown/non-programming topic — keep as-is
            val_status = current_val_status or "VERIFIED"
            fine_grained_count += 1

        updates.append((
            primary,
            json.dumps(secondaries),
            confidence,
            dg_id,
            "v3.0-full-spectrum",
            new_topic_id,
            new_subtopic_id,
            new_subject_id,
            val_status,
            qid
        ))

        if (idx + 1) % 10000 == 0:
            elapsed = time.time() - start_time
            print(f"  Processed {idx+1:,}/{total_count:,} | {elapsed:.1f}s elapsed")

    print(f"\nApplying {len(updates):,} updates in batches of 5,000...")
    batch_size = 5000
    for i in range(0, len(updates), batch_size):
        batch = updates[i:i+batch_size]
        cur.executemany("""
            UPDATE question_bank_items
            SET primary_concept = ?,
                secondary_concepts_json = ?,
                semantic_match_score = ?,
                duplicate_group_id = ?,
                validation_version = ?,
                topic_id = ?,
                subtopic_id = COALESCE(?, subtopic_id),
                subject_id = COALESCE(?, subject_id),
                validation_status = ?
            WHERE id = ?
        """, batch)
        conn.commit()
        print(f"  Batch committed: {min(i+batch_size, len(updates)):,}/{len(updates):,}")

    elapsed = time.time() - start_time
    print(f"\n{'='*70}")
    print("RECLASSIFICATION COMPLETE")
    print(f"{'='*70}")
    print(f"Total Questions Processed: {total_count:,}")
    print(f"Unique Duplicate Groups:   {len(duplicate_groups):,}")
    print(f"Quarantined:               {quarantined_count:,}")
    print(f"Conditions Reclassified:   {reclassified_conditions:,}")
    print(f"Already Fine-Grained:      {fine_grained_count:,}")
    print(f"Time Taken:                {elapsed:.2f}s")
    print(f"{'='*70}")

    print("\nBROAD TOPIC SPLIT SUMMARY:")
    for broad_topic, split in broad_split_stats.items():
        if split:
            total = sum(split.values())
            print(f"\n  [{broad_topic}] — {total:,} questions split:")
            for fine, count in sorted(split.items(), key=lambda x: -x[1]):
                pct = count / total * 100
                print(f"    -> {fine:<30} {count:>5,}  ({pct:.1f}%)")

    print("\n\nVERIFICATION — KEY LANGUAGE TOPICS:")
    verify_langs = [
        ('java', 'conditions'), ('java', 'loops'), ('java', 'recursion'),
        ('python', 'loops'), ('python', 'conditions'), ('python', 'recursion'),
        ('golang', 'loops'), ('golang', 'conditions'), ('golang', 'recursion'),
        ('ruby', 'loops'), ('ruby', 'conditions'), ('ruby', 'recursion'),
        ('rust', 'loops'), ('rust', 'conditions'),
        ('kotlin', 'loops'), ('kotlin', 'conditions'),
        ('swift', 'loops'), ('swift', 'conditions'),
        ('cpp', 'loops'), ('cpp', 'conditions'),
        ('csharp', 'loops'), ('csharp', 'conditions'),
        ('javascript', 'loops'), ('javascript', 'conditions'),
        ('typescript', 'loops'), ('typescript', 'conditions'),
        ('php', 'loops'), ('php', 'conditions'),
        ('c', 'loops'), ('c', 'conditions'),
    ]
    print(f"\n  {'Language':<14} {'Topic':<20} {'VERIFIED Count':>14}")
    print(f"  {'-'*14} {'-'*20} {'-'*14}")
    for lang, topic in verify_langs:
        cur.execute("""
            SELECT count(*) FROM question_bank_items
            WHERE language_id=? AND topic_id=? AND validation_status='VERIFIED'
        """, (lang, topic))
        cnt = cur.fetchone()[0]
        status = "✓" if cnt >= 10 else ("⚠" if cnt > 0 else "✗")
        print(f"  {lang:<14} {topic:<20} {cnt:>10,} {status}")

    conn.close()
    print(f"\n{'='*70}")
    print("Done. Database updated.")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    run_full_reclassification()
