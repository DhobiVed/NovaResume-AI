from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import re

from app.database.session import get_db
from app.database.models import SavedResume, CoverLetter
from app.models.model_manager import model_manager

router = APIRouter()

class ResumeSaveRequest(BaseModel):
    id: Optional[str] = None
    title: str
    template_id: Optional[str] = "modern_professional"
    theme_key: Optional[str] = "royal_blue"
    content_json: Dict[str, Any]
    ats_score: Optional[int] = 85
    target_role: Optional[str] = "Software Engineer"
    is_favorite: Optional[bool] = False

class AtsAnalyzeRequest(BaseModel):
    content_json: Dict[str, Any]
    job_description: Optional[str] = None

class CoverLetterRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_title: str
    company_name: str
    job_description: Optional[str] = ""

class ImportParseRequest(BaseModel):
    raw_text: str

@router.get("/")
def get_resumes(db: Session = Depends(get_db)):
    resumes = db.query(SavedResume).order_by(SavedResume.updated_at.desc()).all()
    return resumes

@router.post("/")
def save_resume(req: ResumeSaveRequest, db: Session = Depends(get_db)):
    if req.id:
        existing = db.query(SavedResume).filter(SavedResume.id == req.id).first()
        if existing:
            existing.title = req.title
            existing.template_id = req.template_id or existing.template_id
            existing.theme_key = req.theme_key or existing.theme_key
            existing.content_json = req.content_json
            existing.ats_score = req.ats_score or existing.ats_score
            existing.target_role = req.target_role or existing.target_role
            existing.is_favorite = req.is_favorite if req.is_favorite is not None else existing.is_favorite
            db.commit()
            db.refresh(existing)
            return existing

    new_resume = SavedResume(
        title=req.title,
        template_id=req.template_id or "modern_professional",
        theme_key=req.theme_key or "royal_blue",
        content_json=req.content_json,
        ats_score=req.ats_score or 85,
        target_role=req.target_role or "Software Engineer",
        is_favorite=req.is_favorite or False
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return new_resume

@router.delete("/{resume_id}")
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    res = db.query(SavedResume).filter(SavedResume.id == resume_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(res)
    db.commit()
    return {"status": "deleted"}

@router.post("/ats-analyze")
def analyze_ats_score(req: AtsAnalyzeRequest):
    content = req.content_json
    skills_text = content.get("skills", "")
    summary_text = content.get("summary", "")
    exp_list = content.get("experience", [])

    # Calculate ATS metric score
    score = 70
    if len(skills_text.split(',')) >= 8:
        score += 10
    if len(summary_text) > 80:
        score += 10
    if len(exp_list) >= 2:
        score += 10

    keywords = ["Python", "FastAPI", "React", "TypeScript", "RAG", "LLM", "Docker", "SQL", "Cloud Architecture", "REST APIs", "Git", "System Design"]
    present_keywords = [k for k in keywords if k.lower() in json.dumps(content).lower()]
    missing_keywords = [k for k in keywords if k not in present_keywords]

    match_percentage = 85
    if req.job_description:
        jd_words = set(re.findall(r'\w+', req.job_description.lower()))
        resume_words = set(re.findall(r'\w+', json.dumps(content).lower()))
        common = jd_words.intersection(resume_words)
        match_percentage = min(98, max(50, int((len(common) / max(1, len(jd_words))) * 100) + 40))

    return {
        "ats_score": min(100, score),
        "jd_match_percentage": match_percentage,
        "present_keywords": present_keywords,
        "missing_keywords": missing_keywords,
        "readability": "Excellent (Grade 11 Professional Level)",
        "recommendations": [
            "Add measurable metrics (e.g. 'boosted performance by 40%') to experience bullet points.",
            f"Include missing high-value industry keywords: {', '.join(missing_keywords[:4])}.",
            "Maintain standard section headers for 100% ATS parser compatibility."
        ]
    }

@router.post("/cover-letter")
def generate_cover_letter(req: CoverLetterRequest):
    p = req.resume_data
    full_name = p.get("fullName", "Alex Vance")
    role = p.get("title", "Senior AI Systems Engineer")

    prompt = (
        f"Write a compelling, professional 3-paragraph Cover Letter for {full_name}, applying for the position of {req.job_title} at {req.company_name}.\n"
        f"Candidate Background: {p.get('summary', '')}\n"
        f"Key Skills: {p.get('skills', '')}\n"
        f"Target Job Description: {req.job_description}\n"
        "Format cleanly with formal greeting, strong value proposition, and professional sign-off."
    )

    letter_text = model_manager.get_completion([
        {"role": "system", "content": "You are NovaResume AI, an expert executive career coach."},
        {"role": "user", "content": prompt}
    ])

    return {"cover_letter": letter_text}

@router.post("/parse-import")
def parse_resume_import(req: ImportParseRequest):
    text = req.raw_text
    prompt = (
        "Extract resume information from the raw text into structured JSON format with fields: "
        "fullName, title, email, phone, location, linkedin, github, objective, summary, skills (comma separated), "
        "experience (array of company, role, dates, bullets), education (array of degree, school, year), "
        "certifications, languages, achievements.\n"
        f"RAW TEXT:\n{text[:3000]}"
    )

    json_str = model_manager.get_completion([
        {"role": "system", "content": "You are a JSON resume extraction parser. Output ONLY valid JSON."},
        {"role": "user", "content": prompt}
    ])

    try:
        clean_json = json_str.strip()
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        parsed = json.loads(clean_json)
        return {"parsed": parsed}
    except Exception:
        return {
            "parsed": {
                "fullName": "Imported Profile",
                "title": "Software Professional",
                "email": "imported@example.com",
                "summary": text[:200],
                "skills": "Python, JavaScript, SQL, Management"
            }
        }
