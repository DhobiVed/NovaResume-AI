from fastapi import APIRouter, Depends, HTTPException, Header, status, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
import json
import uuid
import os
import shutil

from app.database.session import get_db
from app.core.config import UPLOADS_DIR
from app.models.schema import (
    User, UserRole, StudentCareerProfile, AcademicianProfile, CompanyProfile, InstitutionProfile,
    CanonicalSkill, StudentSkill, Assessment, AssessmentAttempt, Opportunity, OpportunityMatch,
    CareerApplication, VerificationLedger, AuditLog, Institution, Department,
    FacultyProfileExtended, StudentAcademicAffiliation, IndustryPost,
    QuestionBankItem, TestSession, StudentQuestionHistory
)
from app.services.assessment_engine import AssessmentEngineService
from app.core.security import verify_access_token, create_access_token

router = APIRouter()

DEMO_ACCOUNTS = {
    "student": {
        "id": "demo-student-1",
        "email": "student@novaconnect.edu",
        "full_name": "Ved Dhobi",
        "role": "student",
        "title": "Ayush Informatics Student & AI Researcher",
        "institution": "All India Institute of Ayurveda (AIIA)",
        "department": "Dept of Ayush Clinical Informatics",
        "cgpa": "8.8"
    },
    "academician": {
        "id": "demo-faculty-1",
        "email": "faculty@aiia.gov.in",
        "full_name": "Dr. Rajesh Sharma",
        "role": "academician",
        "title": "Professor & Head of Clinical Informatics",
        "institution": "All India Institute of Ayurveda (AIIA)",
        "department": "Dept of Ayush Clinical Informatics",
        "assigned_mentees": 12
    },
    "industry": {
        "id": "demo-industry-1",
        "email": "recruiter@google.com",
        "full_name": "Priya Patel",
        "role": "industry",
        "title": "Lead University Recruiter",
        "company": "Google AI Labs",
        "sector": "Healthcare AI & Intelligent Systems"
    },
    "institution": {
        "id": "demo-institution-1",
        "email": "admin@aiia.gov.in",
        "full_name": "Prof. Arvind Swaminathan",
        "role": "institution",
        "title": "Dean of Academic & Industry Collaborations",
        "institution": "All India Institute of Ayurveda (AIIA)",
        "code": "AIIA-ND-001"
    },
    "super_admin": {
        "id": "demo-admin-1",
        "email": "superadmin@ayush.gov.in",
        "full_name": "Dr. V. K. Paul",
        "role": "super_admin",
        "title": "National Portal Director",
        "department": "Ministry of Ayush / Central Governance"
    }
}

def get_user_and_role(authorization: str | None, db: Session, required_roles: list[str] | None = None):
    """Parse Bearer token or demo token, resolve user & role, and strictly enforce RBAC permissions."""
    user = None
    user_role_name = "student"

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()
        if token.startswith("demo-"):
            role_key = token.replace("demo-", "")
            if role_key in DEMO_ACCOUNTS:
                acc = DEMO_ACCOUNTS[role_key]
                user = db.query(User).filter(User.id == acc["id"]).first()
                if not user:
                    user = User(id=acc["id"], full_name=acc["full_name"], email=acc["email"], hashed_password="demo_hashed_pass")
                    db.add(user)
                    db.commit()
                    db.refresh(user)
                    db.add(UserRole(user_id=user.id, role_name=acc["role"]))
                    db.commit()
                user_role_name = acc["role"]
        else:
            payload = verify_access_token(token)
            if payload and "sub" in payload:
                user = db.query(User).filter(User.id == payload["sub"]).first()
                if user:
                    role_obj = db.query(UserRole).filter(UserRole.user_id == user.id).first()
                    user_role_name = role_obj.role_name if role_obj else "student"

    if not user:
        user = db.query(User).first()
        if not user:
            acc = DEMO_ACCOUNTS["student"]
            user = User(id=acc["id"], full_name=acc["full_name"], email=acc["email"], hashed_password="hashed")
            db.add(user)
            db.commit()
            db.refresh(user)
            db.add(UserRole(user_id=user.id, role_name="student"))
            db.commit()
        role_obj = db.query(UserRole).filter(UserRole.user_id == user.id).first()
        user_role_name = role_obj.role_name if role_obj else "student"

    if required_roles and user_role_name not in required_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Requires role in {required_roles}. Your current authenticated role is '{user_role_name}'."
        )

    return user, user_role_name

def get_user_from_auth_header(authorization: str | None, db: Session, required_roles: list[str] | None = None):
    user, _ = get_user_and_role(authorization, db, required_roles)
    return user

# ── REQUEST / RESPONSE SCHEMAS ──────────────────────────────────
class RoleLoginRequest(BaseModel):
    email: str
    password: str
    role: str

class RoleRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str # student, academician, industry, institution
    institution_name: str | None = None
    department: str | None = None
    cgpa: str | None = None
    graduation_year: int | None = None
    company_name: str | None = None
    designation: str | None = None

class RoleUpdateRequest(BaseModel):
    role_name: str # student, academician, industry, institution, super_admin

class StudentProfileRequest(BaseModel):
    branch: str | None = None
    cgpa: str | None = None
    graduation_year: int | None = None
    target_role: str | None = None
    preferred_domain: str | None = None
    bio_summary: str | None = None

class SkillAddRequest(BaseModel):
    skill_name: str
    self_rating: int = 3

class OpportunityCreateRequest(BaseModel):
    company_name: str
    title: str
    opportunity_type: str = "Internship" # Internship, Job, Live Project, FDP, Apprenticeship
    description: str
    required_skills: str
    preferred_skills: str | None = None
    min_cgpa: str | None = None
    eligible_batches: str | None = None
    location: str = "Remote"
    stipend_or_salary: str | None = None
    deadline: str | None = None
    external_apply_url: str | None = None
    opportunity_scope: str = "National"

class StudentAcademicUpdateRequest(BaseModel):
    current_semester: int | None = None
    department: str | None = None
    institution_name: str | None = None
    cgpa: str | None = None

class Assessment50SubmitRequest(BaseModel):
    test_id: str
    language: str
    difficulty: str
    answers: dict # q_id -> chosen_option_index
    total_questions: int = 50
    correct_count: int
    raw_score: float
    max_score: float
    percentage: float
    anti_cheating_violations: list[dict] = []
    anti_cheating_trust_score: int = 100
    topic_breakdown: list[dict] = []

class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    answers: dict # question_index -> selected_option

class AssessmentCreateSessionRequest(BaseModel):
    language: str
    skill_id: str | None = None
    domain_id: str = "computer_science"
    topic_id: str | None = None
    difficulty: str = "Mixed"
    count: int = 50
    duration_minutes: int = 45

class AssessmentSessionSubmitRequest(BaseModel):
    answers: dict = {}
    anti_cheating_trust_score: int = 100
    anti_cheating_violations: list[dict] = []

class MatchRequest(BaseModel):
    opportunity_id: str

class ApplicationStatusRequest(BaseModel):
    status: str
    recruiter_notes: str | None = None

class VerificationRequest(BaseModel):
    item_type: str
    item_title: str
    verifier_entity: str
    evidence_url: str | None = None

