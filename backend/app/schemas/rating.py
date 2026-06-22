from datetime import datetime
from pydantic import BaseModel, Field


class RatingCreate(BaseModel):
    score: int = Field(ge=1, le=5)
    comment: str | None = None


class RatingResponse(BaseModel):
    id: int
    ride_id: int
    user_id: int
    score: int
    comment: str | None
    created_at: datetime

    class Config:
        from_attributes = True
