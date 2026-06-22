from dataclasses import dataclass
from datetime import datetime, timezone
from math import asin, cos, radians, sin, sqrt

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.ride import Ride
from app.models.user import User
from app.schemas.recomendation import RecommendationRequest


EARTH_RADIUS_KM = 6371.0


@dataclass
class ScoredRide:
    ride: Ride
    total: float
    source_distance_km: float
    destination_distance_km: float
    time_delta_minutes: float
    source_score: float
    destination_score: float
    time_score: float
    history_score: float
    reason: str


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    lat1_rad, lng1_rad, lat2_rad, lng2_rad = map(radians, [lat1, lng1, lat2, lng2])
    delta_lat = lat2_rad - lat1_rad
    delta_lng = lng2_rad - lng1_rad

    area = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lng / 2) ** 2
    return 2 * EARTH_RADIUS_KM * asin(sqrt(area))


def _normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def _bounded_score(value: float, maximum: float, weight: float) -> float:
    if value >= maximum:
        return 0.0
    return round((1 - value / maximum) * weight, 2)


def _route_text_matches(needle: str, haystack: str) -> bool:
    return needle.strip().lower() in haystack.strip().lower() or haystack.strip().lower() in needle.strip().lower()


def _history_score(db: Session, user_id: int, ride: Ride, request: RecommendationRequest) -> float:
    previous_bookings = (
        db.query(Booking)
        .join(Ride, Booking.ride_id == Ride.id)
        .filter(Booking.passenger_id == user_id, Booking.status.in_(["REQUESTED", "ACCEPTED", "COMPLETED"]))
        .limit(25)
        .all()
    )

    if not previous_bookings:
        return 0.0

    best = 0.0
    for booking in previous_bookings:
        previous = booking.ride
        if previous is None:
            continue

        score = 0.0
        if _route_text_matches(request.source, previous.source):
            score += 3.0
        if _route_text_matches(request.destination, previous.destination):
            score += 3.0
        if _route_text_matches(previous.source, ride.source):
            score += 2.0
        if _route_text_matches(previous.destination, ride.destination):
            score += 2.0
        best = max(best, score)

    return min(best, 10.0)


def recommend_rides(db: Session, user: User, request: RecommendationRequest) -> list[ScoredRide]:
    max_walk_km = request.max_walk_km or user.preferred_max_walk_km
    time_window_minutes = request.time_window_minutes or user.preferred_time_window_minutes
    requested_time = _normalize_datetime(request.departure_time)

    rides = (
        db.query(Ride)
        .filter(Ride.status == "ACTIVE", Ride.available_seats > 0)
        .all()
    )

    scored: list[ScoredRide] = []
    for ride in rides:
        if ride.driver_id == user.id:
            continue

        source_distance = haversine_km(request.source_lat, request.source_lng, ride.source_lat, ride.source_lng)
        destination_distance = haversine_km(
            request.destination_lat,
            request.destination_lng,
            ride.destination_lat,
            ride.destination_lng,
        )
        time_delta = abs((_normalize_datetime(ride.departure_time) - requested_time).total_seconds()) / 60

        if source_distance > max_walk_km or destination_distance > max_walk_km or time_delta > time_window_minutes:
            continue

        source_score = _bounded_score(source_distance, max_walk_km, 35)
        destination_score = _bounded_score(destination_distance, max_walk_km, 30)
        time_score = _bounded_score(time_delta, time_window_minutes, 25)
        history_score = _history_score(db, user.id, ride, request)
        total = round(source_score + destination_score + time_score + history_score, 2)

        reason = (
            f"{source_distance:.1f} km from pickup, "
            f"{destination_distance:.1f} km from drop, "
            f"{time_delta:.0f} min from preferred time"
        )
        if history_score:
            reason += ", similar to your previous bookings"

        scored.append(
            ScoredRide(
                ride=ride,
                total=total,
                source_distance_km=round(source_distance, 2),
                destination_distance_km=round(destination_distance, 2),
                time_delta_minutes=round(time_delta, 2),
                source_score=source_score,
                destination_score=destination_score,
                time_score=time_score,
                history_score=history_score,
                reason=reason,
            )
        )

    return sorted(scored, key=lambda item: item.total, reverse=True)[: request.limit]
