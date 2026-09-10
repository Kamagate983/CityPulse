from pathlib import Path

import pandas as pd


DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "traffic.csv"


def load_traffic_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)

    df["date"] = pd.to_datetime(df["date"])

    df = df.sort_values("date")

    return df


def get_traffic_data() -> list[dict]:
    df = load_traffic_data()

    df["date"] = df["date"].dt.strftime("%Y-%m-%d")

    return df.to_dict(orient="records")


def calculate_kpis() -> dict:
    df = load_traffic_data()

    average_traffic = round(df["traffic_count"].mean(), 2)
    maximum_traffic = int(df["traffic_count"].max())
    minimum_traffic = int(df["traffic_count"].min())

    return {
        "average_traffic": average_traffic,
        "maximum_traffic": maximum_traffic,
        "minimum_traffic": minimum_traffic,
        "total_days": len(df),
        "data_quality": 100.0,
    }