# RaahiOne Smart Commute Platform

A smart commute matching platform that helps passengers discover rides, request bookings, receive explainable ride recommendations, and manage their commute preferences.

## Live Demo

### Frontend

https://raahione-tau.vercel.app/

### Backend API

https://raahione-iyvd.onrender.com

### API Documentation

https://raahione-iyvd.onrender.com/docs

---

## Features

### Authentication

* User Registration
* User Login
* JWT-based Authentication
* Protected Routes
* Admin User Support

### Ride Management

* Create Ride
* Browse Available Rides
* View Ride Details
* Seat Availability Tracking

### Booking System

* Request Ride Booking
* View My Bookings
* Cancel Booking
* Booking Status Management

### Smart Recommendation Engine

* Location-based ride matching
* Distance scoring
* Time-window matching
* User preference support
* Explainable recommendation scores

### Ratings

* Rate completed rides
* Store passenger feedback

### Admin Analytics

* Total Users
* Active Rides
* Booking Statistics
* Open Request Monitoring

---

## Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT Authentication
* Pydantic

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: PostgreSQL

---

## Project Structure

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── utils/

frontend/
├── src/
├── components/
├── pages/
└── services/
```

---

## Local Setup

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://username:password@host:5432/database

SECRET_KEY=your-secret-key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=1000

ADMIN_REGISTRATION_KEY=your-admin-key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

Production:

```env
VITE_API_URL=https://raahione-iyvd.onrender.com
```

---

## Core API Endpoints

### Authentication

```http
POST /auth/register
POST /auth/login
GET /auth/me
```

### Rides

```http
POST /rides/
GET /rides/
GET /rides/{ride_id}
POST /rides/{ride_id}/book
```

### Bookings

```http
GET /bookings/me
PATCH /bookings/{booking_id}/cancel
```

### Recommendations

```http
POST /recommendations/rides
```

### Ratings

```http
POST /ratings/rides/{ride_id}
```

### Admin

```http
GET /admin/analytics
```

---

## Recommendation Engine Example

### Request

```json
{
  "source": "Indiranagar Metro",
  "destination": "Whitefield",
  "departure_time": "2026-06-22T09:15:00",
  "max_walk_km": 2,
  "time_window_minutes": 60
}
```

### Response Features

The recommendation engine returns:

* Ranked rides
* Match scores
* Distance calculations
* Time compatibility scores
* Explainable recommendation reasons

Example:

```json
{
  "ride_id": 1,
  "score": {
    "total": 91.2,
    "reason": "Closest pickup point with matching departure time"
  }
}
```

---

## Assignment Notes

This project was developed as a backend-focused smart commute platform prototype.

Implemented requirements include:

* Authentication & Authorization
* Ride Publishing
* Ride Discovery
* Ride Booking
* Recommendation Engine
* Ratings
* Admin Analytics
* PostgreSQL Integration
* Cloud Deployment
* RESTful API Design

---

## Author

Aryan Sharma
