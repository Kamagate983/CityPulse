from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.analytics import (
    calculate_data_quality,
    calculate_kpis,
    detect_anomalies,
    get_traffic_data,
)


app = FastAPI(
    title="CityPulse API",
    description="API d'analyse de mobilité urbaine",
    version="0.3.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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


@app.get("/api/anomalies")
def get_anomalies():
    return detect_anomalies()


@app.get("/api/data-quality")
def get_data_quality():
    return calculate_data_quality()