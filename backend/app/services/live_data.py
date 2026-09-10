from datetime import datetime, timezone
from pathlib import Path
import os

import httpx
from dotenv import load_dotenv

from app.database import get_connection


PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

CITY = os.getenv("CITY", "Abidjan")
LATITUDE = float(os.getenv("LATITUDE", "5.3599517"))
LONGITUDE = float(os.getenv("LONGITUDE", "-4.0082563"))
TIMEZONE = os.getenv("TIMEZONE", "Africa/Abidjan")

WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def save_observation(
    source: str,
    category: str,
    metric: str,
    value: float | None,
    unit: str,
    observed_at: str,
) -> None:
    connection = get_connection()

    connection.execute(
        """
        INSERT OR IGNORE INTO observations (
            source,
            category,
            metric,
            value,
            unit,
            latitude,
            longitude,
            observed_at,
            received_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            source,
            category,
            metric,
            value,
            unit,
            LATITUDE,
            LONGITUDE,
            observed_at,
            utc_now(),
        ),
    )

    connection.commit()
    connection.close()


def save_sync_log(
    source: str,
    status: str,
    message: str,
    started_at: str,
) -> None:
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO sync_logs (
            source,
            status,
            message,
            started_at,
            finished_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            source,
            status,
            message,
            started_at,
            utc_now(),
        ),
    )

    connection.commit()
    connection.close()


def fetch_weather() -> dict:
    started_at = utc_now()

    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "weather_code,"
            "wind_speed_10m"
        ),
        "timezone": TIMEZONE,
    }

    try:
        with httpx.Client(timeout=20) as client:
            response = client.get(WEATHER_URL, params=params)
            response.raise_for_status()
            payload = response.json()

        current = payload["current"]
        observed_at = current["time"]

        weather_metrics = [
            (
                "temperature",
                current.get("temperature_2m"),
                "°C",
            ),
            (
                "humidity",
                current.get("relative_humidity_2m"),
                "%",
            ),
            (
                "precipitation",
                current.get("precipitation"),
                "mm",
            ),
            (
                "weather_code",
                current.get("weather_code"),
                "wmo",
            ),
            (
                "wind_speed",
                current.get("wind_speed_10m"),
                "km/h",
            ),
        ]

        for metric, value, unit in weather_metrics:
            save_observation(
                source="open-meteo",
                category="weather",
                metric=metric,
                value=value,
                unit=unit,
                observed_at=observed_at,
            )

        save_sync_log(
            source="open-meteo-weather",
            status="success",
            message="Données météo synchronisées",
            started_at=started_at,
        )

        return {
            "status": "online",
            "observed_at": observed_at,
            "message": "Données météo synchronisées",
        }

    except Exception as error:
        save_sync_log(
            source="open-meteo-weather",
            status="error",
            message=str(error),
            started_at=started_at,
        )

        return {
            "status": "error",
            "message": str(error),
        }


def fetch_air_quality() -> dict:
    started_at = utc_now()

    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "current": (
            "pm10,"
            "pm2_5,"
            "carbon_monoxide,"
            "nitrogen_dioxide,"
            "ozone"
        ),
        "timezone": TIMEZONE,
    }

    try:
        with httpx.Client(timeout=20) as client:
            response = client.get(AIR_QUALITY_URL, params=params)
            response.raise_for_status()
            payload = response.json()

        current = payload["current"]
        observed_at = current["time"]

        air_metrics = [
            ("pm10", current.get("pm10"), "μg/m³"),
            ("pm2_5", current.get("pm2_5"), "μg/m³"),
            ("carbon_monoxide", current.get("carbon_monoxide"), "μg/m³"),
            ("nitrogen_dioxide", current.get("nitrogen_dioxide"), "μg/m³"),
            ("ozone", current.get("ozone"), "μg/m³"),
        ]

        for metric, value, unit in air_metrics:
            save_observation(
                source="open-meteo-air-quality",
                category="air_quality",
                metric=metric,
                value=value,
                unit=unit,
                observed_at=observed_at,
            )

        save_sync_log(
            source="open-meteo-air-quality",
            status="success",
            message="Données de qualité de l'air synchronisées",
            started_at=started_at,
        )

        return {
            "status": "online",
            "observed_at": observed_at,
            "message": "Données de qualité de l'air synchronisées",
        }

    except Exception as error:
        save_sync_log(
            source="open-meteo-air-quality",
            status="error",
            message=str(error),
            started_at=started_at,
        )

        return {
            "status": "error",
            "message": str(error),
        }


def synchronize_all() -> dict:
    return {
        "weather": fetch_weather(),
        "air_quality": fetch_air_quality(),
    }


def get_latest_observations() -> dict:
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            source,
            category,
            metric,
            value,
            unit,
            observed_at,
            received_at
        FROM observations
        WHERE id IN (
            SELECT MAX(id)
            FROM observations
            GROUP BY source, category, metric
        )
        ORDER BY category, metric
        """
    ).fetchall()

    connection.close()

    result = {
        "weather": {},
        "air_quality": {},
    }

    for row in rows:
        result.setdefault(row["category"], {})
        result[row["category"]][row["metric"]] = {
            "value": row["value"],
            "unit": row["unit"],
            "source": row["source"],
            "observed_at": row["observed_at"],
            "received_at": row["received_at"],
        }

    return result


def get_source_status() -> list[dict]:
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            source,
            status,
            message,
            started_at,
            finished_at
        FROM sync_logs
        WHERE id IN (
            SELECT MAX(id)
            FROM sync_logs
            GROUP BY source
        )
        ORDER BY source
        """
    ).fetchall()

    connection.close()

    return [dict(row) for row in rows]


def get_history(category: str, metric: str, limit: int = 100) -> list[dict]:
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            category,
            metric,
            value,
            unit,
            observed_at,
            received_at
        FROM observations
        WHERE category = ? AND metric = ?
        ORDER BY observed_at DESC
        LIMIT ?
        """,
        (category, metric, limit),
    ).fetchall()

    connection.close()

    return [dict(row) for row in rows]