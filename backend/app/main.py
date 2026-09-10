import os
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import initialize_database
from app.services.analytics import (
    calculate_data_quality,
    calculate_kpis,
    detect_anomalies,
    get_traffic_data,
)
from app.services.live_data import (
    get_history,
    get_latest_observations,
    get_source_status,
    synchronize_all,
)


load_dotenv()

scheduler = BackgroundScheduler()


def scheduled_synchronization() -> None:
    synchronize_all()


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()

    # Première synchronisation au démarrage
    synchronize_all()

    interval = int(os.getenv("SYNC_INTERVAL_MINUTES", "15"))

    scheduler.add_job(
        scheduled_synchronization,
        "interval",
        minutes=interval,
        id="citypulse-live-sync",
        replace_existing=True,
    )

    scheduler.start()

    yield

    scheduler.shutdown(wait=False)


app = FastAPI(
    title="CityPulse API",
    description="API d'analyse urbaine d'Abidjan",
    version="1.0.0",
    lifespan=lifespan,
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
        "message": "CityPulse API - Abidjan",
        "status": "online",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "city": "Abidjan",
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


@app.get("/api/live")
def get_live_data():
    return {
        "city": "Abidjan",
        "coordinates": {
            "latitude": 5.3599517,
            "longitude": -4.0082563,
        },
        "data": get_latest_observations(),
        "sources": get_source_status(),
    }


@app.post("/api/live/sync")
def manually_synchronize():
    result = synchronize_all()

    return {
        "message": "Synchronisation terminée",
        "result": result,
    }


@app.get("/api/live/history")
def get_live_history(
    category: str = "weather",
    metric: str = "temperature",
    limit: int = 100,
):
    return get_history(category, metric, limit)