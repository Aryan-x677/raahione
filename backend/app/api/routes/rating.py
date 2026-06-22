from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.db.database import get_db
from app.models.booking import Booking
from app.models.rating import Rating
from app.models.ride import Ride
from app.models.user import User
from app.schemas.rating import RatingCreate, RatingResponse
from app.utils.jwt_handler import get_current_user


router = APIRouter(prefix="/ratings", tags=["Ratings"])


@router.post("/rides/{ride_id}", response_model=RatingResponse)
def rate_ride(
    ride_id: int,
    payload: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise NotFoundError("Ride not found")

    booking = (
        db.query(Booking)
        .filter(
            Booking.ride_id == ride_id,
            Booking.passenger_id == current_user.id,
            Booking.status.in_(["ACCEPTED", "COMPLETED"]),
        )
        .first()
    )
    if not booking:
        raise ConflictError("Only accepted or completed passengers can rate a ride")

    existing = db.query(Rating).filter(Rating.ride_id == ride_id, Rating.user_id == current_user.id).first()
    if existing:
        raise ConflictError("Ride already rated by this user")

    rating = Rating(
        ride_id=ride_id,
        user_id=current_user.id,
        score=payload.score,
        comment=payload.comment,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating
