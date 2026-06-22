from fastapi import APIRouter, Depends, Query
from app.core.errors import ConflictError, ForbiddenError, NotFoundError, ValidationError
from app.schemas.booking import BookingResponse
from app.schemas.ride import RideCreate, RideDetailResponse, RideResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.utils.jwt_handler import get_current_user
from app.models.user import User
from app.models.ride import Ride
from app.models.booking import Booking
from datetime import datetime

from app.utils.geocode import geocode_location

router = APIRouter(
    prefix="/rides",
    tags=["Rides"]
)

@router.post("/", response_model=RideResponse)
def create_ride(
    ride_data: RideCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["driver", "admin"]:
        raise ForbiddenError("Only drivers can publish rides")

    if ride_data.available_seats <= 0:
        raise ValidationError("available_seats must be greater than zero")

    source_lat = ride_data.source_lat
    source_lng = ride_data.source_lng
    if source_lat is None or source_lng is None:
        source_coords = geocode_location(ride_data.source)
        if source_coords is None:
            raise ValidationError("Unable to determine coordinates for source. Use a known Bangalore area name.")
        source_lat, source_lng = source_coords

    destination_lat = ride_data.destination_lat
    destination_lng = ride_data.destination_lng
    if destination_lat is None or destination_lng is None:
        destination_coords = geocode_location(ride_data.destination)
        if destination_coords is None:
            raise ValidationError("Unable to determine coordinates for destination. Use a known Bangalore area name.")
        destination_lat, destination_lng = destination_coords

    new_ride = Ride(
        driver_id=current_user.id,
        source=ride_data.source,
        source_lat=source_lat,
        source_lng=source_lng,
        destination=ride_data.destination,
        destination_lat=destination_lat,
        destination_lng=destination_lng,
        departure_time=ride_data.departure_time,
        status="ACTIVE",
        available_seats=ride_data.available_seats,
        created_at=datetime.utcnow()
    )

    db.add(new_ride)
    db.commit()
    db.refresh(new_ride)

    return new_ride

@router.get("/", response_model=list[RideResponse])
def get_rides(
    source: str | None=None,
    destination: str | None=None,
    db: Session = Depends(get_db),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):

    query = db.query(Ride)

    query = query.filter(
        Ride.status == "ACTIVE"
    )

    if source:
        query = query.filter(
            Ride.source.ilike(f"%{source}%")
        )

    if destination:
        query = query.filter(
            Ride.destination.ilike(f"%{destination}%")
        )

    rides = (
        query
        .offset(offset)
        .limit(limit)
        .all()
    )

    return rides

@router.post("/{ride_id}/book", response_model=BookingResponse)
def book_ride(
    ride_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    ride = (
        db.query(Ride)
        .filter(Ride.id == ride_id)
        .first()
    )

    if not ride:
        raise NotFoundError("Ride not found")

    if ride.driver_id == current_user.id:
        raise ConflictError("Cannot book your own ride")

    if ride.available_seats <= 0:
        raise ConflictError("No seats available")

    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.ride_id == ride_id,
            Booking.passenger_id == current_user.id
        )
        .first()
    )

    if existing_booking:
        raise ConflictError("Ride already booked")

    booking = Booking(
        ride_id=ride.id,
        passenger_id=current_user.id,
        status="REQUESTED",
        created_at=datetime.utcnow()
    )

    ride.available_seats -= 1

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking

@router.get("/{ride_id}", response_model=RideDetailResponse)
def get_ride(
    ride_id: int,
    db: Session = Depends(get_db)
):
    ride = (
        db.query(Ride)
        .filter(Ride.id == ride_id)
        .first()
    )

    if not ride:
        raise NotFoundError("Ride not found")

    return ride
