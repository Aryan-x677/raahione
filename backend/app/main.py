from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import register_error_handlers
from app.db.database import engine, Base
from app import models
from app.api.routes import admin, auth, booking as booking_routes, rating as rating_routes, recomendation, ride

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)
register_error_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(ride.router)
app.include_router(booking_routes.router)
app.include_router(rating_routes.router)
app.include_router(recomendation.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "RaahiOne Smart Commute API is running"}