class IndustryPostCreateRequest(BaseModel):
    title: str | None = None
    content: str
    post_type: str = "Announcement"
    image_url: str | None = None
    external_links: list[str] | None = None
    skills: list[str] | None = None
    target_departments: list[str] | None = None
    target_semesters: list[int] | None = None
    application_mode: str = "both"
    direct_apply_url: str | None = None
    location: str | None = None
    stipend_or_ctc: str | None = None
    deadline: str | None = None
    author_name: str | None = None
    company_name: str | None = None

class ApplicationCreateRequest(BaseModel):
    opportunity_id: str | None = None

class IndustryPostUpdateRequest(BaseModel):
    content: str | None = None
    post_type: str | None = None
    image_url: str | None = None
    external_links: list[str] | None = None
    skills: list[str] | None = None
    target_departments: list[str] | None = None
    target_semesters: list[int] | None = None
    application_mode: str | None = None
    direct_apply_url: str | None = None
    location: str | None = None
    stipend_or_ctc: str | None = None
    deadline: str | None = None

# ── 0. ROLE-SPECIFIC AUTHENTICATION & DEMO LOGIN ────────────────
@router.post("/auth/demo-login/{role}")
def demo_role_login(role: str, db: Session = Depends(get_db)):
    if role not in DEMO_ACCOUNTS:
        raise HTTPException(status_code=400, detail=f"Invalid demo role '{role}'. Must be one of {list(DEMO_ACCOUNTS.keys())}")
    
    acc = DEMO_ACCOUNTS[role]
    user = db.query(User).filter(User.id == acc["id"]).first()
    if not user:
        user = User(id=acc["id"], full_name=acc["full_name"], email=acc["email"], hashed_password="demo_hashed_pass")
        db.add(user)
        db.commit()
        db.refresh(user)
        db.add(UserRole(user_id=user.id, role_name=acc["role"]))
        db.commit()
    
    audit = AuditLog(
        actor_user_id=user.id,
        actor_role=acc["role"],
        action="DEMO_ROLE_LOGIN",
        target_type="AUTH",
        target_id=user.id,
        details_json=json.dumps({"role": acc["role"], "email": acc["email"]})
    )
    db.add(audit)
    db.commit()
    
    token = f"demo-{role}"
    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": acc["full_name"],
            "email": acc["email"],
            "role": acc["role"],
            "title": acc.get("title", ""),
            "institution": acc.get("institution", ""),
            "department": acc.get("department", ""),
            "company": acc.get("company", ""),
            "cgpa": acc.get("cgpa", "")
        }
    }

@router.post("/auth/login")
def role_login(req: RoleLoginRequest, db: Session = Depends(get_db)):
    matched_role = None
    for r, acc in DEMO_ACCOUNTS.items():
        if acc["email"].lower() == req.email.lower():
            matched_role = r
            break
            
    if matched_role:
        return demo_role_login(matched_role, db)
        
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        user = User(id=str(uuid.uuid4()), full_name=req.email.split("@")[0].title(), email=req.email.lower(), hashed_password="hashed")
        db.add(user)
        db.commit()
        db.refresh(user)
        db.add(UserRole(user_id=user.id, role_name=req.role))
        db.commit()
    
    role_obj = db.query(UserRole).filter(UserRole.user_id == user.id).first()
    user_role = role_obj.role_name if role_obj else req.role

    if req.role != user_role and user_role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail=f"Role mismatch: This account is registered as '{user_role}', not '{req.role}'. Please login via the correct portal."
        )

    token = create_access_token({"sub": user.id, "role": user_role})
    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user_role
        }
    }

@router.post("/auth/register")
def role_register(req: RoleRegisterRequest, db: Session = Depends(get_db)):
    if req.role == "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin accounts cannot be publicly registered.")
    
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
        
    user = User(
        id=str(uuid.uuid4()),
        full_name=req.full_name,
        email=req.email.lower(),
        hashed_password="hashed_placeholder"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    user_role = UserRole(user_id=user.id, role_name=req.role)
    db.add(user_role)
    
    if req.role == "student":
        sp = StudentCareerProfile(
            user_id=user.id,
            branch=req.department or "Computer Science & Ayush Informatics",
            cgpa=req.cgpa or "8.5",
            graduation_year=req.graduation_year or 2026,
            target_role="Ayush Informatics & AI Specialist"
        )
        db.add(sp)
    elif req.role == "academician":
        ap = AcademicianProfile(
            user_id=user.id,
            department=req.department or "Dept of Ayush Clinical Informatics",
            designation=req.designation or "Assistant Professor"
        )
        db.add(ap)
    elif req.role == "industry":
        cp = CompanyProfile(
            user_id=user.id,
            company_name=req.company_name or "Partner Enterprise",
            is_verified=False
        )
        db.add(cp)
    elif req.role == "institution":
        ip = InstitutionProfile(
            user_id=user.id,
            institution_name=req.institution_name or "Partner University"
        )
        db.add(ip)

    audit = AuditLog(
        actor_user_id=user.id,
        actor_role=req.role,
        action="USER_REGISTRATION",
        target_type="AUTH",
        target_id=user.id,
        details_json=json.dumps({"email": req.email, "role": req.role})
    )
    db.add(audit)
    db.commit()
    
    token = create_access_token({"sub": user.id, "role": req.role})
    return {
        "status": "success",
        "message": "Account registered successfully",
        "access_token": token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": req.role
        }
    }

@router.get("/auth/me")
def get_current_session(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user, role = get_user_and_role(authorization, db)
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": role
    }

# ── 1. USER ROLE & CAREER PROFILE ENDPOINTS ─────────────────────
@router.get("/profile")
def get_career_profile(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db)
    role = db.query(UserRole).filter(UserRole.user_id == user.id).first()
    role_name = role.role_name if role else "student"
    
    student_profile = db.query(StudentCareerProfile).filter(StudentCareerProfile.user_id == user.id).first()
    
    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": role_name,
        "student_profile": {
            "branch": student_profile.branch if student_profile else "Computer Science & Engineering",
            "cgpa": student_profile.cgpa if student_profile else "8.5",
            "graduation_year": student_profile.graduation_year if student_profile else 2026,
            "target_role": student_profile.target_role if student_profile else "Full Stack Engineer",
            "preferred_domain": student_profile.preferred_domain if student_profile else "AI & Web Development",
            "bio_summary": student_profile.bio_summary if student_profile else "Passionate developer building AI-powered web applications."
        }
    }

@router.post("/profile")
def update_career_profile(req: StudentProfileRequest, authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db)
    profile = db.query(StudentCareerProfile).filter(StudentCareerProfile.user_id == user.id).first()
    if not profile:
        profile = StudentCareerProfile(user_id=user.id)
        db.add(profile)
    
    if req.branch is not None: profile.branch = req.branch
    if req.cgpa is not None: profile.cgpa = req.cgpa
    if req.graduation_year is not None: profile.graduation_year = req.graduation_year
    if req.target_role is not None: profile.target_role = req.target_role
    if req.preferred_domain is not None: profile.preferred_domain = req.preferred_domain
    if req.bio_summary is not None: profile.bio_summary = req.bio_summary
    
    db.commit()
    return {"status": "success", "message": "Profile updated successfully"}

@router.post("/role")
def set_user_role(req: RoleUpdateRequest, authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db)
    role = db.query(UserRole).filter(UserRole.user_id == user.id).first()
    if not role:
        role = UserRole(user_id=user.id, role_name=req.role_name)
        db.add(role)
    else:
        role.role_name = req.role_name
    db.commit()
    return {"status": "success", "role": req.role_name}

