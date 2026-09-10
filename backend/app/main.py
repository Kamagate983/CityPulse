from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.analytics import calculate_kpis, get_traffic_data


app = FastAPI(
    title="CityPulse API",
    description="API d'analyse de mobilité urbaine",
    version="0.2.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Bienvenue sur CityPulse API",
        "status": "online",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "citypulse-backend",
    }


@app.get("/api/kpis")
def get_kpis():
    return calculate_kpis()


@app.get("/api/traffic")
def get_traffic():
    return get_traffic_data()