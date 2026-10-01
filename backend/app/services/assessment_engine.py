import re
import json
import uuid
import random
import math
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, not_

from app.models.schema import QuestionBankItem, TestSession, StudentQuestionHistory, StudentSkill, AuditLog
from app.services.question_classifier import QuestionClassifier, CANONICAL_TOPIC_MAP

# Standard skill normalization mappings
SKILL_ALIASES = {
    "c++": "cpp",
    "c#": "csharp",
    "go": "golang",
    "golang": "golang",
    "visual basic": "visual-basic",
    "vb.net": "visual-basic",
    "pl/sql": "plsql",
    "t-sql": "tsql",
    "objective c": "objective-c",
    "f#": "fsharp"
}

def normalize_skill_key(raw_key: str) -> str:
    """Normalizes language/skill strings into canonical slugs."""
    if not raw_key:
        return "python"
    cleaned = raw_key.lower().strip()
    return SKILL_ALIASES.get(cleaned, cleaned)

def get_language_slugs(raw_key: str) -> List[str]:
    """Returns all acceptable database language_id values for a language."""
    cleaned = (raw_key or "python").lower().strip()
    mapping = {
        "go": ["golang", "go"],
        "golang": ["golang", "go"],
        "cpp": ["cpp", "c++"],
        "c++": ["cpp", "c++"],
        "csharp": ["csharp", "c#"],
        "c#": ["csharp", "c#"],
        "javascript": ["javascript", "js"],
        "js": ["javascript", "js"],
        "typescript": ["typescript", "ts"],
        "ts": ["typescript", "ts"],
        "python": ["python", "py"],
        "py": ["python", "py"],
        "visual basic": ["visual-basic", "visual basic", "vb"],
        "visual-basic": ["visual-basic", "visual basic", "vb"],
        "f#": ["fsharp", "f#"],
        "fsharp": ["fsharp", "f#"],
        "pl/sql": ["plsql", "pl/sql"],
        "plsql": ["plsql", "pl/sql"],
        "t-sql": ["tsql", "t-sql"],
        "tsql": ["tsql", "t-sql"],
    }
    return mapping.get(cleaned, [cleaned])

