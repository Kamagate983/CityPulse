import sqlite3
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
DATABASE_PATH = DATA_DIR / "citypulse.db"


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row

    return connection


def initialize_database() -> None:
    connection = get_connection()

    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS observations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            category TEXT NOT NULL,
            metric TEXT NOT NULL,
            value REAL,
            unit TEXT,
            latitude REAL,
            longitude REAL,
            observed_at TEXT NOT NULL,
            received_at TEXT NOT NULL,
            UNIQUE(source, category, metric, observed_at)
        );

        CREATE TABLE IF NOT EXISTS sync_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            status TEXT NOT NULL,
            message TEXT,
            started_at TEXT NOT NULL,
            finished_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_observations_observed_at
        ON observations(observed_at);

        CREATE INDEX IF NOT EXISTS idx_observations_category
        ON observations(category);
        """
    )

    connection.commit()
    connection.close()