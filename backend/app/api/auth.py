from fastapi import APIRouter, HTTPException, Response, Depends
from app.models.user import LoginRequest, LoginResponse, User, UserCreate
from app.services.auth import authenticate_user, create_access_token, get_current_user
from app.services.user_store import user_store

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
def login(response: Response, request: LoginRequest) -> LoginResponse:
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"user_id": user.id, "role": user.role})
    
    # Set httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # Set True in production with HTTPS
        samesite="lax",
        max_age=1800 
    )
    
    return LoginResponse(token=token, user=user)

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user

@router.post("/users")
def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != "OWNER":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        user = user_store.create_user(
            email=user_data.email,
            password=user_data.password,
            name=user_data.name,
            role=user_data.role,
            post=user_data.post,
            identity_number=user_data.identity_number
        )
        return User(**user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))