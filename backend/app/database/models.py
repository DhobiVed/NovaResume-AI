import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, JSON
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class SavedResume(Base):
    __tablename__ = "saved_resumes"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(255), default="My Professional Resume")
    template_id = Column(String(100), default="modern_professional")
    theme_key = Column(String(100), default="royal_blue")
    content_json = Column(JSON, nullable=False)
    ats_score = Column(Integer, default=85)
    target_role = Column(String(255), default="Software Engineer")
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(String, primary_key=True, default=generate_uuid)
    resume_id = Column(String, nullable=True)
    job_title = Column(String(255), default="Senior AI Systems Engineer")
    company_name = Column(String(255), default="Tech Corp Inc.")
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
