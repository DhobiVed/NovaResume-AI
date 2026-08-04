from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Index
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
