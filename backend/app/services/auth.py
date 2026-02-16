from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, Depends, Cookie
from app.settings import settings
from app.services.user_store import user_store
from app.models.user import User, UserRole

SECRET_KEY = settings.SECRET_KEY  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def authenticate_user(email: str, password: str) -> User | None:
    user_data = user_store.get_user_by_email(email)
    if not user_data:
        return None
    
    if not user_store.verify_password(password, user_data["password_hash"]):
        return None
    
    # Update last login
    user_store.update_last_login(user_data["id"])
    
    # Remove password hash before returning
    user_dict = {k: v for k, v in user_data.items() if k != "password_hash"}
    return User(**user_dict)

def get_current_user(access_token: str = Cookie(None)) -> User:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = verify_token(access_token)
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_data = user_store.get_user_by_id(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_dict = {k: v for k, v in user_data.items() if k != "password_hash"}
    return User(**user_dict)