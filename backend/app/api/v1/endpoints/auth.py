from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib
import secrets

from app.database.session import get_db
from app.models.schema import User, UserProfile, RefreshToken, PasswordResetToken
from app.core.security import (
    hash_password, verify_password,
    create_access_token, verify_access_token,
    create_refresh_token, verify_refresh_token
)

router = APIRouter()

# ── REQUEST SCHEMAS ─────────────────────────────────────────────
class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

def _get_current_user_from_header(authorization: str | None, db: Session):
    """Helper: parse Authorization header, validate token, return User."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or malformed Authorization header")
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token expired or invalid")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found or deactivated")
    return user

def _make_token_pair(user: User, db: Session):
    """Issue new access+refresh token pair, persist refresh token hash."""
    access_token = create_access_token({"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token({"sub": user.id, "email": user.email})

    token_hash = hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(days=30),
        revoked=False
    ))
    db.commit()
    return access_token, refresh_token


# ── SIGNUP ─────────────────────────────────────────────────────
@router.post("/register", response_model=AuthResponse)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    if len(req.password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters.")

    email_clean = req.email.lower().strip()
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in."
        )

    new_user = User(
        full_name=req.fullName.strip(),
        email=email_clean,
        hashed_password=hash_password(req.password),
        is_active=True,
        is_verified=False  # Require email verification in production
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create blank profile
    profile = UserProfile(
        user_id=new_user.id,
        avatar_url=None
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    access_token, refresh_token = _make_token_pair(new_user, db)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": new_user.id,
            "name": new_user.full_name,
            "email": new_user.email,
            "avatarUrl": profile.avatar_url
        }
    )


# ── LOGIN ──────────────────────────────────────────────────────
@router.post("/login", response_model=AuthResponse)
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials and try again."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    avatar_url = profile.avatar_url if profile else None

    access_token, refresh_token = _make_token_pair(user, db)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "avatarUrl": avatar_url
        }
    )


# ── REFRESH TOKEN ──────────────────────────────────────────────
@router.post("/refresh")
def refresh_token_endpoint(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = verify_refresh_token(req.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired or invalid refresh token. Please sign in again."
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated."
        )

    # Verify token is not revoked in DB
    token_hash = hashlib.sha256(req.refresh_token.encode("utf-8")).hexdigest()
    stored = db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked == False
    ).first()

    if not stored or stored.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or expired. Please sign in again."
        )

    # Rotate: revoke old token, issue new pair
    stored.revoked = True
    db.commit()

    access_token, new_refresh_token = _make_token_pair(user, db)

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


# ── GET CURRENT USER ───────────────────────────────────────────
@router.get("/me")
def get_current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = _get_current_user_from_header(authorization, db)
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "avatarUrl": profile.avatar_url if profile else None
    }


# ── LOGOUT ─────────────────────────────────────────────────────
@router.post("/logout")
def logout(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = verify_access_token(token)
        if payload:
            user_id = payload.get("sub")
            # Revoke ALL active refresh tokens for this user on logout
            db.query(RefreshToken).filter(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked == False
            ).update({"revoked": True})
            db.commit()
    return {"message": "Logged out successfully. All sessions terminated."}


# ── FORGOT PASSWORD ────────────────────────────────────────────
@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    # Always return the same message to prevent email enumeration attacks
    generic_response = {
        "message": "If an account with that email exists, a password reset link has been sent."
    }

    if not user:
        return generic_response

    # Invalidate all existing (unused) reset tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False
    ).update({"used": True})
    db.commit()

    # Generate a secure 48-byte URL-safe reset token
    raw_token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(hours=1),
        used=False
    )
    db.add(reset_record)
    db.commit()

    # In production: send email via SMTP/SendGrid/Resend
    # For now: return the reset token in the response for local dev testing
    return {
        "message": "Password reset token generated. Use it within 1 hour.",
        "reset_token": raw_token,  # Remove this in production - send via email only
        "dev_note": "In production, this token would be emailed, not returned in the API response."
    }


# ── RESET PASSWORD ─────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters.")

    token_hash = hashlib.sha256(req.token.encode("utf-8")).hexdigest()

    reset_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False
    ).first()

    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token. Please request a new one."
        )

    if reset_record.expires_at < datetime.utcnow():
        reset_record.used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link has expired. Please request a new password reset."
        )

    user = db.query(User).filter(User.id == reset_record.user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User account not found.")

    user.hashed_password = hash_password(req.new_password)
    reset_record.used = True

    # Revoke all active refresh tokens to force re-login
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id,
        RefreshToken.revoked == False
    ).update({"revoked": True})
    db.commit()

    return {"message": "Password has been reset successfully. Please sign in with your new password."}
