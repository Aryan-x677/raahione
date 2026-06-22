# RaahiOne System Design

## Architecture

The backend is a FastAPI application with layered responsibilities:

- `api/routes`: HTTP endpoints for auth, rides, bookings, ratings, recommendations, and admin analytics.
- `models`: SQLAlchemy ORM entities for users, rides, bookings, and ratings.
- `schemas`: Pydantic request/response contracts.
- `services`: business logic that should not live inside route handlers, currently the recommendation engine.
- `core`: shared settings and domain error handling.

PostgreSQL is the default database. `DATABASE_URL` can be overridden for local testing or deployment.

## Database Design

Core tables:

- `users`: authentication profile, role, admin flag, and commute preferences.
- `rides`: driver-owned ride offers with route text, source/destination coordinates, departure time, seats, and status.
- `bookings`: passenger requests against rides with lifecycle status.
- `ratings`: passenger feedback for accepted or completed rides.

## Roles And Permissions

- `commuter`: can search rides, receive recommendations, book rides, cancel own bookings, and rate eligible rides.
- `driver`: can publish rides and receive passenger bookings. Drivers cannot book their own rides.
- `admin`: can access platform analytics and can perform privileged operations.

## Authentication Flow

Users register with email and password. Passwords are hashed with Passlib bcrypt. Login returns a JWT bearer token containing the user id and email. Protected endpoints resolve the current user from the bearer token.

## Ride Matching Workflow

1. Driver publishes a ride with source/destination labels, coordinates, departure time, and seat count.
2. Commuter sends desired source/destination coordinates and departure time.
3. The recommendation service filters active rides with seats, excludes the commuter's own rides, and rejects rides outside the user's walking and time preferences.
4. Remaining rides are scored and sorted.

## Recommendation Engine

The engine is rule-based and explainable, which is a good fit for a prototype assignment because evaluators can inspect the scoring logic.

Score components:

- Source proximity: up to 35 points using Haversine distance.
- Destination proximity: up to 30 points using Haversine distance.
- Time proximity: up to 25 points based on minutes from preferred departure time.
- Booking history affinity: up to 10 points for routes similar to previous bookings.

Each recommendation includes the total score, component scores, distances, time delta, and a human-readable reason.
