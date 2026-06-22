from pydantic import BaseModel
from datetime import datetime

class RideCreate(BaseModel):
    source: str
    source_lat: float | None = None
    source_lng: float | None = None
    destination: str
    destination_lat: float | None = None
    destination_lng: float | None = None
    departure_time: datetime
    available_seats: int

class RideResponse(BaseModel):
    id: int
    driver_id: int
    source: str
    source_lat: float
    source_lng: float
    destination: str
    destination_lat: float
    destination_lng: float
    departure_time: datetime
    available_seats: int
    status: str 

    class Config:
        from_attributes = True

class RideDetailResponse(RideResponse):
    created_at: datetime
