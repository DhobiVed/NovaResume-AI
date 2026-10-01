from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Index, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.session import Base

# ── 1. USERS TABLE ─────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(512), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("ResumeProject", back_populates="user", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="user", cascade="all, delete-orphan")
    portfolios = relationship("PortfolioData", back_populates="user", cascade="all, delete-orphan")
    resume_versions = relationship("ResumeVersion", back_populates="user", cascade="all, delete-orphan")
    job_applications = relationship("JobTracker", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_users_email", "email"),
    )

# ── 2. USER PROFILES TABLE ─────────────────────────────────────
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    avatar_url = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    github = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)

    user = relationship("User", back_populates="profile")

# ── 3. RESUME PROJECTS TABLE ───────────────────────────────────
class ResumeProject(Base):
    __tablename__ = "resume_projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    tech_tags = Column(String(512), nullable=True)
    github_url = Column(String(512), nullable=True)
    demo_url = Column(String(512), nullable=True)
    is_featured = Column(Boolean, default=False)

    user = relationship("User", back_populates="projects")

# ── 4. RESUMES TABLE ───────────────────────────────────────────
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled Resume")
    template_id = Column(String(100), nullable=False, default="modern_navy")
    data_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")

# ── 5. COVER LETTERS TABLE ─────────────────────────────────────
class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="cover_letters")

# ── 6. PORTFOLIO DATA TABLE ───────────────────────────────────
class PortfolioData(Base):
    __tablename__ = "portfolio_data"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    style_preset = Column(String(100), default="developer")
    accent_color = Column(String(50), default="#059669")
    custom_domain = Column(String(255), nullable=True)
    published_url = Column(String(512), nullable=True)
    data_json = Column(Text, nullable=False)

    user = relationship("User", back_populates="portfolios")

# ── 7. RESUME VERSIONS TABLE ───────────────────────────────────
class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    version_label = Column(String(255), nullable=False)
    data_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="resume_versions")
    resume = relationship("Resume", back_populates="versions")

# ── 8. JOB TRACKER TABLE ───────────────────────────────────────
class JobTracker(Base):
    __tablename__ = "job_tracker"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="Applied")
    application_date = Column(String(50), nullable=True)
    interview_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    job_link = Column(String(512), nullable=True)

    user = relationship("User", back_populates="job_applications")

# ── 9. REFRESH TOKENS TABLE ────────────────────────────────────
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(512), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="refresh_tokens")

# ── 10. PASSWORD RESET TOKENS TABLE ────────────────────────────
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(512), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)

# ── 11. EMAIL VERIFICATION TOKENS TABLE ────────────────────────
class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(512), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)


# ── SIH26044 CAREERCONNECT EXTENSIONS ────────────────────────────

# ── 12. USER ROLES TABLE (SERVER-ENFORCED RBAC) ─────────────────
class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_name = Column(String(50), nullable=False, default="student") # student, academician, industry, institution, super_admin
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ── 13. STUDENT CAREER PROFILES ─────────────────────────────────
class StudentCareerProfile(Base):
    __tablename__ = "student_career_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    branch = Column(String(255), nullable=True)
    cgpa = Column(String(50), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    target_role = Column(String(255), nullable=True)
    preferred_domain = Column(String(255), nullable=True)
    bio_summary = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# ── 14. ACADEMICIAN PROFILES ─────────────────────────────────────
class AcademicianProfile(Base):
    __tablename__ = "academician_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    department = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    research_interests = Column(Text, nullable=True)
    consultancy_areas = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# ── 15. COMPANY PROFILES ────────────────────────────────────────
class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    sector = Column(String(255), nullable=True)
    website = Column(String(512), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ── 16. INSTITUTION PROFILES ────────────────────────────────────
class InstitutionProfile(Base):
    __tablename__ = "institution_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    institution_name = Column(String(255), nullable=False)
    code = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ── 17. CANONICAL SKILL TAXONOMY ────────────────────────────────
class CanonicalSkill(Base):
    __tablename__ = "canonical_skills"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, default="Technical") # Technical, Soft, Domain
    normalized_slug = Column(String(255), unique=True, nullable=False)

# ── 18. STUDENT SKILLS & EVIDENCE ───────────────────────────────
class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(255), nullable=False)
    self_rating = Column(Integer, default=3, nullable=False) # 1-5
    test_score = Column(Integer, default=0, nullable=True) # 0-100
    is_verified = Column(Boolean, default=False, nullable=False)
    confidence_level = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced, Expert
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# ── 19. ASSESSMENTS & QUESTIONS ─────────────────────────────────
class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    domain = Column(String(100), nullable=False)
    time_limit_mins = Column(Integer, default=15, nullable=False)
    questions_json = Column(Text, nullable=False) # JSON array of questions
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    score_percentage = Column(Integer, nullable=False)
    passed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    section_name = Column(String(100), default="General", nullable=False)
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False) # JSON array of 4 options
    correct_option_index = Column(Integer, nullable=False)
    skill_tag = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="Medium") # Easy, Medium, Hard
    explanation = Column(Text, nullable=True)

