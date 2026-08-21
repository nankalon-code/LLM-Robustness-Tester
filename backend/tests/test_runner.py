import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "LLM Robustness Tester API is running"}

def test_list_targets():
    response = client.get("/api/targets/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_test_runs():
    response = client.get("/api/test-runs/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
