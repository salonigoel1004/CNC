from pydantic import BaseModel
from enum import Enum

class UserRole(str, Enum):
    OWNER = "OWNER"
    MANAGER = "MANAGER"
    WORKER = "WORKER"

class User(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    post: str
    identity_number: str
    photo_url: str | None = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str
    post: str
    identity_number: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: User