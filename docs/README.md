# RaahiOne Smart Commute Backend

Backend prototype for a smart commute matching platform. It supports authentication, ride publishing, ride discovery, booking requests, cancellation, ratings, admin analytics, and explainable ride recommendations.

## Tech Stack

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT authentication
- Pydantic

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend reads `VITE_API_URL` (default `http://localhost:8000`). Vite also proxies `/api` to the backend during local development.


Set `DATABASE_URL` in `.env` if your PostgreSQL URL differs from the default. Set `ADMIN_REGISTRATION_KEY` before creating an admin user.

## Key Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /rides/`
- `GET /rides/`
- `POST /rides/{ride_id}/book`
- `GET /bookings/me`
- `PATCH /bookings/{booking_id}/cancel`
- `POST /recommendations/rides`
- `POST /ratings/rides/{ride_id}`
- `GET /admin/analytics`

## Recommendation Request Example

```json
{
  "source": "Indiranagar Metro",
  "source_lat": 12.978,
  "source_lng": 77.638,
  "destination": "Whitefield",
  "destination_lat": 12.97,
  "destination_lng": 77.749,
  "departure_time": "2026-06-22T09:15:00",
  "max_walk_km": 2,
  "time_window_minutes": 60
}
```

The response includes ranked rides with component scores and a reason string so the recommendation is explainable.

## Deployment

Deployment is required by the assignment. Add the final public API URL here after deploying to Render, Railway, AWS, or another cloud provider.
