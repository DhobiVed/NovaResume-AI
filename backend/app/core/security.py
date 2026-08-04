import hashlib
import hmac
import base64
import json
import secrets
import time

# ── SECRETS — loaded from config (Railway env vars) ───────────────
from app.core.config import settings

SECRET_KEY = settings.JWT_SECRET_KEY
REFRESH_SECRET_KEY = settings.JWT_REFRESH_SECRET_KEY
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_SECONDS  = 60 * 60 * 24      # 1 day
REFRESH_TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 * 30 # 30 days

# ── PASSWORD HASHING (PBKDF2-HMAC-SHA256) ────────────────────────
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    ).hex()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, expected_hash = hashed_password.split('$')
        actual_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100_000
        ).hex()
        return hmac.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False

# ── JWT HELPERS ───────────────────────────────────────────────────
def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _b64_decode(s: str) -> bytes:
    s += '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)

def _make_token(data: dict, token_type: str, expire_secs: int, secret: str) -> str:
    header  = {"alg": ALGORITHM, "typ": "JWT"}
    payload = {**data, "type": token_type, "exp": int(time.time()) + expire_secs}
    h = _b64_encode(json.dumps(header).encode())
    p = _b64_encode(json.dumps(payload).encode())
    sig = _b64_encode(hmac.new(secret.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest())
    return f"{h}.{p}.{sig}"

def _verify_token(token: str, token_type: str, secret: str) -> dict | None:
    try:
        h, p, sig = token.split('.')
        expected = _b64_encode(hmac.new(secret.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(expected, sig):
            return None
        payload = json.loads(_b64_decode(p).decode())
        if payload.get("exp", 0) < int(time.time()):
            return None
        if payload.get("type") != token_type:
            return None
        return payload
    except Exception:
        return None

# ── PUBLIC API ────────────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    return _make_token(data, "access", ACCESS_TOKEN_EXPIRE_SECONDS, SECRET_KEY)

def verify_access_token(token: str) -> dict | None:
    return _verify_token(token, "access", SECRET_KEY)

def create_refresh_token(data: dict) -> str:
    return _make_token(data, "refresh", REFRESH_TOKEN_EXPIRE_SECONDS, REFRESH_SECRET_KEY)

def verify_refresh_token(token: str) -> dict | None:
    return _verify_token(token, "refresh", REFRESH_SECRET_KEY)