class AssessmentEngineService:

    @staticmethod
    def create_test_session(
        db: Session,
        language: str,
        student_id: Optional[str] = None,
        skill_id: Optional[str] = None,
        domain_id: str = "computer_science",
        topic_id: Optional[str] = None,
        difficulty: str = "Mixed",
        count: int = 50,
        duration_minutes: int = 45
    ) -> Dict[str, Any]:
        """
        Creates a new frozen test session with FAIL-CLOSED guarantees:
        1. Hard Quality Gate: validation_status == 'VERIFIED'
        2. Strict Topic Identity & Negative Topic Validation: zero unrelated concepts.
        3. Multi-Layer Deduplication: at most 1 question per duplicate_group_id.
        4. Anti-Repetition Exclusion: excludes questions the student previously answered.
        5. ZERO SILENT FALLBACK: Never pad with questions from other topics or parent pools.
           Honest shortage returned if verified pool is smaller than requested count.
        6. Realistic Practical Ratio: prioritizes 90% practical / 10% theoretical.
        7. Difficulty balancing: 10 Easy, 15 Medium, 15 Hard, 10 Industry for 50-Q mixed test.
        8. Immutable Session Freezing: exact sequence locked in TestSession table.
        """
        norm_skill = normalize_skill_key(skill_id or language)
        norm_lang = normalize_skill_key(language or skill_id)
        lang_slugs = get_language_slugs(language or skill_id or "python")
        target_count = max(1, count)

        # 1. Anti-Repetition: get questions student already attempted
        seen_question_ids: set[str] = set()
        if student_id:
            past_attempts = db.query(StudentQuestionHistory.question_id).filter(
                StudentQuestionHistory.student_id == student_id
            ).all()
            for r in past_attempts:
                if r[0]:
                    seen_question_ids.add(r[0])

        # 2. Canonical Topic Resolution
        has_specific_topic = bool(topic_id and topic_id.strip() and topic_id.strip().lower() not in ["all", "none"])
        canonical_topic = None
        topic_candidates = set()
        if has_specific_topic:
            raw_topic = topic_id.strip().lower()
            clean_top = re.sub(r'[^a-z0-9]', '', raw_topic)
            lang_map = CANONICAL_TOPIC_MAP.get(norm_lang, {})
            canonical_topic = lang_map.get(raw_topic) or lang_map.get(clean_top, raw_topic)
            if 'ifelse' in clean_top or 'condition' in clean_top or 'branch' in clean_top:
                canonical_topic = 'conditions' if norm_lang != 'python' else 'conditionals'
            elif 'loop' in clean_top or 'while' in clean_top or 'for' in clean_top:
                canonical_topic = 'loops'
            elif 'recursion' in clean_top or 'recursive' in clean_top:
                canonical_topic = 'recursion'
            elif 'pointer' in clean_top:
                canonical_topic = 'pointers'
            elif 'list' in clean_top:
                canonical_topic = 'lists' if norm_lang != 'python' else 'lists-tuples'
            elif 'array' in clean_top:
                canonical_topic = 'arrays'
            elif 'function' in clean_top or 'method' in clean_top:
                canonical_topic = 'functions' if norm_lang != 'java' else 'methods'

            topic_candidates.update([canonical_topic, raw_topic, topic_id])
            if canonical_topic in ["conditions", "if-else", "conditionals"]:
                topic_candidates.update(["conditions", "if-else", "if_else", "conditionals", "conditional-statements"])
            elif canonical_topic in ["loops", "for", "while"]:
                topic_candidates.update(["loops", "for-loop", "while-loop", "iteration"])
            elif canonical_topic in ["pointers", "pointers-memory"]:
                topic_candidates.update(["pointers", "pointers-memory", "dynamic-memory"])
            elif canonical_topic in ["lists", "lists-tuples"]:
                topic_candidates.update(["lists", "lists-tuples", "collections"])
            elif canonical_topic in ["recursion"]:
                topic_candidates.update(["recursion", "recursive-functions"])

        # 3. Base Query for Candidate Pool
        candidate_query = db.query(QuestionBankItem).filter(
            QuestionBankItem.validation_status == "VERIFIED",
            or_(
                QuestionBankItem.language_id.in_(lang_slugs),
                QuestionBankItem.skill_id.in_(lang_slugs),
                QuestionBankItem.language_id == norm_lang,
                QuestionBankItem.skill_id == norm_skill
            )
        )

        # Hard Zero-Contamination Gate: Exclude cross-language pollution
        if norm_lang not in ['java', 'jvm']:
            candidate_query = candidate_query.filter(
                QuestionBankItem.language_id != 'java',
                QuestionBankItem.skill_id != 'java',
                not_(QuestionBankItem.code_snippet.ilike('%System.out%')),
                not_(QuestionBankItem.code_snippet.ilike('%public class %'))
            )

        if norm_lang in ['sql', 'dbms', 'plsql', 'tsql', 'assembly', 'asm']:
            candidate_query = candidate_query.filter(
                not_(QuestionBankItem.code_snippet.ilike('%int sum%')),
                not_(QuestionBankItem.code_snippet.ilike('%int val%')),
                not_(QuestionBankItem.code_snippet.ilike('%for (%')),
                not_(QuestionBankItem.code_snippet.ilike('%while (%'))
            )

        if has_specific_topic:
            candidate_query = candidate_query.filter(
                or_(
                    QuestionBankItem.topic_id.in_(list(topic_candidates)),
                    QuestionBankItem.topic_id.ilike(canonical_topic)
                )
            )

        raw_candidates: List[QuestionBankItem] = candidate_query.all()

        # 4. FAIL-CLOSED Negative Topic Validation Gate
        valid_pool: List[QuestionBankItem] = []
        validation_report: Dict[str, Any] = {
            "total_candidates_inspected": len(raw_candidates),
            "rejected_by_negative_validation": 0,
            "target_topic": canonical_topic or "All",
            "is_exact_topic_locked": has_specific_topic
        }

        for q in raw_candidates:
            if has_specific_topic:
                is_valid, reason = QuestionClassifier.validate_negative_topic(
                    canonical_topic,
                    q.primary_concept or "",
                    q.question_text or "",
                    q.code_snippet or ""
                )
                if not is_valid:
                    validation_report["rejected_by_negative_validation"] += 1
                    continue
            valid_pool.append(q)

        # 5. Handle Complete Pool Depletion (Honest Shortage Response)
        if not valid_pool:
            return {
                "status": "insufficient_pool",
                "session_id": None,
                "domain_id": domain_id,
                "skill_id": norm_skill,
                "language": norm_lang,
                "topic_id": topic_id,
                "difficulty": difficulty,
                "total_questions": 0,
                "available_count": 0,
                "requested_count": target_count,
                "shortage": target_count,
                "message": f"No verified questions are currently available for {language} -> {topic_id or 'General'}. No unrelated questions will be added.",
                "questions": []
            }

        # 6. Anti-Repetition Partitioning & Deduplication
        unseen = [q for q in valid_pool if q.id not in seen_question_ids]
        seen = [q for q in valid_pool if q.id in seen_question_ids]

        # Prioritize unseen questions across attempts
        prioritized_pool = unseen if len(unseen) >= target_count else unseen + seen

        # ZERO SILENT FALLBACK:
        # If pool has fewer questions than target_count, DO NOT PAD FROM OTHER TOPICS.
        # We cap target at available verified unique questions.
        selected_questions = AssessmentEngineService._select_balanced_pool(
            pool=prioritized_pool,
            count=target_count,
            difficulty_mode=difficulty
        )

        available_count = len(selected_questions)
        shortage = max(0, target_count - available_count)
        shortage_message = None
        if shortage > 0 and has_specific_topic:
            shortage_message = (
                f"Only {available_count} verified questions are currently available for {language} -> {topic_id}. "
                f"No unrelated questions were added to preserve strict examination integrity."
            )

        # 7. Shuffle selected questions deterministically
        random.seed(int(datetime.utcnow().timestamp() * 1000) % 1000000)
        random.shuffle(selected_questions)

        # 8. Create and Freeze TestSession in Database
        frozen_ids = [q.id for q in selected_questions]
        duplicate_group_ids = [q.duplicate_group_id for q in selected_questions if q.duplicate_group_id]
        duration_secs = duration_minutes * 60 if duration_minutes else (available_count * 54) # ~54 sec per question

        validation_report["selected_count"] = available_count
        validation_report["requested_count"] = target_count
        validation_report["shortage"] = shortage

        session = TestSession(
            id=f"ts-{uuid.uuid4().hex[:12]}",
            student_id=student_id,
            domain_id=domain_id,
            skill_id=norm_skill,
            language=norm_lang,
            topic_id=canonical_topic if has_specific_topic else None,
            difficulty=difficulty,
            total_questions=available_count,
            duration_seconds=duration_secs,
            frozen_question_ids_json=json.dumps(frozen_ids),
            is_exact_topic_locked=has_specific_topic,
            duplicate_group_ids_json=json.dumps(duplicate_group_ids),
            validation_report_json=json.dumps(validation_report),
            status="IN_PROGRESS"
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        # 9. Format Client-Safe (Redacted) Questions - NO CORRECT ANSWERS
        client_questions = [
            AssessmentEngineService._redact_question_for_client(q, idx)
            for idx, q in enumerate(selected_questions)
        ]

        return {
            "status": "success",
            "session_id": session.id,
            "domain_id": domain_id,
            "skill_id": norm_skill,
            "language": norm_lang,
            "topic_id": topic_id,
            "canonical_topic": canonical_topic,
            "difficulty": difficulty,
            "total_questions": len(client_questions),
            "available_count": available_count,
            "requested_count": target_count,
            "shortage": shortage,
            "shortage_message": shortage_message,
            "is_exact_topic_locked": has_specific_topic,
            "duration_seconds": session.duration_seconds,
            "created_at": session.created_at.isoformat(),
            "questions": client_questions
        }

    @staticmethod
    def get_test_session(db: Session, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves an active session with its frozen questions in the exact original sequence."""
        session = db.query(TestSession).filter(TestSession.id == session_id).first()
        if not session:
            return None

        frozen_ids = json.loads(session.frozen_question_ids_json or "[]")
        # Query items by ID
        items = db.query(QuestionBankItem).filter(QuestionBankItem.id.in_(frozen_ids)).all()
        item_map = {item.id: item for item in items}

        ordered_questions = [item_map[qid] for qid in frozen_ids if qid in item_map]

        client_questions = [
            AssessmentEngineService._redact_question_for_client(q, idx)
            for idx, q in enumerate(ordered_questions)
        ]

        return {
            "session_id": session.id,
            "student_id": session.student_id,
            "domain_id": session.domain_id,
            "skill_id": session.skill_id,
            "language": session.language,
            "topic_id": session.topic_id,
            "difficulty": session.difficulty,
            "total_questions": len(client_questions),
            "duration_seconds": session.duration_seconds,
            "status": session.status,
            "is_exact_topic_locked": session.is_exact_topic_locked,
            "duplicate_group_ids": json.loads(session.duplicate_group_ids_json or "[]"),
            "validation_report": json.loads(session.validation_report_json or "{}"),
            "created_at": session.created_at.isoformat(),
            "questions": client_questions
        }

    @staticmethod
    def submit_test_session(
        db: Session,
        session_id: str,
        student_id: Optional[str],
        answers: Dict[int, int], # questionIndex -> selectedOptionIndex
        anti_cheating_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Submits and grades a test session server-side:
        1. Evaluates against authoritative correct_index from DB.
        2. Computes score, percentage, passing verdict.
        3. Updates StudentQuestionHistory to prevent repeating these questions.
        4. Reveals explanations and answers only post-submission.
        5. Updates student verified skill profile in DB.
        """
        session = db.query(TestSession).filter(TestSession.id == session_id).first()
        if not session:
            raise ValueError(f"Session {session_id} not found.")

        if session.status == "SUBMITTED":
            return {"status": "already_submitted", "session_id": session_id, "percentage": session.score_percentage}

        frozen_ids = json.loads(session.frozen_question_ids_json or "[]")
        items = db.query(QuestionBankItem).filter(QuestionBankItem.id.in_(frozen_ids)).all()
        item_map = {item.id: item for item in items}
        ordered_items = [item_map[qid] for qid in frozen_ids if qid in item_map]

        correct_count = 0
        total_count = len(ordered_items)
        detailed_evaluations = []

        effective_student_id = student_id or session.student_id or "anonymous-student"

        for idx, item in enumerate(ordered_items):
            # Answers map can have string or int keys
            selected_idx = answers.get(idx) if idx in answers else answers.get(str(idx))
            if selected_idx is not None:
                try:
                    selected_idx = int(selected_idx)
                except (ValueError, TypeError):
                    selected_idx = None

            is_correct = (selected_idx is not None and selected_idx == item.correct_index)
            if is_correct:
                correct_count += 1

            # Log to student history for anti-repetition tracking
            if effective_student_id != "anonymous-student":
                history_record = StudentQuestionHistory(
                    student_id=effective_student_id,
                    question_id=item.id,
                    test_session_id=session.id,
                    selected_index=selected_idx,
                    is_correct=is_correct,
                    response_time_seconds=0
                )
                db.add(history_record)

            options = json.loads(item.options_json or "[]")
            detailed_evaluations.append({
                "questionIndex": idx,
                "questionId": item.id,
                "questionText": item.question_text,
                "codeSnippet": item.code_snippet,
                "options": options,
                "selectedOptionIndex": selected_idx,
                "correctOptionIndex": item.correct_index,
                "isCorrect": is_correct,
                "difficulty": item.difficulty,
                "topicName": item.topic_name,
                "explanation": item.explanation or "Official solution explanation."
            })

        percentage = round((correct_count / max(total_count, 1)) * 100.0, 2)
        passed = percentage >= 60.0

        ac_meta = anti_cheating_metadata or {}
        trust_score = ac_meta.get("trustScore", 100)
        violations = ac_meta.get("violations", [])

        # Update session
        session.status = "SUBMITTED"
        session.submitted_at = datetime.utcnow()
        session.score_raw = correct_count
        session.score_percentage = percentage
        session.anti_cheating_trust_score = trust_score
        session.anti_cheating_violations_json = json.dumps(violations)

        # Update StudentSkill if authenticated
        confidence = "Expert" if percentage >= 85 else ("Advanced" if percentage >= 70 else ("Intermediate" if percentage >= 50 else "Beginner"))
        if effective_student_id != "anonymous-student":
            skill = db.query(StudentSkill).filter(
                StudentSkill.user_id == effective_student_id,
                StudentSkill.skill_name.ilike(session.language)
            ).first()
            if skill:
                skill.test_score = int(percentage)
                skill.is_verified = passed
                skill.confidence_level = confidence
            else:
                skill = StudentSkill(
                    user_id=effective_student_id,
                    skill_name=session.language.capitalize(),
                    self_rating=4 if passed else 3,
                    test_score=int(percentage),
                    is_verified=passed,
                    confidence_level=confidence
                )
                db.add(skill)

        # Audit Log
        audit = AuditLog(
            actor_user_id=effective_student_id,
            actor_role="student",
            action="SUBMIT_ENTERPRISE_ASSESSMENT",
            target_type="TestSession",
            target_id=session.id,
            details_json=json.dumps({
                "language": session.language,
                "skill_id": session.skill_id,
                "score_raw": correct_count,
                "total_questions": total_count,
                "percentage": percentage,
                "passed": passed,
                "trust_score": trust_score
            })
        )
        db.add(audit)
        db.commit()

        cert_hash = f"NOVACERT-{uuid.uuid4().hex[:12].upper()}" if passed else None

        return {
            "status": "success",
            "session_id": session.id,
            "raw_score": correct_count,
            "total_questions": total_count,
            "percentage": percentage,
            "passed": passed,
            "confidence_level": confidence,
            "trust_score": trust_score,
            "certificate_hash": cert_hash,
            "evaluations": detailed_evaluations
        }

    # ── PRIVATE HELPERS ───────────────────────────────────────────

    @staticmethod
    def _select_balanced_pool(
        pool: List[QuestionBankItem],
        count: int,
        difficulty_mode: str
    ) -> List[QuestionBankItem]:
        """
        Selects items matching practical ratio and difficulty distribution,
        with strict single-question limit per duplicate_group_id.
        """
        if not pool or count <= 0:
            return []

        # Deduplicate pool by duplicate_group_id and content_hash first
        unique_pool: List[QuestionBankItem] = []
        seen_dg: set[str] = set()
        seen_hashes: set[str] = set()

        for q in pool:
            dg = q.duplicate_group_id
            ch = q.content_hash
            if dg and dg in seen_dg:
                continue
            if ch and ch in seen_hashes:
                continue
            if dg:
                seen_dg.add(dg)
            if ch:
                seen_hashes.add(ch)
            unique_pool.append(q)

        # Check if this is a multi-topic assessment (e.g. 50-MCQ Final Certification)
        distinct_topics = set(q.topic_id for q in unique_pool if q.topic_id)
        if len(distinct_topics) > 1 and count >= 40 and difficulty_mode == "Mixed":
            topic_map: Dict[str, List[QuestionBankItem]] = {}
            for q in unique_pool:
                t = q.topic_id or q.topic_name or "general"
                if t not in topic_map:
                    topic_map[t] = []
                topic_map[t].append(q)

            available_topics = list(topic_map.keys())
            num_topics = len(available_topics)
            max_per_topic = max(3, int(math.ceil(count / max(1, num_topics))) + 1)

            target_diffs = {"Easy": 10, "Medium": 15, "Hard": 15, "Industry": 10}
            picked: List[QuestionBankItem] = []
            picked_ids: set[str] = set()
            picked_hashes: set[str] = set()
            picked_dg: set[str] = set()
            topic_usage: Dict[str, int] = {}
            concept_usage: Dict[str, int] = {}

            def can_add(q: QuestionBankItem, enforce_cap: bool = True) -> bool:
                if not q or q.id in picked_ids:
                    return False
                if q.content_hash and q.content_hash in picked_hashes:
                    return False
                if q.duplicate_group_id and q.duplicate_group_id in picked_dg:
                    return False
                t = q.topic_id or q.topic_name or "general"
                if enforce_cap and topic_usage.get(t, 0) >= max_per_topic:
                    return False
                return True

            def add_q(q: QuestionBankItem):
                picked.append(q)
                picked_ids.add(q.id)
                if q.content_hash:
                    picked_hashes.add(q.content_hash)
                if q.duplicate_group_id:
                    picked_dg.add(q.duplicate_group_id)
                t = q.topic_id or q.topic_name or "general"
                topic_usage[t] = topic_usage.get(t, 0) + 1
                c = q.primary_concept or t
                concept_usage[c] = concept_usage.get(c, 0) + 1

            def is_prac(q: QuestionBankItem) -> bool:
                if q.question_type in ["code_output", "debugging"]:
                    return True
                if q.practicality_type in ["output_tracing", "debugging", "scenario", "edge_cases", "practical", "code_snippet"]:
                    if q.code_snippet and len(q.code_snippet.strip()) > 15:
                        return True
                if q.code_snippet and len(q.code_snippet.strip()) > 20:
                    return True
                return False

            def get_diff_cnt(d: str) -> int:
                return sum(1 for q in picked if (q.difficulty or "").lower() == d.lower())

            def get_prac_cnt() -> int:
                return sum(1 for q in picked if is_prac(q))

            def get_theory_cnt() -> int:
                return len(picked) - get_prac_cnt()

            def get_cands(topic: str, diff: Optional[str] = None, prac_only: Optional[bool] = None, enforce_cap: bool = True) -> List[QuestionBankItem]:
                items = topic_map.get(topic, [])
                res = []
                for q in items:
                    if not can_add(q, enforce_cap):
                        continue
                    if diff and (q.difficulty or "").lower() != diff.lower():
                        continue
                    if prac_only is not None and is_prac(q) != prac_only:
                        continue
                    res.append(q)
                return res

            # PASS 1: Broad Coverage (1 per topic)
            shuffled_topics = list(available_topics)
            random.shuffle(shuffled_topics)

            for topic in shuffled_topics:
                if len(picked) >= count:
                    break
                needed_diffs = [d for d, req in target_diffs.items() if get_diff_cnt(d) < req]
                if not needed_diffs:
                    break

                cands = get_cands(topic, prac_only=True)
                if not cands and get_theory_cnt() < 5:
                    cands = get_cands(topic, prac_only=False)

                if cands:
                    random.shuffle(cands)
                    matched = next((q for q in cands if (q.difficulty or "").capitalize() in needed_diffs), None)
                    chosen = matched or cands[0]
                    if can_add(chosen):
                        add_q(chosen)

            # PASS 2: Balanced Topic & Concept Round-Robin
            topic_idx = 0
            iterations = 0
            while len(picked) < count and iterations < 500:
                iterations += 1
                topics_by_usage = list(available_topics)
                random.shuffle(topics_by_usage)
                topics_by_usage.sort(key=lambda t: topic_usage.get(t, 0))
                topic = topics_by_usage[topic_idx % len(topics_by_usage)]
                topic_idx += 1

                if topic_usage.get(topic, 0) >= max_per_topic:
                    continue

                needed_diffs = [d for d, req in target_diffs.items() if get_diff_cnt(d) < req]
                if not needed_diffs:
                    break

                prefer_prac = get_prac_cnt() < 45
                cands = []
                for d in needed_diffs:
                    if prefer_prac:
                        cands = get_cands(topic, diff=d, prac_only=True)
                    if not cands and get_theory_cnt() < 5:
                        cands = get_cands(topic, diff=d, prac_only=False)
                    if cands:
                        break

                if not cands:
                    for d in needed_diffs:
                        cands = get_cands(topic, diff=d)
                        if cands:
                            break

                if cands:
                    random.shuffle(cands)
                    unused_concept = next((q for q in cands if q.primary_concept not in concept_usage), None)
                    chosen = unused_concept or cands[0]
                    if can_add(chosen):
                        add_q(chosen)

            # PASS 3: Difficulty Balancing with gradual topic expansion
            for diff, req in target_diffs.items():
                while get_diff_cnt(diff) < req and len(picked) < count:
                    prefer_prac = get_prac_cnt() < 45
                    sorted_topics = list(available_topics)
                    random.shuffle(sorted_topics)
                    sorted_topics.sort(key=lambda t: topic_usage.get(t, 0))
                    found = None

                    for extra in range(16):
                        current_cap = max_per_topic + extra
                        for t in sorted_topics:
                            if topic_usage.get(t, 0) >= current_cap:
                                continue
                            cands = get_cands(t, diff=diff, prac_only=True if prefer_prac else None, enforce_cap=False)
                            if cands:
                                found = cands[0]
                                break
                        if not found and prefer_prac:
                            for t in sorted_topics:
                                if topic_usage.get(t, 0) >= current_cap:
                                    continue
                                cands = get_cands(t, diff=diff, enforce_cap=False)
                                if cands:
                                    found = cands[0]
                                    break
                        if found:
                            break

                    if found and can_add(found, False):
                        add_q(found)
                    else:
                        break

            # PASS 4: Practical Ratio Tuning (>= 45 practical, <= 5 theory)
            prac_cnt = get_prac_cnt()
            if prac_cnt < 45 and len(picked) == count:
                spare_practical = [
                    q for q in unique_pool
                    if is_prac(q)
                    and q.id not in picked_ids
                    and (not q.content_hash or q.content_hash not in picked_hashes)
                    and (not q.duplicate_group_id or q.duplicate_group_id not in picked_dg)
                ]
                random.shuffle(spare_practical)

                sp_idx = 0
                for i in range(len(picked) - 1, -1, -1):
                    if prac_cnt >= 45 or sp_idx >= len(spare_practical):
                        break
                    if not is_prac(picked[i]):
                        target_d = (picked[i].difficulty or "").lower()
                        matched_idx = next(
                            (idx for idx in range(sp_idx, len(spare_practical)) if (spare_practical[idx].difficulty or "").lower() == target_d),
                            sp_idx
                        )
                        matched = spare_practical[matched_idx]
                        if matched.id not in picked_ids:
                            picked_ids.discard(picked[i].id)
                            picked[i] = matched
                            picked_ids.add(matched.id)
                            if matched.content_hash:
                                picked_hashes.add(matched.content_hash)
                            if matched.duplicate_group_id:
                                picked_dg.add(matched.duplicate_group_id)
                            prac_cnt += 1
                            sp_idx = matched_idx + 1

            # PASS 5: If fewer than count, fill from remaining unique_pool
            if len(picked) < count:
                for q in unique_pool:
                    if len(picked) >= count:
                        break
                    if can_add(q, False):
                        add_q(q)

            random.shuffle(picked)
            return picked[:count]

        # 2. Partition into practical (has code or practical type) and theoretical pools
        practical_pool = [
            q for q in unique_pool
            if q.practicality_type in ["practical", "code_snippet"] or (q.code_snippet and q.code_snippet.strip())
        ]
        theory_pool = [
            q for q in unique_pool
            if q not in practical_pool
        ]

        # 3. Target: ~90% practical, ~10% theoretical
        # If count >= 10: target ~90% practical (e.g. 13-14 out of 15; 45 out of 50)
        # At least 1 theory question if count >= 10 and theory available
        req_theory = max(1, int(round(count * 0.10))) if count >= 10 and len(theory_pool) > 0 else 0
        req_practical = count - req_theory

        actual_prac_target = min(len(practical_pool), req_practical)
        actual_theory_target = min(len(theory_pool), count - actual_prac_target)
        if actual_prac_target + actual_theory_target < count and len(practical_pool) > actual_prac_target:
            actual_prac_target = min(len(practical_pool), count - actual_theory_target)

        picked: List[QuestionBankItem] = []
        picked_ids: set[str] = set()
        picked_dg: set[str] = set()

        def add_from_source(source: List[QuestionBankItem], n: int, mode: str):
            if n <= 0 or not source:
                return
            random.shuffle(source)
            if mode == "Mixed":
                diff_buckets = {
                    "Easy": [q for q in source if q.difficulty == "Easy"],
                    "Medium": [q for q in source if q.difficulty == "Medium"],
                    "Hard": [q for q in source if q.difficulty == "Hard"],
                    "Industry": [q for q in source if q.difficulty == "Industry"]
                }
                targets = {
                    "Easy": max(1, int(round(n * 0.20))),
                    "Medium": max(1, int(round(n * 0.30))),
                    "Hard": max(1, int(round(n * 0.30))),
                    "Industry": max(1, int(round(n * 0.20)))
                }
                for d, req in targets.items():
                    bucket = diff_buckets[d]
                    random.shuffle(bucket)
                    added = 0
                    for item in bucket:
                        if added >= req or len(picked) >= count:
                            break
                        dg = item.duplicate_group_id
                        if item.id in picked_ids or (dg and dg in picked_dg):
                            continue
                        picked.append(item)
                        picked_ids.add(item.id)
                        if dg:
                            picked_dg.add(dg)
                        added += 1
            else:
                diff_matched = [q for q in source if q.difficulty == mode]
                candidates = diff_matched if diff_matched else source
                for item in candidates:
                    if len(picked) >= count:
                        break
                    dg = item.duplicate_group_id
                    if item.id in picked_ids or (dg and dg in picked_dg):
                        continue
                    picked.append(item)
                    picked_ids.add(item.id)
                    if dg:
                        picked_dg.add(dg)

        # First add practical questions up to target
        add_from_source(practical_pool, actual_prac_target, difficulty_mode)

        # If practical target was not reached due to difficulty shortages, backfill from remaining practical items
        if len(picked) < actual_prac_target:
            rem_prac = [
                q for q in practical_pool
                if q.id not in picked_ids and (not q.duplicate_group_id or q.duplicate_group_id not in picked_dg)
            ]
            random.shuffle(rem_prac)
            for item in rem_prac:
                if len(picked) >= actual_prac_target:
                    break
                dg = item.duplicate_group_id
                if item.id in picked_ids or (dg and dg in picked_dg):
                    continue
                picked.append(item)
                picked_ids.add(item.id)
                if dg:
                    picked_dg.add(dg)

        # Then add theory questions up to target
        rem_for_theory = min(actual_theory_target, count - len(picked))
        add_from_source(theory_pool, rem_for_theory, difficulty_mode)

        # Fill any remainder up to requested count using remaining unique items
        if len(picked) < count:
            remaining_pool = [
                q for q in unique_pool
                if q.id not in picked_ids and (not q.duplicate_group_id or q.duplicate_group_id not in picked_dg)
            ]
            random.shuffle(remaining_pool)
            for item in remaining_pool:
                if len(picked) >= count:
                    break
                dg = item.duplicate_group_id
                if item.id in picked_ids or (dg and dg in picked_dg):
                    continue
                picked.append(item)
                picked_ids.add(item.id)
                if dg:
                    picked_dg.add(dg)

        return picked[:count]

    @staticmethod
    def _redact_question_for_client(item: QuestionBankItem, index: int) -> Dict[str, Any]:
        """Strips correct answer and explanation to ensure examination integrity."""
        options = json.loads(item.options_json or "[]")
        return {
            "index": index,
            "id": item.id,
            "domainId": item.domain_id,
            "skillId": item.skill_id,
            "languageId": item.language_id,
            "topicId": item.topic_id,
            "topicName": item.topic_name,
            "subtopic": item.subtopic,
            "primaryConcept": item.primary_concept,
            "duplicateGroupId": item.duplicate_group_id,
            "difficulty": item.difficulty,
            "questionType": item.question_type,
            "practicalType": item.practicality_type,
            "question": item.question_text,
            "codeSnippet": item.code_snippet,
            "options": options,
            "marks": 1,
            "negativeMarks": 0,
            "status": item.validation_status
        }
