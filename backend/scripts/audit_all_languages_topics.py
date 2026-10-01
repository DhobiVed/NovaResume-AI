import os
import sys
import sqlite3
import json
import re

# Add backend directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.question_classifier import QuestionClassifier, CANONICAL_TOPIC_MAP

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "novaresume.db")
LANGUAGES_TS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend", "src", "data", "programmingLanguagesData.ts"
)

def audit_all_languages():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Read programming languages data from frontend
    with open(LANGUAGES_TS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract ALL_PROGRAMMING_LANGUAGES structure
    # Parse json objects inside ALL_PROGRAMMING_LANGUAGES
    # Remove export and types
    match = re.search(r"export const ALL_PROGRAMMING_LANGUAGES: ProgrammingLanguageItem\[\] = (\[[\s\S]*\]);", content)
    if not match:
        print("Could not find ALL_PROGRAMMING_LANGUAGES in file")
        return

    raw_json = match.group(1)
    # Strip comments if any
    clean_json = re.sub(r"//.*", "", raw_json)
    try:
        languages_data = json.loads(clean_json)
    except Exception as e:
        print("Failed to parse JSON directly:", e)
        # Regex extraction
        languages_data = []

    print(f"Total languages parsed from frontend: {len(languages_data)}")

    # 2. Check each language in Database
    mismatches = []
    perfect_matches = []
    shortage_topics = []

    for lang in languages_data:
        lang_id = lang["id"].lower()
        lang_name = lang["name"]

        # Check total questions for this language in DB
        cur.execute("""
            SELECT count(*) FROM question_bank_items 
            WHERE lower(language_id) = ? OR lower(skill_id) = ?
        """, (lang_id, lang_id))
        total_q = cur.fetchone()[0]

        for mod in lang.get("modules", []):
            mod_id = mod["id"]
            for top in mod.get("topics", []):
                top_id = top["id"]
                top_name = top["title"]

                # Resolve canonical topic if mapped
                canonical = CANONICAL_TOPIC_MAP.get(lang_id, {}).get(top_id, top_id)

                # Query verified questions in DB matching this topic
                cur.execute("""
                    SELECT count(*), 
                           GROUP_CONCAT(DISTINCT primary_concept)
                    FROM question_bank_items
                    WHERE (lower(language_id) = ? OR lower(skill_id) = ?)
                      AND (lower(topic_id) = ? OR lower(subtopic_id) = ? OR lower(topic_id) = ?)
                      AND validation_status = 'VERIFIED'
                """, (lang_id, lang_id, top_id.lower(), top_id.lower(), canonical.lower()))
                row = cur.fetchone()
                count = row[0] if row else 0
                concepts = row[1] if row and row[1] else ""

                if count == 0:
                    shortage_topics.append({
                        "language": lang_name,
                        "lang_id": lang_id,
                        "topic": top_name,
                        "topic_id": top_id,
                        "total_lang_q": total_q
                    })
                else:
                    perfect_matches.append({
                        "language": lang_name,
                        "lang_id": lang_id,
                        "topic": top_name,
                        "topic_id": top_id,
                        "count": count,
                        "concepts": concepts
                    })

    print(f"\n--- AUDIT SUMMARY ACROSS ALL 50 LANGUAGES ---")
    print(f"Topics with verified questions directly matching: {len(perfect_matches)}")
    print(f"Topics with 0 exact-topic verified questions:       {len(shortage_topics)}")
    
    # Check what topic_ids actually exist in DB for languages
    print("\n--- TOP TOPIC IDS IN DB ACROSS ALL LANGUAGES ---")
    cur.execute("""
        SELECT topic_id, count(*) 
        FROM question_bank_items 
        GROUP BY topic_id 
        ORDER BY count(*) DESC 
        LIMIT 25
    """)
    for r in cur.fetchall():
        print(f"  {r[0]}: {r[1]}")

    conn.close()

if __name__ == "__main__":
    audit_all_languages()
