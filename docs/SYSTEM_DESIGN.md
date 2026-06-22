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
- `bookings`: passenger requests against rides with lifecycle status.# RaahiOne System Design

## Overview

RaahiOne is a smart commute matching platform that connects commuters and drivers for shared rides. The system enables ride publishing, ride discovery, booking management, ride recommendations, ratings, and administrative analytics.

The application follows a layered architecture using FastAPI, PostgreSQL, and a React frontend.

### Live Deployment

**Frontend:** https://raahione-tau.vercel.app/

**Backend API:** https://raahione-iyvd.onrender.com

**API Documentation:** https://raahione-iyvd.onrender.com/docs

---

# High-Level Architecture

```text
┌─────────────────────────┐
│ React + TypeScript UI   │
│        (Vercel)         │
└────────────┬────────────┘
             │ HTTPS
             ▼
┌─────────────────────────┐
│      FastAPI API        │
│        (Render)         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      PostgreSQL DB      │
└─────────────────────────┘
```

### Frontend Responsibilities

* User authentication
* Ride search and booking
* Recommendation interface
* Driver ride management
* Admin analytics dashboard

### Backend Responsibilities

* Authentication and authorization
* Ride management
* Booking lifecycle management
* Recommendation engine
* Ratings management
* Administrative analytics

### Database Responsibilities

* Persistent storage
* Relationship management
* Transaction handling
* Data integrity enforcement

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS

## Backend

* FastAPI
* SQLAlchemy ORM
* Pydantic
* JWT Authentication

## Database

* PostgreSQL

## Deployment

* Vercel (Frontend)
* Render (Backend)

---

# Backend Architecture

The backend follows a modular layered architecture.

## API Layer (`api/routes`)

Handles:

* HTTP requests
* Input validation
* Authentication checks
* Response serialization

Modules:

* Authentication
* Rides
* Bookings
* Ratings
* Recommendations
* Admin

---

## Service Layer (`services`)

Contains business logic independent from HTTP endpoints.

Current services:

* Recommendation Engine
* Ride Scoring Logic
* Geospatial Matching

---

## Data Layer (`models`)

SQLAlchemy ORM models:

* User
* Ride
* Booking
* Rating

Provides database abstraction and relationship management.

---

## Schema Layer (`schemas`)

Pydantic models used for:

* Request validation
* Response validation
* Type safety

---

## Core Layer (`core`)

Shared functionality:

* Configuration management
* JWT settings
* Error handling
* Security utilities

---

# Database Design

## Users Table

Stores authentication and profile information.

Fields:

* id
* email
* password_hash
* role
* is_admin
* preferred_max_walk_km
* preferred_time_window_minutes

---

## Rides Table

Stores ride offers published by drivers.

Fields:

* id
* driver_id
* source
* destination
* source_lat
* source_lng
* destination_lat
* destination_lng
* departure_time
* available_seats
* status

Relationship:

```text
User (Driver)
      │
      ▼
     Ride
```

---

## Bookings Table

Stores ride booking requests.

Fields:

* id
* ride_id
* passenger_id
* status
* created_at

Relationship:

```text
Passenger
    │
    ▼
 Booking
    │
    ▼
  Ride
```

Status values:

```text
REQUESTED
CANCELLED
```

---

## Ratings Table

Stores passenger feedback.

Fields:

* id
* ride_id
* passenger_id
* rating
* review

---

# Authentication & Authorization

## Registration

Users register using:

* Email
* Password
* Role

Passwords are hashed before storage using bcrypt.

---

## Login

Upon successful login:

1. Credentials are validated.
2. JWT access token is generated.
3. Token is returned to the client.

Example flow:

```text
Login Request
      │
      ▼
Credential Validation
      │
      ▼
JWT Creation
      │
      ▼
Authenticated Requests
```

---

## Authorization

### Commuter

Can:

* Search rides
* Request bookings
* Cancel bookings
* Rate rides
* Receive recommendations

### Driver

