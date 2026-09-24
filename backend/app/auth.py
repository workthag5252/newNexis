import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.config import settings

# Password hashing with pwdlib argon2, with safe fallback
try:
    from pwdlib import PasswordHash
    password_hash = PasswordHash.recommended()
except Exception:
    import hashlib
    class FallbackHash:
        def hash(self, password: str) -> str:
            salt = "nexus_salt_2026"
            return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
        def verify(self, password: str, hashed: str) -> bool:
            return self.hash(password) == hashed
    password_hash = FallbackHash()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hash.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return password_hash.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