# ── 19B. ENTERPRISE QUESTION BANK & FROZEN SESSIONS ──────────────
class QuestionBankItem(Base):
    __tablename__ = "question_bank_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    domain_id = Column(String(100), nullable=False, index=True, default="computer_science") # computer_science, mechanical, civil, electrical, electronics
    domain_name = Column(String(150), nullable=False, default="Computer Science & Engineering")
    subject_id = Column(String(100), nullable=True, index=True) # canonical subject slug e.g. java-programming
    skill_id = Column(String(100), nullable=False, index=True) # python, java, dart, solidworks, etc.
    skill_name = Column(String(150), nullable=False)
    language_id = Column(String(100), nullable=False, index=True) # normalized language/tool slug
    module_id = Column(String(100), nullable=True)
    topic_id = Column(String(100), nullable=False, index=True) # canonical topic slug: java-conditions, loops, etc.
    topic_name = Column(String(150), nullable=False)
    subtopic = Column(String(150), nullable=True)
    subtopic_id = Column(String(100), nullable=True, index=True)
    primary_concept = Column(String(150), nullable=False, default="general", index=True) # exact tested construct e.g. java-if-else
    secondary_concepts_json = Column(Text, nullable=True) # JSON list of secondary concepts
    difficulty = Column(String(50), nullable=False, index=True, default="Medium") # Easy, Medium, Hard, Industry
    question_type = Column(String(50), default="multiple_choice", nullable=False) # multiple_choice, snippet_output, code_debug
    practicality_type = Column(String(50), nullable=False, index=True, default="practical") # practical, code_snippet, output_prediction, theoretical
    question_text = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    options_json = Column(Text, nullable=False) # JSON array of 4 options
    correct_index = Column(Integer, nullable=False) # Authoritative 0-indexed correct option
    explanation = Column(Text, nullable=True)
    validation_status = Column(String(50), nullable=False, index=True, default="VERIFIED") # VERIFIED, QUARANTINED, REJECTED, LEGACY_REVIEW
    source_type = Column(String(50), nullable=False, index=True, default="DATASET_100K") # EXISTING, DATASET_100K, AI_GENERATED, AI_REVIEWED
    quality_score = Column(Float, default=1.0, nullable=False)
    semantic_match_score = Column(Float, default=100.0, nullable=False)
    duplicate_group_id = Column(String(64), nullable=True, index=True) # DG-XXXXX
    validation_version = Column(String(50), default="V2-FAIL-CLOSED", nullable=False)
    content_hash = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_qbank_lookup", "validation_status", "language_id", "topic_id", "difficulty"),
        Index("idx_qbank_concept", "validation_status", "language_id", "primary_concept"),
        Index("idx_qbank_hash", "content_hash"),
        Index("idx_qbank_dupgroup", "duplicate_group_id"),
    )

class StudentQuestionHistory(Base):
    __tablename__ = "student_question_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String, ForeignKey("question_bank_items.id", ondelete="CASCADE"), nullable=False, index=True)
    test_session_id = Column(String, nullable=False, index=True)
    selected_index = Column(Integer, nullable=True)
    is_correct = Column(Boolean, nullable=False, default=False)
    response_time_seconds = Column(Integer, default=0, nullable=False)
    attempted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_student_q_history", "student_id", "question_id"),
    )

class TestSession(Base):
    __tablename__ = "test_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True) # Nullable for guest/initial tests
    domain_id = Column(String(100), nullable=False, default="computer_science")
    skill_id = Column(String(100), nullable=False)
    language = Column(String(100), nullable=False)
    topic_id = Column(String(100), nullable=True)
    difficulty = Column(String(50), default="Mixed", nullable=False)
    total_questions = Column(Integer, default=50, nullable=False)
    duration_seconds = Column(Integer, default=2700, nullable=False) # 45 mins for 50 Qs
    frozen_question_ids_json = Column(Text, nullable=False) # JSON array of question IDs in fixed sequence
    status = Column(String(50), default="IN_PROGRESS", nullable=False) # IN_PROGRESS, SUBMITTED, EXPIRED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    submitted_at = Column(DateTime, nullable=True)
    score_raw = Column(Integer, nullable=True)
    score_percentage = Column(Float, nullable=True)
    anti_cheating_trust_score = Column(Integer, default=100, nullable=False)
    anti_cheating_violations_json = Column(Text, nullable=True)
    is_exact_topic_locked = Column(Boolean, default=True, nullable=False)
    duplicate_group_ids_json = Column(Text, nullable=True) # JSON array of duplicate groups in this test
    validation_report_json = Column(Text, nullable=True) # Pre-test verification record
class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_by_user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    opportunity_type = Column(String(50), nullable=False, default="Internship") # Internship, Job, Live Project, FDP, Apprenticeship
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=False) # Comma-separated or JSON
    preferred_skills = Column(Text, nullable=True)
    min_cgpa = Column(String(50), nullable=True)
    eligible_batches = Column(String(255), nullable=True)
    location = Column(String(255), nullable=False, default="Remote")
    stipend_or_salary = Column(String(100), nullable=True)
    deadline = Column(String(50), nullable=True)
    external_apply_url = Column(String(512), nullable=True) # Direct ATS, Career Page, or Google Form
    opportunity_scope = Column(String(50), default="National") # College-Specific, State-Wide, National
    status = Column(String(50), default="Open", nullable=False) # Open, Closed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ── 21. EXPLAINABLE MATCH RESULTS ──────────────────────────────
