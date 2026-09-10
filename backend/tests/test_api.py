from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_kpis_endpoint():
    response = client.get("/api/kpis")

    assert response.status_code == 200

    data = response.json()

    assert "average_traffic" in data
    assert "maximum_traffic" in data
    assert "data_quality" in data


def test_traffic_endpoint():
    response = client.get("/api/traffic")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0


def test_anomalies_endpoint():
    response = client.get("/api/anomalies")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_quality_endpoint():
    response = client.get("/api/data-quality")

    assert response.status_code == 200

    data = response.json()

    assert "quality_score" in data
    assert "missing_values" in data


def test_live_endpoint():
    response = client.get("/api/live")

    assert response.status_code == 200

    data = response.json()

    assert data["city"] == "Abidjan"
    assert "coordinates" in data
    assert "data" in data
    assert "sources" in data