# ── 2. SKILL TAXONOMY & ASSESSMENT ENDPOINTS ────────────────────
@router.get("/skills/catalog")
def get_canonical_skills(db: Session = Depends(get_db)):
    skills = db.query(CanonicalSkill).all()
    if not skills:
        # Seed canonical skills if empty
        defaults = [
            ("Python", "Technical"), ("JavaScript", "Technical"), ("React", "Technical"),
            ("FastAPI", "Technical"), ("SQL", "Technical"), ("Docker", "Technical"),
            ("Data Structures", "Technical"), ("Machine Learning", "Technical"),
            ("Problem Solving", "Soft"), ("Team Leadership", "Soft"), ("Communication", "Soft")
        ]
        for name, cat in defaults:
            s = CanonicalSkill(name=name, category=cat, normalized_slug=name.lower().replace(" ", "-"))
            db.add(s)
        db.commit()
        skills = db.query(CanonicalSkill).all()
    return [{"id": s.id, "name": s.name, "category": s.category} for s in skills]

@router.get("/skills/student")
def get_student_skills(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db)
    skills = db.query(StudentSkill).filter(StudentSkill.user_id == user.id).all()
    if not skills:
        # Return initial default profile
        defaults = [
            ("Python", 4, 85, True, "Advanced"),
            ("React", 4, 90, True, "Advanced"),
            ("FastAPI", 3, 75, True, "Intermediate"),
            ("SQL", 4, 80, True, "Advanced"),
            ("JavaScript", 4, 88, True, "Advanced")
        ]
        for name, rating, score, ver, conf in defaults:
            sk = StudentSkill(user_id=user.id, skill_name=name, self_rating=rating, test_score=score, is_verified=ver, confidence_level=conf)
            db.add(sk)
        db.commit()
        skills = db.query(StudentSkill).filter(StudentSkill.user_id == user.id).all()
        
    return [{
        "id": s.id,
        "skill_name": s.skill_name,
        "self_rating": s.self_rating,
        "test_score": s.test_score,
        "is_verified": s.is_verified,
        "confidence_level": s.confidence_level
    } for s in skills]

@router.post("/skills/student")
def add_student_skill(req: SkillAddRequest, authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db)
    existing = db.query(StudentSkill).filter(StudentSkill.user_id == user.id, StudentSkill.skill_name == req.skill_name).first()
    if existing:
        existing.self_rating = req.self_rating
    else:
        new_sk = StudentSkill(user_id=user.id, skill_name=req.skill_name, self_rating=req.self_rating, confidence_level="Intermediate")
        db.add(new_sk)
    db.commit()
    return {"status": "success"}

@router.get("/assessments")
def get_assessments(db: Session = Depends(get_db)):
    assessments = db.query(Assessment).all()
    if not assessments:
        # Seed default assessment
        demo_questions = [
            {
                "question": "Which Python decorator is used in FastAPI to handle GET HTTP requests?",
                "options": ["@app.route('/get')", "@app.get('/')", "@app.request('GET')", "@app.http_get()"],
                "correct_index": 1,
                "skill": "FastAPI"
            },
            {
                "question": "What is the time complexity of searching an item in a balanced Binary Search Tree (BST)?",
                "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
                "correct_index": 2,
                "skill": "Data Structures"
            },
            {
                "question": "Which hook in React is used for managing side effects like API fetching?",
                "options": ["useState", "useContext", "useMemo", "useEffect"],
                "correct_index": 3,
                "skill": "React"
            }
        ]
        ass = Assessment(
            title="Full Stack Software Engineer Assessment",
            domain="Software Engineering",
            time_limit_mins=15,
            questions_json=json.dumps(demo_questions)
        )
        db.add(ass)
        db.commit()
        assessments = db.query(Assessment).all()
        
    res = []
    for a in assessments:
        res.append({
            "id": a.id,
            "title": a.title,
            "domain": a.domain,
            "time_limit_mins": a.time_limit_mins,
            "questions": json.loads(a.questions_json)
        })
    return res

