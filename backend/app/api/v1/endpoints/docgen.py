from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.services.doc_gen_service import doc_gen_service
from app.services.graphic_pdf_service import graphic_pdf_service

router = APIRouter()

class DocGenRequest(BaseModel):
    title: str
    doc_type: str # report, resume, cover_letter, presentation, notes
    format: str # pdf, docx, txt, md
    content: str

class GraphicResumeRequest(BaseModel):
    theme_key: Optional[str] = "royal_blue"
    fullName: str
    title: str
    email: str
    phone: str
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    objective: Optional[str] = ""
    summary: Optional[str] = ""
    skills: Optional[str] = ""
    certifications: Optional[str] = ""
    languages: Optional[str] = ""
    achievements: Optional[str] = ""
    experience: Optional[List[Dict[str, Any]]] = []
    education: Optional[List[Dict[str, Any]]] = []
    projects: Optional[List[Dict[str, Any]]] = []

@router.post("/generate")
def generate_document(req: DocGenRequest):
    fmt = req.format.lower()
    title = req.title or "Generated Document"
    content = req.content
    
    if fmt == "pdf":
        file_path = doc_gen_service.generate_pdf(title, content)
        ext = "pdf"
    elif fmt == "docx":
        file_path = doc_gen_service.generate_docx(title, content)
        ext = "docx"
    elif fmt == "md":
        file_path = doc_gen_service.generate_markdown(title, content)
        ext = "md"
    else:
        file_path = doc_gen_service.generate_txt(title, content)
        ext = "txt"

    clean_filename = f"{title.replace(' ', '_').lower()}.{ext}"
    return FileResponse(file_path, filename=clean_filename)

@router.post("/graphic-resume")
def generate_graphic_resume(req: GraphicResumeRequest):
    resume_data = req.dict()
    theme_key = req.theme_key or "royal_blue"
    file_path = graphic_pdf_service.generate_graphic_pdf(resume_data, theme_key)
    clean_filename = f"{req.fullName.replace(' ', '_').lower()}_resume.pdf"
    return FileResponse(file_path, filename=clean_filename)
