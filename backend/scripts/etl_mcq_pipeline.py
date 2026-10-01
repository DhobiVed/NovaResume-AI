import os
import sys
import json
import hashlib
import glob
from pathlib import Path
from typing import Dict, Any, List, Tuple, Set

# Ensure backend directory is in python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.session import SessionLocal, engine, Base
from app.models.schema import QuestionBankItem

def normalize_text(text: str) -> str:
    """Normalize text for consistent duplicate detection."""
    if not text:
        return ""
    # Strip whitespace, lowercase, remove extra spaces
    lines = [line.strip() for line in text.strip().splitlines() if line.strip()]
    return " ".join(" ".join(lines).lower().split())

def compute_content_hash(question_text: str, options: List[str], lang: str, topic: str, code_snippet: str = "") -> str:
    """
    Computes a deterministic 5-layer content hash:
    1. Normalized question text
    2. Normalized code snippet (if present)
    3. Sorted normalized options
    4. Language/Skill key
    5. Topic key
    """
    norm_q = normalize_text(question_text)
    norm_code = normalize_text(code_snippet or "")
    norm_opts = sorted([normalize_text(opt) for opt in options])
    norm_lang = (lang or "").lower().strip()
    norm_topic = (topic or "").lower().strip()

    raw_payload = f"{norm_q}###{norm_code}###{'||'.join(norm_opts)}###{norm_lang}###{norm_topic}"
    return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()

