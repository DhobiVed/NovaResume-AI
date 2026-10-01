"""
audit_all_50_languages_syllabus.py
Exhaustively checks all 50 programming languages and all their syllabus topics
against both backend/novaresume.db and frontend/src/data/question-bank/.
"""

import sqlite3
import json
import re
import os

PROG_LANGS_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'data', 'programmingLanguagesData.ts')
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'novaresume.db')

def main():
    with open(PROG_LANGS_PATH, 'r', encoding='utf-8') as f:
        text = f.read()

    # Find all language IDs and their modules
    # In programmingLanguagesData.ts, languages are objects in ALL_PROGRAMMING_LANGUAGES array
    pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*name:\s*[\'"]([^\'"]+)[\'"].*?modules:\s*\[(.*?)\]\s*\}'
    lang_matches = list(re.finditer(pattern, text, re.DOTALL))
    print(f"Total languages parsed from syllabus: {len(lang_matches)}")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    total_topics = 0
    covered_topics = 0
    zero_question_topics = []
    topic_report = {}

    for m in lang_matches:
        lid = m.group(1).lower()
        lname = m.group(2)
        mod_block = m.group(3)

        topic_matches = re.findall(r'id:\s*[\'"]([^\'"]+)[\'"],\s*title:\s*[\'"]([^\'"]+)[\'"]', mod_block)
        topic_report[lid] = {
            'name': lname,
            'total': len(topic_matches),
            'topics': []
        }

        aliases = [lid]
        if lid == 'golang': aliases.append('go')
        elif lid == 'cpp': aliases.append('c++')
        elif lid == 'csharp': aliases.append('c#')
        elif lid == 'visual-basic': aliases.extend(['visual basic', 'vb'])
        elif lid == 'fsharp': aliases.extend(['f#'])
        elif lid == 'plsql': aliases.extend(['pl/sql'])
        elif lid == 'tsql': aliases.extend(['t-sql'])

        placeholders = ', '.join(['?'] * len(aliases))

        for tid, ttitle in topic_matches:
            total_topics += 1
            tid_clean = tid.lower().strip()
            slug1 = tid_clean
            slug2 = tid_clean.replace('-', '_')
            slug3 = tid_clean.replace('_', '-')
            
            # Query count
            q = f"""
                SELECT count(1),
                       sum(case when practicality_type='practical' or (code_snippet is not null and length(trim(code_snippet))>0) then 1 else 0 end)
                FROM question_bank_items
                WHERE (lower(language_id) IN ({placeholders}) OR lower(skill_id) IN ({placeholders}))
                  AND (lower(topic_id) IN (?, ?, ?) OR lower(topic_name) = ? OR lower(primary_concept) LIKE ?)
            """
            params = aliases + aliases + [slug1, slug2, slug3, ttitle.lower(), f"%{slug1}%"]
            res = c.execute(q, params).fetchone()
            count = res[0]
            practical = res[1] or 0

            topic_report[lid]['topics'].append({
                'topicId': tid,
                'title': ttitle,
                'count': count,
                'practical': practical
            })

            if count > 0:
                covered_topics += 1
            else:
                zero_question_topics.append((lid, lname, tid, ttitle))

    print(f"\nAudit Summary:")
    print(f"Total Languages: {len(lang_matches)}")
    print(f"Total Syllabus Topics: {total_topics}")
    print(f"Topics with Available Verified Questions: {covered_topics}/{total_topics} ({covered_topics/total_topics*100:.1f}%)")
    print(f"Topics with 0 Questions: {len(zero_question_topics)}")

    if zero_question_topics:
        print("\n--- Topics with Zero Questions Found ---")
        for lid, lname, tid, ttitle in zero_question_topics:
            print(f"  {lname:<18} ({lid:<12}): topicId='{tid}' ('{ttitle}')")

    conn.close()

if __name__ == '__main__':
    main()