class OpportunityMatch(Base):
    __tablename__ = "opportunity_matches"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    overall_score = Column(Integer, nullable=False) # 0-100
    matched_skills_json = Column(Text, nullable=False) # JSON list
    missing_skills_json = Column(Text, nullable=False) # JSON list
    eligibility_passed = Column(Boolean, default=True, nullable=False)
    explanation_json = Column(Text, nullable=False) # Full explainable breakdown
    computed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ── 22. APPLICATIONS & RECRUITER PIPELINE ────────────────────────
class CareerApplication(Base):
    __tablename__ = "career_applications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="Applied") # Saved, Applied, Screening, Shortlisted, Interview, Selected, Rejected
    applied_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    recruiter_notes = Column(Text, nullable=True)

# ── 23. VERIFICATION LEDGER ─────────────────────────────────────
class VerificationLedger(Base):
    __tablename__ = "verification_ledger"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(50), nullable=False) # Skill, Certificate, Project, Internship
    item_title = Column(String(255), nullable=False)
    verifier_entity = Column(String(255), nullable=False) # e.g. "IIT Bombay" or "Microsoft"
    verifier_name = Column(String(255), nullable=True)
    evidence_url = Column(String(512), nullable=True)
    status = Column(String(50), default="Verified", nullable=False) # Verified, Pending, Rejected
    verified_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ── 24. NORMALIZED INSTITUTIONS & DEPARTMENTS ───────────────────
class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(50), nullable=True, index=True)
    university = Column(String(255), nullable=True)
    institution_type = Column(String(100), default="Engineering & Research Institute")
    state = Column(String(100), nullable=True, index=True)
    city = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    official_domain = Column(String(100), nullable=True)
    accreditation = Column(String(255), nullable=True)
    verification_status = Column(String(50), default="Verified") # Verified, Pending
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class Department(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    institution_id = Column(String, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    program = Column(String(100), default="B.Tech")
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class FacultyProfileExtended(Base):
    __tablename__ = "faculty_profiles_extended"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institution_id = Column(String, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(String, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    designation = Column(String(100), default="Professor")
    employee_id = Column(String(100), nullable=True)
    expertise_areas = Column(Text, nullable=True)
    experience_years = Column(Integer, default=5)
    verification_status = Column(String(50), default="Verified") # Pending, Under_Review, Verified, Rejected, Suspended
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class StudentAcademicAffiliation(Base):
    __tablename__ = "student_academic_affiliations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institution_id = Column(String, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(String, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    program = Column(String(100), default="B.Tech")
    batch = Column(String(50), default="2022-2026")
    current_semester = Column(Integer, default=6)
    enrollment_no = Column(String(100), nullable=True)
    cgpa = Column(String(50), default="8.5")

# ── 25. MENTORSHIP SYSTEM ───────────────────────────────────────
class MentorshipAssignment(Base):
    __tablename__ = "mentorship_assignments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    faculty_user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    student_user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="Active") # Active, Completed
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class MentorshipGoal(Base):
    __tablename__ = "mentorship_goals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_id = Column(String, ForeignKey("mentorship_assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    target_skill = Column(String(255), nullable=True)
    target_date = Column(String(50), nullable=True)
    status = Column(String(50), default="In_Progress") # Not_Started, In_Progress, Achieved
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class MentorshipNote(Base):
    __tablename__ = "mentorship_notes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_id = Column(String, ForeignKey("mentorship_assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    note_type = Column(String(50), default="Session_Note")
    content = Column(Text, nullable=False)
    action_items = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ── 26. AUDIT LOGS & NOTIFICATIONS ──────────────────────────────
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_user_id = Column(String, nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=True)
    target_id = Column(String(255), nullable=True)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class PlatformNotification(Base):
    __tablename__ = "platform_notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_user_id = Column(String, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ── 27. INDUSTRY SOCIAL POSTS ───────────────────────────────────
class IndustryPost(Base):
    __tablename__ = "industry_posts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recruiter_user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    author_name = Column(String(255), nullable=False, default="Recruiter")
    company_name = Column(String(255), nullable=False, default="Verified Industry")
    company_logo = Column(Text, nullable=True)
    is_verified_company = Column(Boolean, default=True)
    post_type = Column(String(50), default="announcement")  # announcement, internship, job, drive, workshop, project
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)
    external_links_json = Column(Text, nullable=True)  # JSON array
    skills_json = Column(Text, nullable=True)  # JSON array
    target_departments_json = Column(Text, nullable=True)  # JSON array
    target_semesters_json = Column(Text, nullable=True)  # JSON array
    application_mode = Column(String(50), default="both")  # direct_link, internal, both
    direct_apply_url = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    stipend_or_ctc = Column(String(100), nullable=True)
    deadline = Column(String(50), nullable=True)
    likes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)



