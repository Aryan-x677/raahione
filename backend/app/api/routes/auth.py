from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.models.user import User
from app.core.config import settings
from app.core.errors import ConflictError, ForbiddenError
from app.utils.jwt_handler import create_access_token
from app.utils.pwd_handler import hash_password, verify_password
from app.utils.jwt_handler import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise ConflictError("Email already registered")

    if user.role == "admin" and (
        settings.admin_registration_key is None or user.admin_key != settings.admin_registration_key
    ):
        raise ForbiddenError("Invalid admin registration key")

    hashed_password = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        is_admin=user.role == "admin",
        preferred_max_walk_km=user.preferred_max_walk_km,
        preferred_time_window_minutes=user.preferred_time_window_minutes,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=Token)
def login_user(user: UserLogin, db: Session =Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not verify_password(user.password, existing_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(data={
        "sub": str(existing_user.id),
        "email": existing_user.email
    })

    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):

    return current_user
