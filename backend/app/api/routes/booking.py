from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.errors import ForbiddenError, NotFoundError
from app.db.database import get_db
from app.models.booking import Booking
from app.models.ride import Ride
from app.models.user import User
from app.schemas.booking import BookingResponse
from app.utils.jwt_handler import get_current_user


router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/me", response_model=list[BookingResponse])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Booking)
        .filter(Booking.passenger_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )


@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundError("Booking not found")

    if booking.passenger_id != current_user.id and not current_user.is_admin:
        raise ForbiddenError("You can cancel only your own bookings")

    if booking.status != "CANCELLED":
        booking.status = "CANCELLED"
        ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
        if ride:
            ride.available_seats += 1
        db.commit()
        db.refresh(booking)

    return booking
