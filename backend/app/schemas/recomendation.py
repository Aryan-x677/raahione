from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

class RecommendationRequest(BaseModel):
    source: str
    source_lat: Optional[float] = None
    source_lng: Optional[float] = None
    destination: str
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    departure_time: datetime
    max_walk_km: Optional[float] = None
    time_window_minutes: Optional[int] = None
    limit: int = Field(default=10, ge=1, le=50)

class RecommendationScore(BaseModel):
    total: float
    source_distance_km: float
    destination_distance_km: float
    time_delta_minutes: float
    source_score: float
    destination_score: float
    time_score: float
    history_score: float
    reason: str

    class Config:
        from_attributes = True

class RideRecommendation(BaseModel):
    ride_id: int
    driver_id: int
    source: str
    destination: str
    departure_time: datetime
    available_seats: int
    score: RecommendationScore

    class Config:
        from_attributes = True
