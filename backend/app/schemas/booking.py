from datetime import datetime
from pydantic import BaseModel


class BookingResponse(BaseModel):
    id: int
    ride_id: int
    passenger_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
