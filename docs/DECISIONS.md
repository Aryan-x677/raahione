# Technical Decisions

## Assumptions

- A ride can be matched using one pickup coordinate and one drop coordinate for the prototype.
- Commuter preferences are simple numeric settings: max walking distance and acceptable time window.
- Bookings start as `REQUESTED`; a future driver workflow can move them to `ACCEPTED`, `REJECTED`, or `COMPLETED`.

## Features Selected

- JWT authentication.
- Role-aware ride publishing and booking.
- Admin registration guarded by `ADMIN_REGISTRATION_KEY`.
- Booking cancellation.
- Rating guardrails.
- Admin analytics summary.
- Explainable recommendation engine.

## Recommendation Choice

I chose a rule-based Haversine matcher over machine learning because the assignment rewards design judgment and explainability. With limited data, ML would be difficult to justify. The current approach is deterministic, testable, and easy to discuss in the technical round.

## Error Handling

Custom domain errors live in `app/core/errors.py`. Routes raise clear errors such as `NotFoundError`, `ConflictError`, and `ForbiddenError`, and FastAPI returns a consistent JSON shape:

```json
{
  "error": {
    "code": "conflict",
    "message": "Ride already booked"
  }
}
```

## Future Improvements

- Driver accept/reject endpoints with notification hooks.
- Recurring commute schedules.
- Route-polyline matching instead of single-point matching.
- Proper Alembic migrations for schema evolution.
- Automated tests with an HTTP test dependency installed.
