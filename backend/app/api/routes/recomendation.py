from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.recomendation import RecommendationRequest, RecommendationScore, RideRecommendation
from app.services.recommendation_service import recommend_rides
from app.utils.geocode import geocode_location
from app.utils.jwt_handler import get_current_user


router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.post("/rides", response_model=list[RideRecommendation])
def get_ride_recommendations(
    payload: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.source_lat is None or payload.source_lng is None:
        source_coords = geocode_location(payload.source)
        if source_coords is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to determine coordinates for source")
        payload.source_lat, payload.source_lng = source_coords

    if payload.destination_lat is None or payload.destination_lng is None:
        destination_coords = geocode_location(payload.destination)
        if destination_coords is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to determine coordinates for destination")
        payload.destination_lat, payload.destination_lng = destination_coords

    scored_rides = recommend_rides(db, current_user, payload)

    return [
        RideRecommendation(
            ride_id=item.ride.id,
            driver_id=item.ride.driver_id,
            source=item.ride.source,
            destination=item.ride.destination,
            departure_time=item.ride.departure_time,
            available_seats=item.ride.available_seats,
            score=RecommendationScore(
                total=item.total,
                source_distance_km=item.source_distance_km,
                destination_distance_km=item.destination_distance_km,
                time_delta_minutes=item.time_delta_minutes,
                source_score=item.source_score,
                destination_score=item.destination_score,
                time_score=item.time_score,
                history_score=item.history_score,
                reason=item.reason,
            ),
        )
        for item in scored_rides
    ]
