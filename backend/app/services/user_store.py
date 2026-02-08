import json
import os
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime
import uuid
from filelock import FileLock  
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DATA_DIR = Path(__file__).parent.parent.parent / "data"
USERS_FILE = DATA_DIR / "users.json"
LOCK_FILE = DATA_DIR / "users.json.lock"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

class UserStore:
    def __init__(self):
        if not USERS_FILE.exists():
            self._init_default_users()
    
    def _read_users(self) -> Dict:
        """Thread-safe read"""
        with FileLock(str(LOCK_FILE)):
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
    
    def _write_users(self, data: Dict):
        """Thread-safe write with backup"""
        with FileLock(str(LOCK_FILE)):
            # Backup before write
            if USERS_FILE.exists():
                backup = USERS_FILE.with_suffix('.json.bak')
                USERS_FILE.replace(backup)
            
            with open(USERS_FILE, 'w') as f:
                json.dump(data, f, indent=2)
    
    def _init_default_users(self):
        """Create default admin user"""
        data = {
            "users": {
                "admin-001": {
                    "id": "admin-001",
                    "email": "owner@company.com",
                    "password_hash": pwd_context.hash("owner123"),
                    "name": "System Admin",
                    "role": "OWNER",
                    "post": "Plant Manager",
                    "identity_number": "EMP-001",
                    "photo_url": None,
                    "is_active": True,
                    "created_at": datetime.utcnow().isoformat() + "Z",
                    "last_login": None
                },
                "worker-001": {
                    "id": "worker-001",
                    "email": "worker@company.com",
                    "password_hash": pwd_context.hash("worker123"),
                    "name": "Machine Operator",
                    "role": "WORKER",
                    "post": "Operator",
                    "identity_number": "EMP-002",
                    "photo_url": None,
                    "is_active": True,
                    "created_at": datetime.utcnow().isoformat() + "Z",
                    "last_login": None
                }
            }
        }
        self._write_users(data)
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Find user by email"""
        data = self._read_users()
        for user in data["users"].values():
            if user["email"] == email and user["is_active"]:
                return user
        return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Find user by ID"""
        data = self._read_users()
        user = data["users"].get(user_id)
        return user if user and user["is_active"] else None
    
    def create_user(self, email: str, password: str, name: str, role: str, post: str, identity_number: str) -> Dict:
        """Create new user"""
        data = self._read_users()
        
        # Check if email exists
        if any(u["email"] == email for u in data["users"].values()):
            raise ValueError("Email already exists")
        
        # Generate UUID
        user_id = str(uuid.uuid4())
        
        # Create user
        user = {
            "id": user_id,
            "email": email,
            "password_hash": pwd_context.hash(password),
            "name": name,
            "role": role,
            "post": post,
            "identity_number": identity_number,
            "photo_url": None,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "last_login": None
        }
        
        data["users"][user_id] = user
        self._write_users(data)
        
        # Don't return password hash
        user_safe = {k: v for k, v in user.items() if k != "password_hash"}
        return user_safe
    
    def update_last_login(self, user_id: str):
        """Update last login timestamp"""
        data = self._read_users()
        if user_id in data["users"]:
            data["users"][user_id]["last_login"] = datetime.utcnow().isoformat() + "Z"
            self._write_users(data)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def list_users(self) -> list:
        """List all active users"""
        data = self._read_users()
        return [
            {k: v for k, v in user.items() if k != "password_hash"}
            for user in data["users"].values()
            if user["is_active"]
        ]
    
    def deactivate_user(self, user_id: str):
        """Soft delete user"""
        data = self._read_users()
        if user_id in data["users"]:
            data["users"][user_id]["is_active"] = False
            self._write_users(data)

# Singleton instance
user_store = UserStore()