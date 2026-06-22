from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = Field(default="commuter", pattern="^(commuter|driver|admin)$")
    preferred_max_walk_km: float = Field(default=2.0, ge=0.1, le=20)
    preferred_time_window_minutes: int = Field(default=60, ge=5, le=360)
    admin_key: str | None = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_admin: bool
    preferred_max_walk_km: float
    preferred_time_window_minutes: int

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str