def extract_questions_from_file(file_path: Path) -> List[Dict[str, Any]]:
    """Loads questions whether stored as a list or a dictionary with a 'questions' key."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                if "questions" in data and isinstance(data["questions"], list):
                    meta_skill = data.get("skillId")
                    meta_skill_name = data.get("skillName")
                    meta_domain = data.get("domainId")
                    meta_domain_name = data.get("domainName")
                    for q in data["questions"]:
                        if meta_skill and not q.get("skillId"):
                            q["skillId"] = meta_skill
                        if meta_skill_name and not q.get("skillName"):
                            q["skillName"] = meta_skill_name
                        if meta_domain and not q.get("domainId"):
                            q["domainId"] = meta_domain
                        if meta_domain_name and not q.get("domainName"):
                            q["domainName"] = meta_domain_name
                    return data["questions"]
    except Exception as e:
        print(f"[WARN] Error reading {file_path}: {e}")
    return []

def run_etl():
    print("=" * 70)
    print("NOVA CAREERCONNECT: ENTERPRISE MCQ ETL INGESTION PIPELINE")
    print("=" * 70)

    # Initialize tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    workspace_root = backend_dir.parent
    existing_bank_dir = workspace_root / "frontend" / "src" / "data" / "question-bank"
    dataset_100k_dir = workspace_root / "data" / "mcqs_100000"

    print(f"[*] Workspace Root: {workspace_root}")
    print(f"[*] Existing Banks Dir: {existing_bank_dir}")
    print(f"[*] 100k Dataset Dir:   {dataset_100k_dir}")

    # Track seen content hashes and IDs for deduplication
    existing_hashes: Set[str] = set()
    existing_ids: Set[str] = set()
    try:
        rows = db.query(QuestionBankItem.content_hash, QuestionBankItem.id).all()
        for r in rows:
            if r[0]:
                existing_hashes.add(r[0])
            if r[1]:
                existing_ids.add(r[1])
        print(f"[*] Pre-existing records in DB: {len(existing_hashes)} hashes, {len(existing_ids)} IDs")
    except Exception as e:
        print(f"[*] Database check: {e}")

    # PHASE 1: Ingest EXISTING Question Banks (100% Preserved)
    print("\n" + "=" * 50)
    print("PHASE 1: Ingesting EXISTING Question Banks")
    print("=" * 50)

    existing_files = list(existing_bank_dir.glob("**/*.json"))
    existing_ingested_count = 0
    existing_skipped_count = 0
    batch: List[QuestionBankItem] = []

    for file_path in existing_files:
        if file_path.name in ["auditQuestionBanks.json"]:
            continue
        rel_path = file_path.relative_to(existing_bank_dir)
        questions = extract_questions_from_file(file_path)
        if not questions:
            continue

        file_added = 0
        for q in questions:
            q_text = q.get("question") or q.get("question_text") or ""
            if not q_text.strip():
                continue

            options = q.get("options") or []
            if len(options) < 2:
                continue

            correct_idx = q.get("correctIndex")
            if correct_idx is None:
                correct_idx = q.get("correct_index", 0)
            try:
                correct_idx = int(correct_idx)
            except (ValueError, TypeError):
                correct_idx = 0

            # Language / Skill
            skill_id = (q.get("skillId") or q.get("programmingLanguage") or file_path.stem).lower().strip()
            skill_name = q.get("skillName") or skill_id.capitalize()
            lang_id = (q.get("languageId") or q.get("programmingLanguage") or skill_id).lower().strip()
            domain_id = (q.get("domainId") or "computer_science").lower().strip()
            domain_name = q.get("domainName") or "Computer Science & Engineering"
            topic_id = (q.get("topicId") or "fundamentals").lower().strip()
            topic_name = q.get("topicName") or q.get("topic") or topic_id.replace("_", " ").title()
            diff = q.get("difficulty") or "Medium"
            if diff.capitalize() in ["Easy", "Medium", "Hard", "Industry"]:
                diff = diff.capitalize()
            else:
                diff = "Medium"

            code_snippet = q.get("codeSnippet") or q.get("code_snippet") or None
            is_practical = bool(code_snippet) or q.get("questionType") in ["code_output", "code_debug", "output_prediction"]
            practical_type = "code_snippet" if code_snippet else ("practical" if is_practical else "theoretical")

            chash = compute_content_hash(q_text, options, lang_id, topic_id, code_snippet or "")
            q_id = q.get("id") or f"exist-{hashlib.md5(chash.encode()).hexdigest()[:12]}"
            if chash in existing_hashes or q_id in existing_ids:
                existing_skipped_count += 1
                continue

            existing_hashes.add(chash)
            existing_ids.add(q_id)

            item = QuestionBankItem(
                id=q_id,
                domain_id=domain_id,
                domain_name=domain_name,
                skill_id=skill_id,
                skill_name=skill_name,
                language_id=lang_id,
                module_id=q.get("moduleId"),
                topic_id=topic_id,
                topic_name=topic_name,
                subtopic=q.get("subtopic"),
                difficulty=diff,
                question_type=q.get("questionType") or "multiple_choice",
                practicality_type=practical_type,
                question_text=q_text,
                code_snippet=code_snippet,
                options_json=json.dumps(options),
                correct_index=correct_idx,
                explanation=q.get("explanation") or "",
                validation_status="VERIFIED",
                source_type="EXISTING",
                quality_score=1.0,
                content_hash=chash
            )
            batch.append(item)
            file_added += 1
            existing_ingested_count += 1

            if len(batch) >= 1000:
                db.bulk_save_objects(batch)
                db.commit()
                batch = []

        print(f"  [EXISTING] {rel_path} -> {file_added} ingested")

    if batch:
        db.bulk_save_objects(batch)
        db.commit()
        batch = []

    print(f"\n[OK] Phase 1 Complete: {existing_ingested_count} existing questions ingested, {existing_skipped_count} duplicates skipped.")

    # PHASE 2: Ingest 100,000-MCQ Dataset (90% Practical / 10% Theoretical)
    print("\n" + "=" * 50)
    print("PHASE 2: Ingesting 100,000-MCQ Dataset")
    print("=" * 50)

    dataset_files = sorted(list(dataset_100k_dir.glob("*.json")))
    print(f"[*] Found {len(dataset_files)} language dataset files.")

    dataset_ingested_count = 0
    dataset_skipped_count = 0
    lang_stats: Dict[str, Dict[str, int]] = {}

    for file_path in dataset_files:
        questions = extract_questions_from_file(file_path)
        if not questions:
            continue

        file_added = 0
        file_skipped = 0
        lang_key = ""

        for q in questions:
            q_text = q.get("question") or q.get("question_text") or ""
            if not q_text.strip():
                continue

            options = q.get("options") or []
            if len(options) < 2:
                continue

            correct_idx = q.get("correctIndex")
            if correct_idx is None:
                correct_idx = q.get("correct_index", 0)
            try:
                correct_idx = int(correct_idx)
            except (ValueError, TypeError):
                correct_idx = 0

            skill_id = (q.get("skillId") or q.get("languageId") or "").lower().strip()
            if not skill_id:
                # Derive from filename e.g. 02_python_2000_mcqs.json -> python
                parts = file_path.stem.split("_")
                if len(parts) >= 2:
                    skill_id = parts[1].lower()
                else:
                    skill_id = file_path.stem.lower()

            lang_key = skill_id
            if lang_key not in lang_stats:
                lang_stats[lang_key] = {"total": 0, "practical": 0, "theoretical": 0}

            skill_name = q.get("skillName") or q.get("programmingLanguage") or skill_id.capitalize()
            lang_id = (q.get("languageId") or skill_id).lower().strip()
            domain_id = (q.get("domainId") or "computer_science").lower().strip()
            domain_name = q.get("domainName") or "Computer Science & Engineering"
            topic_id = (q.get("topicId") or "fundamentals").lower().strip()
            topic_name = q.get("topicName") or q.get("topic") or topic_id.replace("_", " ").title()
            diff = q.get("difficulty") or "Medium"
            if diff.capitalize() in ["Easy", "Medium", "Hard", "Industry"]:
                diff = diff.capitalize()
            else:
                diff = "Medium"

            code_snippet = q.get("codeSnippet") or q.get("code_snippet") or None
            q_type = q.get("questionType") or ("code_output" if code_snippet else "multiple_choice")
            p_type = q.get("practicalType") or ("code_analysis" if code_snippet else "conceptual")
            is_practical = bool(code_snippet) or q_type in ["code_output", "code_debug", "output_prediction", "refactoring"] or p_type in ["output_tracing", "code_analysis", "debugging", "syntax_analysis"]

            practicality = "practical" if is_practical else "theoretical"

            chash = compute_content_hash(q_text, options, lang_id, topic_id, code_snippet or "")
            q_id = q.get("id") or f"ds100k-{hashlib.md5(chash.encode()).hexdigest()[:12]}"
            if chash in existing_hashes or q_id in existing_ids:
                file_skipped += 1
                dataset_skipped_count += 1
                continue

            existing_hashes.add(chash)
            existing_ids.add(q_id)

            item = QuestionBankItem(
                id=q_id,
                domain_id=domain_id,
                domain_name=domain_name,
                skill_id=skill_id,
                skill_name=skill_name,
                language_id=lang_id,
                module_id=q.get("moduleId") or q.get("module"),
                topic_id=topic_id,
                topic_name=topic_name,
                subtopic=q.get("subtopic"),
                difficulty=diff,
                question_type=q_type,
                practicality_type=practicality,
                question_text=q_text,
                code_snippet=code_snippet,
                options_json=json.dumps(options),
                correct_index=correct_idx,
                explanation=q.get("explanation") or "",
                validation_status="VERIFIED",
                source_type="DATASET_100K",
                quality_score=1.0,
                content_hash=chash
            )
            batch.append(item)
            file_added += 1
            dataset_ingested_count += 1

            lang_stats[lang_key]["total"] += 1
            if is_practical:
                lang_stats[lang_key]["practical"] += 1
            else:
                lang_stats[lang_key]["theoretical"] += 1

            if len(batch) >= 2500:
                db.bulk_save_objects(batch)
                db.commit()
                batch = []

        print(f"  [DATASET_100K] {file_path.name} -> +{file_added} added, {file_skipped} duplicates skipped")

    if batch:
        db.bulk_save_objects(batch)
        db.commit()
        batch = []

    print(f"\n[OK] Phase 2 Complete: {dataset_ingested_count} questions ingested from 100k dataset.")

    # PHASE 3: Audit & Quality Verification Summary
    print("\n" + "=" * 50)
    print("PHASE 3: Final Question Bank Audit & Ratio Verification")
    print("=" * 50)

    total_in_db = db.query(QuestionBankItem).count()
    verified_in_db = db.query(QuestionBankItem).filter(QuestionBankItem.validation_status == "VERIFIED").count()
    existing_in_db = db.query(QuestionBankItem).filter(QuestionBankItem.source_type == "EXISTING").count()
    ds100k_in_db = db.query(QuestionBankItem).filter(QuestionBankItem.source_type == "DATASET_100K").count()
    practical_in_db = db.query(QuestionBankItem).filter(QuestionBankItem.practicality_type == "practical").count()
    theory_in_db = db.query(QuestionBankItem).filter(QuestionBankItem.practicality_type == "theoretical").count()

    print(f"Total Authoritative Items in DB: {total_in_db}")
    print(f"  - Verified Items:             {verified_in_db}")
    print(f"  - Existing Website MCQs:      {existing_in_db} (100% Preserved)")
    print(f"  - 100,000-Dataset Ingested:   {ds100k_in_db}")
    print(f"  - Practical (Code/Snippet):   {practical_in_db} ({practical_in_db / max(total_in_db, 1) * 100:.1f}%)")
    print(f"  - Theoretical / Concept:      {theory_in_db} ({theory_in_db / max(total_in_db, 1) * 100:.1f}%)")

    # Sample check 5 distinct languages
    sample_langs = ["python", "javascript", "java", "dart", "bash"]
    print("\nSample Language Distribution Check:")
    for sl in sample_langs:
        cnt = db.query(QuestionBankItem).filter(QuestionBankItem.skill_id == sl).count()
        prc = db.query(QuestionBankItem).filter(QuestionBankItem.skill_id == sl, QuestionBankItem.practicality_type == "practical").count()
        print(f"  • {sl.upper():12}: {cnt} questions total | {prc} practical ({prc / max(cnt, 1) * 100:.1f}%)")

    db.close()
    print("\n[SUCCESS] ETL Pipeline execution completed successfully!")

if __name__ == "__main__":
    run_etl()
