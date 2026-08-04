from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib

from app.database.session import get_db
from app.models.schema import User, UserProfile, RefreshToken
from app.core.security import (
    hash_password, verify_password,
    create_access_token, verify_access_token,
    create_refresh_token, verify_refresh_token
)

router = APIRouter()

class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/register", response_model=AuthResponse)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in."
        )

    # 1. Create User
    new_user = User(
        full_name=req.fullName.strip(),
        email=email_clean,
        hashed_password=hash_password(req.password),
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 2. Create Default Profile
    profile = UserProfile(
        user_id=new_user.id,
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )
    db.add(profile)
    db.commit()

    # 3. Create Tokens
    access_token = create_access_token({"sub": new_user.id, "email": new_user.email})
    refresh_token = create_refresh_token({"sub": new_user.id, "email": new_user.email})

    # Save Refresh Token Record
    token_hash = hashlib.sha256(refresh_token.encode('utf-8')).hexdigest()
    ref_token_rec = RefreshToken(
        user_id=new_user.id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(days=30),
        revoked=False
    )
    db.add(ref_token_rec)
    db.commit()

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

@router.post("/login", response_model=AuthResponse)
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password. Please try again."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    # Fetch User Profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    avatar_url = profile.avatar_url if profile else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"

    access_token = create_access_token({"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token({"sub": user.id, "email": user.email})

    # Save Refresh Token Record
    token_hash = hashlib.sha256(refresh_token.encode('utf-8')).hexdigest()
    ref_token_rec = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(days=30),
        revoked=False
    )
    db.add(ref_token_rec)
    db.commit()

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

@router.post("/refresh")
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = verify_refresh_token(req.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired or invalid refresh token. Please sign in again."
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer active"
        )

    new_access_token = create_access_token({"sub": user.id, "email": user.email})
    new_refresh_token = create_refresh_token({"sub": user.id, "email": user.email})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or malformed Authorization header")

    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token expired or invalid")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found or deactivated")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()

    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "avatarUrl": profile.avatar_url if profile else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    }

@router.post("/logout")
def logout(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = verify_access_token(token)
        if payload:
            user_id = payload.get("sub")
            # Revoke refresh tokens for user
            db.query(RefreshToken).filter(RefreshToken.user_id == user_id).update({"revoked": True})
            db.commit()

    return {"message": "Session terminated successfully"}
