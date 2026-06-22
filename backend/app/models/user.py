from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, )
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    role = Column(String, nullable=False, default="commuter")
    preferred_max_walk_km = Column(Float, nullable=False, default=2.0)
    preferred_time_window_minutes = Column(Integer, nullable=False, default=60)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    rides = relationship("Ride", back_populates="driver")
    bookings = relationship("Booking", back_populates="passenger")
    ratings = relationship("Rating", back_populates="user")
