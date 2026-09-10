from pathlib import Path

import pandas as pd


DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "traffic.csv"


def load_traffic_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)

    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    return df


def get_traffic_data() -> list[dict]:
    df = load_traffic_data()
    df["date"] = df["date"].dt.strftime("%Y-%m-%d")

    return df.to_dict(orient="records")


def calculate_kpis() -> dict:
    df = load_traffic_data()

    return {
        "average_traffic": round(df["traffic_count"].mean(), 2),
        "maximum_traffic": int(df["traffic_count"].max()),
        "minimum_traffic": int(df["traffic_count"].min()),
        "total_days": len(df),
        "data_quality": calculate_data_quality()["quality_score"],
    }


def detect_anomalies() -> list[dict]:
    df = load_traffic_data()

    mean = df["traffic_count"].mean()
    std = df["traffic_count"].std()

    if std == 0:
        df["z_score"] = 0
    else:
        df["z_score"] = (df["traffic_count"] - mean) / std

    df["rolling_mean"] = (
        df["traffic_count"]
        .rolling(window=3, min_periods=3)
        .mean()
    )

    df["difference_percent"] = (
        (df["traffic_count"] - mean) / mean * 100
    ).round(2)

    anomalies = df[abs(df["z_score"]) >= 1].copy()

    results = []

    for _, row in anomalies.iterrows():
        direction = "supérieur" if row["traffic_count"] > mean else "inférieur"

        results.append(
            {
                "date": row["date"].strftime("%Y-%m-%d"),
                "zone": row["zone"],
                "traffic_count": int(row["traffic_count"]),
                "average_traffic": round(mean, 2),
                "difference_percent": float(row["difference_percent"]),
                "z_score": round(float(row["z_score"]), 2),
                "weather": row["weather"],
                "temperature": float(row["temperature"]),
                "air_quality": int(row["air_quality"]),
                "explanation": (
                    f"Le trafic est {abs(row['difference_percent']):.1f}% "
                    f"{direction} à la moyenne historique. "
                    f"Météo observée : {row['weather']}."
                ),
            }
        )

    return results


def calculate_data_quality() -> dict:
    df = load_traffic_data()

    missing_values = int(df.isna().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    invalid_traffic = int(
        (df["traffic_count"] < 0).sum()
    )

    invalid_temperature = int(
        ((df["temperature"] < -50) | (df["temperature"] > 60)).sum()
    )

    invalid_coordinates = int(
        (
            (df["latitude"] < -90)
            | (df["latitude"] > 90)
            | (df["longitude"] < -180)
            | (df["longitude"] > 180)
        ).sum()
    )

    total_cells = df.shape[0] * df.shape[1]
    valid_cells = total_cells - missing_values

    quality_score = round((valid_cells / total_cells) * 100, 2)

    return {
        "quality_score": quality_score,
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "missing_values": missing_values,
        "duplicate_rows": duplicate_rows,
        "invalid_traffic_values": invalid_traffic,
        "invalid_temperature_values": invalid_temperature,
        "invalid_coordinate_values": invalid_coordinates,
    }