Can:

* Publish rides
* Manage rides

### Admin

Can:

* Access analytics
* Monitor platform activity

---

# Ride Recommendation Engine

## Objective

Recommend rides that best match a commuter's:

* Pickup location
* Destination
* Departure time
* Historical preferences

The recommendation engine is explainable and rule-based.

---

# Recommendation Workflow

### Step 1

Commuter submits:

* Source
* Destination
* Departure Time

---

### Step 2

Locations are converted into geographic coordinates.

```text
Source
  ▼
Latitude / Longitude

Destination
  ▼
Latitude / Longitude
```

---

### Step 3

Eligible rides are filtered.

Filters:

* Active rides only
* Available seats required
* Exclude user's own rides
* Respect walking distance preference
* Respect time window preference

---

### Step 4

Remaining rides are scored and ranked.

---

# Haversine-Based Distance Matching

To determine route similarity, the recommendation engine uses the **Haversine Formula**.

The formula calculates the shortest distance between two geographic coordinates on the Earth's surface.

This provides realistic proximity calculations for:

* Pickup locations
* Drop locations

instead of relying on simple text matching.

---

## Source Distance

The engine calculates:

```python
source_distance_km = haversine(
    user_source_lat,
    user_source_lng,
    ride.source_lat,
    ride.source_lng
)
```

This measures how close the ride pickup point is to the commuter.

---

## Destination Distance

The engine calculates:

```python
destination_distance_km = haversine(
    user_destination_lat,
    user_destination_lng,
    ride.destination_lat,
    ride.destination_lng
)
```

This measures how closely the ride destination matches the commuter's intended destination.

---

# Scoring Model

Maximum score: **100**

## Source Proximity

Weight:

```text
35 Points
```

Calculated using Haversine pickup distance.

---

## Destination Proximity

Weight:

```text
30 Points
```

Calculated using Haversine destination distance.

---

## Time Compatibility

Weight:

```text
25 Points
```

Based on departure-time difference.

---

## Historical Preference

Weight:

```text
10 Points
```

Based on similarity to previous booking history.

---

# Final Recommendation Score

```text
Total Score =
Source Score +
Destination Score +
Time Score +
History Score
```

Maximum:

```text
100 Points
```

Higher scores indicate better ride matches.

---

# Explainable Recommendations

Each recommendation returns:

* Total Score
* Source Distance
* Destination Distance
* Time Difference
* Component Scores
* Human-readable Reason

Example:

```json
{
  "ride_id": 7,
  "score": 91.2,
  "reason": "Pickup and destination closely match your route and preferred departure time."
}
```

This makes recommendation decisions transparent and easy to understand.

---

# Admin Analytics

Administrators can access platform metrics through:

```http
GET /admin/analytics
```

Metrics include:

* Total Users
* Active Rides
* Bookings
* Open Requests

---

# Security Considerations

Implemented:

* JWT Authentication
* Password Hashing (bcrypt)
* Role-Based Access Control
* Protected Endpoints
* Input Validation using Pydantic

---

# Future Improvements

Potential production enhancements:

* Redis Caching
* WebSocket Real-Time Updates
* Ride Acceptance Workflow
* Route Optimization APIs
* Geospatial Database Indexing
* Machine Learning Recommendation Models
* Background Task Processing

---

# Design Decisions

### Why FastAPI?

* High performance
* Automatic API documentation
* Strong typing support
* Easy development experience

### Why PostgreSQL?

* ACID-compliant transactions
* Reliable relational modeling
* Strong indexing support
* Cloud deployment friendly

### Why Haversine Distance?

* Accurate geographic distance calculation
* Lightweight computation
* Suitable for ride-matching use cases
* Easily explainable to users and evaluators

### Why Rule-Based Recommendations?

For a prototype system:

* Transparent decision making
* Deterministic behavior
* Easy debugging
* No training data requirements

This approach demonstrates recommendation system fundamentals while remaining practical for an internship-scale project.

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