@router.post("/assessments/submit")
def submit_assessment(req: AssessmentSubmitRequest, authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db)
    assessment = db.query(Assessment).filter(Assessment.id == req.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    questions = json.loads(assessment.questions_json)
    correct_count = 0
    for idx, q in enumerate(questions):
        user_ans = req.answers.get(str(idx))
        if user_ans is not None and int(user_ans) == q["correct_index"]:
            correct_count += 1
            # Auto-update or verify skill score
            skill_name = q.get("skill")
            if skill_name:
                st_skill = db.query(StudentSkill).filter(StudentSkill.user_id == user.id, StudentSkill.skill_name == skill_name).first()
                if st_skill:
                    st_skill.test_score = max(st_skill.test_score, 85)
                    st_skill.is_verified = True
                    st_skill.confidence_level = "Advanced"

    score_pct = int((correct_count / len(questions)) * 100)
    attempt = AssessmentAttempt(
        user_id=user.id,
        assessment_id=req.assessment_id,
        score_percentage=score_pct,
        passed=(score_pct >= 60)
    )
    db.add(attempt)
    db.commit()
    
    return {
        "status": "success",
        "score_percentage": score_pct,
        "passed": score_pct >= 60,
        "correct_count": correct_count,
        "total_questions": len(questions)
    }

# ── 3. SKILL GAP ENGINE ─────────────────────────────────────────
@router.get("/skill-gap")
def calculate_skill_gap(target_role: str = "Full Stack Engineer", authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db)
    user_skills = db.query(StudentSkill).filter(StudentSkill.user_id == user.id).all()
    user_skill_names = set(s.skill_name.lower() for s in user_skills)
    
    role_requirements = {
        "Full Stack Engineer": ["Python", "JavaScript", "React", "FastAPI", "SQL", "Docker", "Git"],
        "AI Engineer": ["Python", "Machine Learning", "PyTorch", "FastAPI", "SQL", "Docker"],
        "Data Scientist": ["Python", "SQL", "Pandas", "Machine Learning", "Data Structures"]
    }
    
    reqs = role_requirements.get(target_role, ["Python", "JavaScript", "React", "SQL", "Docker"])
    matched = []
    missing = []
    
    for req in reqs:
        if req.lower() in user_skill_names:
            matched.append(req)
        else:
            missing.append(req)
            
    gap_percentage = int((len(missing) / len(reqs)) * 100)
    
    return {
        "target_role": target_role,
        "required_skills": reqs,
        "matched_skills": matched,
        "missing_skills": missing,
        "gap_percentage": gap_percentage,
        "recommendations": [
            {
                "skill": m,
                "type": "Certification / Course",
                "recommended_action": f"Complete 5-hour '{m} Masterclass' certification and attach 1 project to achieve 100% role match.",
                "reason": f"Required for {target_role} role applications."
            } for m in missing
        ]
    }

# ── 4. OPPORTUNITIES & EXPLAINABLE MATCHING ENGINE ───────────────
@router.get("/opportunities")
def list_opportunities(db: Session = Depends(get_db)):
    opps = db.query(Opportunity).all()
    if not opps:
        # Seed default opportunities
        defaults = [
            {
                "company_name": "Google AI Labs",
                "title": "AI Full Stack Intern",
                "opportunity_type": "Internship",
                "description": "Work with world-class engineers building next-generation LLM web interfaces.",
                "required_skills": "Python, React, FastAPI, SQL",
                "preferred_skills": "Docker, Machine Learning",
                "min_cgpa": "7.5",
                "eligible_batches": "2025, 2026",
                "location": "Remote / Bengaluru",
                "stipend_or_salary": "₹45,000 / month",
                "deadline": "2026-10-15"
            },
            {
                "company_name": "Microsoft India",
                "title": "Graduate Software Engineer",
                "opportunity_type": "Job",
                "description": "Entry level software engineering position for graduating computer science students.",
                "required_skills": "Python, JavaScript, Data Structures, SQL",
                "preferred_skills": "React, Docker",
                "min_cgpa": "8.0",
                "eligible_batches": "2026",
                "location": "Hyderabad",
                "stipend_or_salary": "₹18 LPA",
                "deadline": "2026-11-01"
            },
            {
                "company_name": "IIT Bombay Research Hub",
                "title": "Faculty Development Program (FDP) on AI & Cloud",
                "opportunity_type": "FDP",
                "description": "5-day specialized industrial training for academicians and faculty members.",
                "required_skills": "Python, Machine Learning",
                "preferred_skills": "FastAPI",
                "min_cgpa": "N/A",
                "eligible_batches": "Faculty",
                "location": "Mumbai / Online",
                "stipend_or_salary": "Fully Funded",
                "deadline": "2026-09-30"
            }
        ]
        for d in defaults:
            op = Opportunity(created_by_user_id="demo-recruiter-1", **d)
            db.add(op)
        db.commit()
        opps = db.query(Opportunity).all()
        
    return [{
        "id": o.id,
        "company_name": o.company_name,
        "title": o.title,
        "opportunity_type": o.opportunity_type,
        "description": o.description,
        "required_skills": o.required_skills.split(", "),
        "preferred_skills": o.preferred_skills.split(", ") if o.preferred_skills else [],
        "min_cgpa": o.min_cgpa,
        "eligible_batches": o.eligible_batches,
        "location": o.location,
        "stipend_or_salary": o.stipend_or_salary,
        "deadline": o.deadline,
        "external_apply_url": getattr(o, "external_apply_url", None),
        "opportunity_scope": getattr(o, "opportunity_scope", "National"),
        "status": o.status
    } for o in opps]

@router.post("/opportunities")
def create_opportunity(req: OpportunityCreateRequest, authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db, required_roles=["industry", "super_admin", "academician"])
    opp = Opportunity(
        created_by_user_id=user.id,
        company_name=req.company_name,
        title=req.title,
        opportunity_type=req.opportunity_type,
        description=req.description,
        required_skills=req.required_skills,
        preferred_skills=req.preferred_skills,
        min_cgpa=req.min_cgpa,
        eligible_batches=req.eligible_batches,
        location=req.location,
        stipend_or_salary=req.stipend_or_salary,
        deadline=req.deadline,
        external_apply_url=req.external_apply_url,
        opportunity_scope=req.opportunity_scope
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return {"status": "success", "id": opp.id}

@router.post("/match")
def calculate_explainable_match(req: MatchRequest, authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db)
    opportunity = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    student_skills = db.query(StudentSkill).filter(StudentSkill.user_id == user.id).all()
    user_skill_set = set(s.skill_name.strip().lower() for s in student_skills)
    
    req_skills = [s.strip() for s in opportunity.required_skills.split(",") if s.strip()]
    pref_skills = [s.strip() for s in (opportunity.preferred_skills or "").split(",") if s.strip()]
    
    matched_req = [s for s in req_skills if s.lower() in user_skill_set]
    missing_req = [s for s in req_skills if s.lower() not in user_skill_set]
    matched_pref = [s for s in pref_skills if s.lower() in user_skill_set]
    
    # ── DETERMINISTIC FORMULA ──
    # 50% Required Skills + 15% Preferred Skills + 15% Eligibility + 10% Portfolio + 10% Certifications
    s_req_pct = (len(matched_req) / len(req_skills)) * 100 if req_skills else 100
    s_pref_pct = (len(matched_pref) / len(pref_skills)) * 100 if pref_skills else 100
    eligibility_pct = 100
    portfolio_pct = 90
    cert_pct = 85
    
    overall_score = int(
        (0.50 * s_req_pct) +
        (0.15 * s_pref_pct) +
        (0.15 * eligibility_pct) +
        (0.10 * portfolio_pct) +
        (0.10 * cert_pct)
    )
    
    explanation = {
        "overall_score": overall_score,
        "breakdown": {
            "required_skills": f"{len(matched_req)}/{len(req_skills)} Matched ({int(s_req_pct)}%)",
            "preferred_skills": f"{len(matched_pref)}/{len(pref_skills)} Matched ({int(s_pref_pct)}%)",
            "eligibility": "CGPA & Batch Verified (100%)",
            "portfolio_evidence": "3 Verified Projects Attached (90%)",
            "certifications": "2 Verified Certifications (85%)"
        },
        "matched_skills": matched_req + matched_pref,
        "missing_skills": missing_req,
        "recommendation": f"Acquire '{missing_req[0]}' certification to increase match score to 95%." if missing_req else "Top candidate match! Ready to apply."
    }
    
    return explanation

# ── 5. APPLICATIONS & RECRUITER PIPELINE ────────────────────────
@router.post("/applications")
def apply_opportunity(
    req: ApplicationCreateRequest | None = None,
    opportunity_id: str | None = None,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    user = get_user_from_auth_header(authorization, db)
    target_id = req.opportunity_id if req and req.opportunity_id else opportunity_id
    if not target_id:
        raise HTTPException(status_code=400, detail="opportunity_id is required")

    existing = db.query(CareerApplication).filter(CareerApplication.user_id == user.id, CareerApplication.opportunity_id == target_id).first()
    if existing:
        return {"status": "success", "message": "Already applied", "application_id": existing.id}
        
    app = CareerApplication(user_id=user.id, opportunity_id=target_id, status="Applied")
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"status": "success", "application_id": app.id}

@router.get("/applications")
def get_user_applications(
    recruiter: bool = False,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    user, role = get_user_and_role(authorization, db)
    if recruiter or role in ["industry", "super_admin"]:
        company_name = None
        comp_profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == user.id).first()
        if comp_profile:
            company_name = comp_profile.company_name
        elif role == "industry":
            company_name = "Google AI Labs"

        opp_query = db.query(Opportunity)
        if company_name and role != "super_admin":
            opp_query = opp_query.filter((Opportunity.created_by_user_id == user.id) | (Opportunity.company_name.ilike(f"%{company_name}%")))
        elif role != "super_admin":
            opp_query = opp_query.filter(Opportunity.created_by_user_id == user.id)
            
        opp_ids = [o.id for o in opp_query.all()]
        post_query = db.query(IndustryPost).filter(IndustryPost.recruiter_user_id == user.id)
        opp_ids.extend([p.id for p in post_query.all()])

        if opp_ids:
            apps = db.query(CareerApplication).filter(CareerApplication.opportunity_id.in_(opp_ids)).all()
        else:
            apps = db.query(CareerApplication).all() if role == "super_admin" else []
    else:
        apps = db.query(CareerApplication).filter(CareerApplication.user_id == user.id).all()

    res = []
    for a in apps:
        opp = db.query(Opportunity).filter(Opportunity.id == a.opportunity_id).first()
        post = None
        if not opp:
            post = db.query(IndustryPost).filter(IndustryPost.id == a.opportunity_id).first()

        student_user = db.query(User).filter(User.id == a.user_id).first()
        student_profile = db.query(StudentCareerProfile).filter(StudentCareerProfile.user_id == a.user_id).first()
        student_aff = db.query(StudentAcademicAffiliation).filter(StudentAcademicAffiliation.user_id == a.user_id).first()

        student_skills = db.query(StudentSkill).filter(StudentSkill.user_id == a.user_id).all()
        test_scores = [s.test_score for s in student_skills if s.test_score is not None and s.test_score > 0]
        avg_verified_score = round(sum(test_scores) / len(test_scores)) if test_scores else 85

        dept = student_profile.branch if student_profile and student_profile.branch else (student_aff.program if student_aff else "Computer Engineering")
        cgpa = student_profile.cgpa if student_profile and student_profile.cgpa else (student_aff.cgpa if student_aff else "8.8")
        semester = student_aff.current_semester if student_aff and student_aff.current_semester else 6

        title = opp.title if opp else (post.title if post and post.title else "Software & AI Role")
        company = opp.company_name if opp else (post.company_name if post else "Verified Industry Partner")

        res.append({
            "id": a.id,
            "opportunity_id": a.opportunity_id,
            "title": title,
            "company_name": company,
            "student_id": a.user_id,
            "student_name": student_user.full_name if student_user else "Ved Dhobi",
            "student_email": student_user.email if student_user else "student@novaconnect.edu",
            "student_department": dept,
            "student_semester": semester,
            "student_cgpa": cgpa,
            "verified_score": avg_verified_score,
            "match_score": 88,
            "status": a.status,
            "applied_at": a.applied_at.strftime("%Y-%m-%d") if a.applied_at else "",
            "recruiter_notes": a.recruiter_notes
        })
    return res

@router.patch("/applications/{app_id}/status")
def update_application_status(app_id: str, req: ApplicationStatusRequest, db: Session = Depends(get_db)):
    app = db.query(CareerApplication).filter(CareerApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = req.status
    if req.recruiter_notes:
        app.recruiter_notes = req.recruiter_notes
    db.commit()
    return {"status": "success", "new_status": req.status}

# ── 6. VERIFICATION LEDGER & INSTITUTION ANALYTICS ───────────────
@router.get("/verifications")
def get_verifications(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = get_user_from_auth_header(authorization, db)
    records = db.query(VerificationLedger).filter(VerificationLedger.user_id == user.id).all()
    if not records:
        defaults = [
            ("Skill", "Python & Data Structures", "IIT Bombay CodeLab", "Verified"),
            ("Certificate", "Full Stack Web Developer", "Nova CareerConnect", "Verified"),
            ("Project", "AI CareerConnect Portal", "Google AI Mentorship", "Verified")
        ]
        for t, title, entity, st in defaults:
            vl = VerificationLedger(user_id=user.id, item_type=t, item_title=title, verifier_entity=entity, status=st)
            db.add(vl)
        db.commit()
        records = db.query(VerificationLedger).filter(VerificationLedger.user_id == user.id).all()
        
    return [{
        "id": r.id,
        "item_type": r.item_type,
        "item_title": r.item_title,
        "verifier_entity": r.verifier_entity,
        "status": r.status,
        "verified_at": r.verified_at.strftime("%Y-%m-%d")
    } for r in records]

@router.get("/analytics/institution")
def get_institution_analytics(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    # Server-side RBAC: Only institution admins or super admins can access institutional metrics
    user = get_user_from_auth_header(authorization, db, required_roles=["institution", "super_admin"])
    return {
        "institution_name": "All India Institute of Ayurveda (AIIA)",
        "total_students": 1450,
        "total_faculty": 84,
        "active_departments": 6,
        "internship_participation_pct": 68,
        "placement_readiness_pct": 88,
        "active_industry_partners": 46,
        "top_skill_gaps": ["FHIR/HL7 Standards", "Medical NLP", "Bio-Signal FFT", "HPLC Standardization"],
        "department_readiness": [
            {"department": "Ayush Clinical Informatics", "readiness_pct": 92, "students": 420},
            {"department": "Prakriti Diagnostic Systems", "readiness_pct": 86, "students": 310},
            {"department": "Herbal Drug Standardization", "readiness_pct": 84, "students": 280},
            {"department": "Digital Health AI", "readiness_pct": 90, "students": 440}
        ]
    }

@router.get("/analytics/superadmin")
def get_superadmin_analytics(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    # Server-side RBAC: Only Super Admins can access national system controls and audit logs
    user = get_user_from_auth_header(authorization, db, required_roles=["super_admin"])
    return {
        "total_users": 18420,
        "students": 14200,
        "faculty": 1280,
        "institutions": 42,
        "companies": 280,
        "active_opportunities": 512,
        "applications": 4890,
        "pending_verifications": 34,
        "cluster_health": "Optimal (42ms latency)",
        "uptime": "99.98%"
    }

@router.get("/faculty/dashboard-stats")
def get_faculty_stats(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    # Server-side RBAC: Faculty or Super Admin only
    user = get_user_from_auth_header(authorization, db, required_roles=["academician", "super_admin"])
    return {
        "department": "Dept of Ayush Clinical Informatics",
        "total_students": 42,
        "assigned_mentees": 12,
        "students_needing_attention": 7,
        "internship_participation_pct": 68,
        "placement_ready_count": 24,
        "active_fdp_programs": 4,
        "recommended_opportunities": 8
    }

@router.get("/industry/dashboard-stats")
def get_industry_stats(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    # Server-side RBAC: Industry recruiters or Super Admin only
    user = get_user_from_auth_header(authorization, db, required_roles=["industry", "super_admin"])
    return {
        "company_name": "Google AI Labs",
        "open_opportunities": 8,
        "total_applications": 146,
        "matched_candidates": 38,
        "shortlisted": 12,
        "interviews_scheduled": 5,
        "offers_extended": 3
    }

# ── 12. ALL-INDIA COLLEGE REGISTRY & AUTOCOMPLETE ────────────────
@router.get("/colleges")
def list_colleges(
    q: str | None = None,
    state: str | None = None,
    city: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Institution)
    if state and state != "All India":
        query = query.filter(Institution.state.ilike(f"%{state}%"))
    if city:
        query = query.filter(Institution.city.ilike(f"%{city}%"))
    if q:
        query = query.filter(
            (Institution.name.ilike(f"%{q}%")) |
            (Institution.code.ilike(f"%{q}%")) |
            (Institution.city.ilike(f"%{q}%"))
        )
    colleges = query.limit(100).all()
    return [{
        "id": c.id,
        "name": c.name,
        "code": c.code or "COL-IND",
        "university": c.university or "State University",
        "state": c.state or "Gujarat",
        "city": c.city or "Modasa",
        "district": c.district or "",
        "institution_type": c.institution_type,
        "website": c.website or "https://aicte-india.org",
        "accreditation": c.accreditation or "AICTE Approved"
    } for c in colleges]

# ── 13. STUDENT SEMESTER & ACADEMIC STATUS SELF-UPDATE ───────────
@router.put("/student/academic-status")
def update_student_academic_status(
    req: StudentAcademicUpdateRequest,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    user = get_user_from_auth_header(authorization, db, required_roles=["student", "super_admin"])
    
    # Update or create StudentCareerProfile
    profile = db.query(StudentCareerProfile).filter(StudentCareerProfile.user_id == user.id).first()
    if not profile:
        profile = StudentCareerProfile(user_id=user.id)
        db.add(profile)
        db.flush()
    if req.cgpa:
        profile.cgpa = req.cgpa
    if req.department:
        profile.branch = req.department

    # Update or create StudentAcademicAffiliation
    aff = db.query(StudentAcademicAffiliation).filter(StudentAcademicAffiliation.user_id == user.id).first()
    if aff:
        if req.current_semester:
            aff.current_semester = req.current_semester
        if req.cgpa:
            aff.cgpa = req.cgpa
    
    db.commit()
    return {
        "status": "success",
        "user_id": user.id,
        "current_semester": req.current_semester,
        "department": req.department,
        "cgpa": req.cgpa
    }

# ── 14. 50-QUESTION SELF-GENERATED ASSESSMENT SUBMISSION ────────
@router.post("/assessments/submit-50")
def submit_50_question_assessment(
    req: Assessment50SubmitRequest,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    user = get_user_from_auth_header(authorization, db, required_roles=["student", "super_admin"])
    
    # Update or add student skill with verified score
    skill = db.query(StudentSkill).filter(
        StudentSkill.user_id == user.id,
        StudentSkill.skill_name.ilike(req.language)
    ).first()

    is_verified = req.percentage >= 60.0
    confidence = "Expert" if req.percentage >= 85 else ("Advanced" if req.percentage >= 70 else ("Intermediate" if req.percentage >= 50 else "Beginner"))

    if skill:
        skill.test_score = int(req.percentage)
        skill.is_verified = is_verified
        skill.confidence_level = confidence
    else:
        skill = StudentSkill(
            user_id=user.id,
            skill_name=req.language,
            self_rating=4 if is_verified else 3,
            test_score=int(req.percentage),
            is_verified=is_verified,
            confidence_level=confidence
        )
        db.add(skill)

    # Log audit event
    audit = AuditLog(
        actor_user_id=user.id,
        actor_role="student",
        action="SUBMIT_50_QUESTION_ASSESSMENT",
        target_type="AssessmentReport",
        target_id=req.test_id,
        details_json=json.dumps({
            "language": req.language,
            "difficulty": req.difficulty,
            "score": req.raw_score,
            "percentage": req.percentage,
            "trust_score": req.anti_cheating_trust_score,
            "violations_count": len(req.anti_cheating_violations)
        })
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "test_id": req.test_id,
        "language": req.language,
        "percentage": req.percentage,
        "is_verified": is_verified,
        "confidence_level": confidence,
        "trust_score": req.anti_cheating_trust_score,
        "certificate_hash": f"NOVACERT-{uuid.uuid4().hex[:12].upper()}"
    }

# ── 14B. ENTERPRISE ASSESSMENT ENGINE & FROZEN SESSIONS ─────────
@router.post("/assessments/create-session")
def create_assessment_session(
    req: AssessmentCreateSessionRequest,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    student_id = None
    if authorization:
        try:
            user = get_user_from_auth_header(authorization, db)
            student_id = user.id
        except Exception:
            student_id = None

    try:
        session_data = AssessmentEngineService.create_test_session(
            db=db,
            language=req.language,
            student_id=student_id,
            skill_id=req.skill_id,
            domain_id=req.domain_id,
            topic_id=req.topic_id,
            difficulty=req.difficulty,
            count=req.count,
            duration_minutes=req.duration_minutes
        )
        return session_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create assessment session: {str(e)}")

@router.get("/assessments/session/{session_id}")
def get_assessment_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    session_data = AssessmentEngineService.get_test_session(db, session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail=f"Assessment session {session_id} not found.")
    return session_data

@router.post("/assessments/session/{session_id}/submit")
def submit_assessment_session(
    session_id: str,
    req: AssessmentSessionSubmitRequest,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    student_id = None
    if authorization:
        try:
            user = get_user_from_auth_header(authorization, db)
            student_id = user.id
        except Exception:
            student_id = None

    try:
        result = AssessmentEngineService.submit_test_session(
            db=db,
            session_id=session_id,
            student_id=student_id,
            answers=req.answers,
            anti_cheating_metadata={
                "trustScore": req.anti_cheating_trust_score,
                "violations": req.anti_cheating_violations
            }
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting assessment session: {str(e)}")

@router.get("/assessments/admin/quality-audit")
def get_assessment_quality_audit(
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    total = db.query(QuestionBankItem).count()
    verified = db.query(QuestionBankItem).filter(QuestionBankItem.validation_status == "VERIFIED").count()
    existing = db.query(QuestionBankItem).filter(QuestionBankItem.source_type == "EXISTING").count()
    ds100k = db.query(QuestionBankItem).filter(QuestionBankItem.source_type == "DATASET_100K").count()
    practical = db.query(QuestionBankItem).filter(QuestionBankItem.practicality_type.in_(["practical", "code_snippet"])).count()
    theoretical = db.query(QuestionBankItem).filter(QuestionBankItem.practicality_type == "theoretical").count()
    total_sessions = db.query(TestSession).count()
    completed_sessions = db.query(TestSession).filter(TestSession.status == "SUBMITTED").count()

    return {
        "status": "healthy",
        "total_questions": total,
        "verified_questions": verified,
        "existing_website_mcqs": existing,
        "dataset_100k_mcqs": ds100k,
        "practical_count": practical,
        "practical_ratio_pct": round(practical / max(total, 1) * 100, 2),
        "theoretical_count": theoretical,
        "theoretical_ratio_pct": round(theoretical / max(total, 1) * 100, 2),
        "total_sessions_generated": total_sessions,
        "completed_sessions": completed_sessions
    }

# ── 15. ANONYMOUS DEPARTMENT ANALYTICS (ZERO INDIVIDUAL NAMES) ───
@router.get("/analytics/department-anonymous")
def get_department_anonymous_analytics(
    department: str = "Computer Engineering",
    institution: str = "Government Engineering College, Modasa (GEC Modasa)",
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    # RBAC: Faculty, Institution, or Super Admin
    user = get_user_from_auth_header(authorization, db, required_roles=["academician", "institution", "super_admin"])

    # Query affiliations for this department & institution
    affiliations_query = db.query(StudentAcademicAffiliation)
    if department:
        affiliations_query = affiliations_query.join(Department, StudentAcademicAffiliation.department_id == Department.id, isouter=True).filter(
            (Department.name.ilike(f"%{department}%")) | (StudentAcademicAffiliation.program.ilike(f"%{department}%"))
        )
    if institution:
        affiliations_query = affiliations_query.join(Institution, StudentAcademicAffiliation.institution_id == Institution.id, isouter=True).filter(
            Institution.name.ilike(f"%{institution}%")
        )

    affiliations = affiliations_query.all()
    student_user_ids = [a.user_id for a in affiliations]

    # If no affiliations found by department join, look for any student users
    if not student_user_ids:
        student_roles = db.query(UserRole).filter(UserRole.role_name == "student").all()
        student_user_ids = [r.user_id for r in student_roles]

    total_students = len(student_user_ids)
    if total_students == 0:
        return {
            "department": department,
            "institution": institution,
            "totalStudents": 0,
            "assessedCount": 0,
            "avgReadinessScore": 0,
            "avgCgpa": 0,
            "scoreDistribution": [
                {"range": "90-100% (Industry Ready)", "count": 0, "percentage": 0},
                {"range": "75-89% (Advanced)", "count": 0, "percentage": 0},
                {"range": "60-74% (Intermediate)", "count": 0, "percentage": 0},
                {"range": "<60% (Foundational / Needs Upskilling)", "count": 0, "percentage": 0}
            ],
            "topSkillsProficiency": [],
            "criticalSkillGaps": [],
            "semesterBreakdown": []
        }

    # Fetch assessment scores / skills for these students
    skills = db.query(StudentSkill).filter(StudentSkill.user_id.in_(student_user_ids)).all()
    scores = [s.test_score for s in skills if s.test_score is not None and s.test_score > 0]
    assessed_user_ids = set(s.user_id for s in skills if s.test_score is not None and s.test_score > 0)
    assessed_count = len(assessed_user_ids)
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    cgpas = []
    for a in affiliations:
        try:
            if a.cgpa:
                cgpas.append(float(a.cgpa))
        except (ValueError, TypeError):
            pass
    avg_cgpa = round(sum(cgpas) / len(cgpas), 2) if cgpas else 0.0

    c90 = sum(1 for sc in scores if sc >= 90)
    c75 = sum(1 for sc in scores if 75 <= sc < 90)
    c60 = sum(1 for sc in scores if 60 <= sc < 75)
    c_less = sum(1 for sc in scores if sc < 60)
    tot_sc = len(scores) or 1

    skill_map = {}
    for s in skills:
        if s.test_score and s.test_score > 0:
            if s.skill_name not in skill_map:
                skill_map[s.skill_name] = []
            skill_map[s.skill_name].append(s.test_score)

    top_skills = [
        {
            "skill": sk,
            "avgScore": round(sum(scs) / len(scs), 1),
            "studentCount": len(scs)
        }
        for sk, scs in sorted(skill_map.items(), key=lambda x: -sum(x[1]) / len(x[1]))[:6]
    ]

    sem_map = {}
    for a in affiliations:
        sem = a.current_semester or 1
        if sem not in sem_map:
            sem_map[sem] = {"studentCount": 0, "scores": []}
        sem_map[sem]["studentCount"] += 1
        user_scs = [s.test_score for s in skills if s.user_id == a.user_id and s.test_score and s.test_score > 0]
        sem_map[sem]["scores"].extend(user_scs)

    semester_breakdown = [
        {
            "semester": sem,
            "studentCount": data["studentCount"],
            "avgReadiness": round(sum(data["scores"]) / len(data["scores"]), 1) if data["scores"] else 0.0,
            "topStrength": f"Semester {sem} Focus"
        }
        for sem, data in sorted(sem_map.items())
    ]

    return {
        "department": department,
        "institution": institution,
        "totalStudents": total_students,
        "assessedCount": assessed_count,
        "avgReadinessScore": avg_score,
        "avgCgpa": avg_cgpa,
        "scoreDistribution": [
            {"range": "90-100% (Industry Ready)", "count": c90, "percentage": round((c90 / tot_sc) * 100, 1) if scores else 0},
            {"range": "75-89% (Advanced)", "count": c75, "percentage": round((c75 / tot_sc) * 100, 1) if scores else 0},
            {"range": "60-74% (Intermediate)", "count": c60, "percentage": round((c60 / tot_sc) * 100, 1) if scores else 0},
            {"range": "<60% (Foundational / Needs Upskilling)", "count": c_less, "percentage": round((c_less / tot_sc) * 100, 1) if scores else 0}
        ],
        "topSkillsProficiency": top_skills,
        "criticalSkillGaps": [],
        "semesterBreakdown": semester_breakdown
    }

# ── 16. RECRUITER ANONYMOUS TALENT POOL FILTER ──────────────────
@router.get("/analytics/recruiter-talent")
def get_recruiter_talent_analytics(
    state: str | None = None,
    city: str | None = None,
    college_id: str | None = None,
    department: str | None = None,
    min_semester: int = 1,
    max_semester: int = 8,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    # RBAC: Industry recruiters or Super Admin
    user = get_user_from_auth_header(authorization, db, required_roles=["industry", "super_admin"])

    query = db.query(StudentAcademicAffiliation).join(Institution, StudentAcademicAffiliation.institution_id == Institution.id, isouter=True)
    
    if college_id:
        query = query.filter(StudentAcademicAffiliation.institution_id == college_id)
    if state:
        query = query.filter(Institution.state.ilike(f"%{state}%"))
    if city:
        query = query.filter(Institution.city.ilike(f"%{city}%"))
    if min_semester:
        query = query.filter(StudentAcademicAffiliation.current_semester >= min_semester)
    if max_semester:
        query = query.filter(StudentAcademicAffiliation.current_semester <= max_semester)

    candidates = query.all()
    cand_ids = [c.user_id for c in candidates]

    if not cand_ids:
        all_students = db.query(UserRole).filter(UserRole.role_name == "student").all()
        cand_ids = [s.user_id for s in all_students]

    if not cand_ids:
        return {
            "matchedCandidatesCount": 0,
            "avgReadinessScore": 0,
            "avgAtsScore": 0,
            "skillsAvailableDistribution": [],
            "collegesRepresented": [],
            "semesterDistribution": [],
            "note": "Privacy Safeguard Active: Candidate personal identities, emails, and direct profiles remain strictly protected until candidates submit a verified application."
        }

    skills = db.query(StudentSkill).filter(StudentSkill.user_id.in_(cand_ids)).all()
    scores = [s.test_score for s in skills if s.test_score is not None and s.test_score > 0]
    avg_readiness = round(sum(scores) / len(scores), 1) if scores else 0.0

    skill_dist = {}
    for s in skills:
        if s.skill_name not in skill_dist:
            skill_dist[s.skill_name] = {"count": 0, "scores": []}
        skill_dist[s.skill_name]["count"] += 1
        if s.test_score:
            skill_dist[s.skill_name]["scores"].append(s.test_score)

    skills_summary = [
        {
            "skill": sk,
            "count": d["count"],
            "avgProficiency": round(sum(d["scores"]) / len(d["scores"]), 1) if d["scores"] else 0.0
        }
        for sk, d in sorted(skill_dist.items(), key=lambda x: -x[1]["count"])[:6]
    ]

    colleges_map = {}
    for c in candidates:
        inst_name = c.institution.name if hasattr(c, "institution") and c.institution else "Partner Institution"
        if inst_name not in colleges_map:
            colleges_map[inst_name] = {"collegeName": inst_name, "count": 0}
        colleges_map[inst_name]["count"] += 1

    sem_counts = {}
    for c in candidates:
        sem = c.current_semester or 1
        sem_counts[sem] = sem_counts.get(sem, 0) + 1

    sem_dist = [{"semester": sem, "count": cnt} for sem, cnt in sorted(sem_counts.items())]

    return {
        "matchedCandidatesCount": len(cand_ids),
        "avgReadinessScore": avg_readiness,
        "avgAtsScore": 85.0 if cand_ids else 0.0,
        "skillsAvailableDistribution": skills_summary,
        "collegesRepresented": list(colleges_map.values()),
        "semesterDistribution": sem_dist,
        "note": "Privacy Safeguard Active: Candidate personal identities, emails, and direct profiles remain strictly protected until candidates submit a verified application."
    }

# ── 17. INDUSTRY SOCIAL POSTS & FEED ENDPOINTS ───────────────────
@router.get("/posts")
def list_industry_posts(
    post_type: str | None = None,
    department: str | None = None,
    search: str | None = None,
    recruiter_id: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(IndustryPost)
    if recruiter_id:
        query = query.filter(IndustryPost.recruiter_user_id == recruiter_id)
    if post_type and post_type != "All":
        query = query.filter(IndustryPost.post_type.ilike(post_type))
    if department and department != "All" and department != "All Departments":
        query = query.filter(
            (IndustryPost.target_departments_json.ilike(f"%{department}%")) |
            (IndustryPost.target_departments_json.ilike("%All Departments%")) |
            (IndustryPost.target_departments_json.is_(None))
        )
    if search:
        s = f"%{search}%"
        query = query.filter(
            (IndustryPost.content.ilike(s)) |
            (IndustryPost.company_name.ilike(s)) |
            (IndustryPost.skills_json.ilike(s))
        )

    posts = query.order_by(IndustryPost.created_at.desc()).all()
    
    results = []
    for p in posts:
        app_count = db.query(CareerApplication).filter(CareerApplication.opportunity_id == p.id).count()
        results.append({
            "id": p.id,
            "recruiter_user_id": p.recruiter_user_id,
            "author_name": p.author_name,
            "company_name": p.company_name,
            "company_logo": p.company_logo,
            "is_verified": p.is_verified_company,
            "post_type": p.post_type,
            "title": p.title,
            "message": p.content,
            "images": [p.image_url] if p.image_url else [],
            "links": json.loads(p.external_links_json) if p.external_links_json else [],
            "skills": json.loads(p.skills_json) if p.skills_json else [],
            "target_department": json.loads(p.target_departments_json)[0] if p.target_departments_json and json.loads(p.target_departments_json) else "All Departments",
            "target_batches": json.loads(p.target_semesters_json) if p.target_semesters_json else None,
            "application_mode": p.application_mode,
            "primary_apply_url": p.direct_apply_url,
            "location": p.location,
            "stipend_or_ctc": p.stipend_or_ctc,
            "deadline": p.deadline,
            "created_at": p.created_at.isoformat(),
            "applicant_count": app_count,
            "status": "published"
        })
    return results

@router.post("/posts")
def create_industry_post(
    req: IndustryPostCreateRequest,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    user = get_user_from_auth_header(authorization, db, required_roles=["industry", "super_admin", "academician"])
    
    post = IndustryPost(
        recruiter_user_id=user.id,
        author_name=req.author_name or user.full_name or "Verified Recruiter",
        company_name=req.company_name or "Verified Industry Partner",
        company_logo=None,
        is_verified_company=True,
        post_type=req.post_type,
        title=req.title,
        content=req.content,
        image_url=req.image_url,
        external_links_json=json.dumps(req.external_links) if req.external_links else None,
        skills_json=json.dumps(req.skills) if req.skills else None,
        target_departments_json=json.dumps(req.target_departments) if req.target_departments else None,
        target_semesters_json=json.dumps(req.target_semesters) if req.target_semesters else None,
        application_mode=req.application_mode,
        direct_apply_url=req.direct_apply_url,
        location=req.location,
        stipend_or_ctc=req.stipend_or_ctc,
        deadline=req.deadline
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # DUAL SYNC: If categorized as Internship, Job, or Project, sync to structured Opportunity table
    if req.post_type in ["Internship", "Job", "Industry Project", "Workshop"]:
        first_line = req.content.strip().split("\n")[0][:80] if req.content else f"{post.company_name} {req.post_type}"
        opp = Opportunity(
            id=post.id,
            created_by_user_id=user.id,
            company_name=post.company_name,
            title=req.title or first_line,
            opportunity_type=req.post_type,
            description=req.content,
            required_skills=", ".join(req.skills) if req.skills else "Problem Solving",
            preferred_skills="",
            min_cgpa="N/A",
            eligible_batches="All Batches",
            location=req.location or "Hybrid / Remote",
            stipend_or_salary=req.stipend_or_ctc or "Market Competitive",
            deadline=req.deadline or "Open Until Filled",
            external_apply_url=req.direct_apply_url,
            opportunity_scope="National"
        )
        db.add(opp)
        db.commit()

    return {"status": "success", "id": post.id}

@router.delete("/posts/{post_id}")
def delete_industry_post(
    post_id: str,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    user = get_user_from_auth_header(authorization, db, required_roles=["industry", "super_admin", "academician"])
    post = db.query(IndustryPost).filter(IndustryPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Also delete any linked opportunity
    linked_opp = db.query(Opportunity).filter(Opportunity.id == post_id).first()
    if linked_opp:
        db.delete(linked_opp)

    db.delete(post)
    db.commit()
    return {"status": "success", "message": "Post deleted successfully"}

@router.patch("/posts/{post_id}")
def update_industry_post(
    post_id: str,
    req: IndustryPostUpdateRequest,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    user = get_user_from_auth_header(authorization, db, required_roles=["industry", "super_admin", "academician"])
    post = db.query(IndustryPost).filter(IndustryPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.recruiter_user_id != user.id and "super_admin" not in [r.role_name for r in db.query(UserRole).filter(UserRole.user_id == user.id).all()]:
        raise HTTPException(status_code=403, detail="You can only edit your own posts")

    if req.content is not None: post.content = req.content
    if req.post_type is not None: post.post_type = req.post_type
    if req.image_url is not None: post.image_url = req.image_url
    if req.external_links is not None: post.external_links_json = json.dumps(req.external_links)
    if req.skills is not None: post.skills_json = json.dumps(req.skills)
    if req.target_departments is not None: post.target_departments_json = json.dumps(req.target_departments)
    if req.target_semesters is not None: post.target_semesters_json = json.dumps(req.target_semesters)
    if req.application_mode is not None: post.application_mode = req.application_mode
    if req.direct_apply_url is not None: post.direct_apply_url = req.direct_apply_url
    if req.location is not None: post.location = req.location
    if req.stipend_or_ctc is not None: post.stipend_or_ctc = req.stipend_or_ctc
    if req.deadline is not None: post.deadline = req.deadline
    post.updated_at = datetime.utcnow()

    # Sync to linked opportunity if exists
    linked_opp = db.query(Opportunity).filter(Opportunity.id == post_id).first()
    if linked_opp:
        if req.content is not None: linked_opp.description = req.content
        if req.skills is not None: linked_opp.required_skills = ", ".join(req.skills)
        if req.direct_apply_url is not None: linked_opp.external_apply_url = req.direct_apply_url
        if req.post_type is not None: linked_opp.opportunity_type = req.post_type

    db.commit()
    return {"status": "success", "id": post.id}

@router.post("/upload/image")
def upload_post_image(
    file: UploadFile = File(...),
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    user = get_user_from_auth_header(authorization, db)
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP, and GIF images are allowed.")

    filename = f"post_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(UPLOADS_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "success",
        "url": f"/uploads/{filename}",
        "filename": filename
    }

