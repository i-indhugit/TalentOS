import bcrypt
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        print("[AUTH DEBUG] Starting password verification...")
        result = bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        print(f"[AUTH DEBUG] Password verification result: {result}")
        return result
    except Exception as e:
        print(f"[AUTH DEBUG] Bcrypt verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    print("[AUTH DEBUG] Hashing password...")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    print("[AUTH DEBUG] Password hash generated successfully.")
    return hashed.decode('utf-8')

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
