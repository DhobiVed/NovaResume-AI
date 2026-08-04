import hashlib
import hmac
import base64
import json
import secrets
import time

SECRET_KEY = "nova_resume_ai_secret_jwt_key_ved_dhobi_2026"
REFRESH_SECRET_KEY = "nova_resume_ai_refresh_jwt_key_ved_dhobi_2026"
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 # 1 Day Access Token
REFRESH_TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 * 30 # 30 Days Refresh Token

# ── PASSWORD HASHING (PBKDF2_HMAC SHA-256) ─────────────────────
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, expected_hash = hashed_password.split('$')
        actual_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False

# ── JWT TOKEN ENCODING & DECODING ────────────────────────────
def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _base64url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

# Access Token
def create_access_token(data: dict) -> str:
    header = {"alg": ALGORITHM, "typ": "JWT"}
    payload = data.copy()
    payload["type"] = "access"
    payload["exp"] = int(time.time()) + ACCESS_TOKEN_EXPIRE_SECONDS

    header_b64 = _base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = _base64url_encode(json.dumps(payload).encode('utf-8'))

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_access_token(token: str) -> dict | None:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts

        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = _base64url_decode(signature_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload = json.loads(_base64url_decode(payload_b64).decode('utf-8'))
        if payload.get("exp", 0) < int(time.time()) or payload.get("type") != "access":
            return None

        return payload
    except Exception:
        return None

# Refresh Token
def create_refresh_token(data: dict) -> str:
    header = {"alg": ALGORITHM, "typ": "JWT"}
    payload = data.copy()
    payload["type"] = "refresh"
    payload["exp"] = int(time.time()) + REFRESH_TOKEN_EXPIRE_SECONDS

    header_b64 = _base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = _base64url_encode(json.dumps(payload).encode('utf-8'))

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(REFRESH_SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_refresh_token(token: str) -> dict | None:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts

        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(REFRESH_SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = _base64url_decode(signature_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload = json.loads(_base64url_decode(payload_b64).decode('utf-8'))
        if payload.get("exp", 0) < int(time.time()) or payload.get("type") != "refresh":
            return None

        return payload
    except Exception:
        return None
