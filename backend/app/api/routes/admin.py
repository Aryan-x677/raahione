from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.errors import ForbiddenError
from app.db.database import get_db
from app.models.booking import Booking
from app.models.ride import Ride
from app.models.user import User
from app.utils.jwt_handler import get_current_user


router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise ForbiddenError("Admin access required")
    return current_user


@router.get("/analytics")
def platform_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return {
        "users": db.query(User).count(),
        "active_rides": db.query(Ride).filter(Ride.status == "ACTIVE").count(),
        "bookings": db.query(Booking).count(),
        "open_requests": db.query(Booking).filter(Booking.status == "REQUESTED").count(),
    }
