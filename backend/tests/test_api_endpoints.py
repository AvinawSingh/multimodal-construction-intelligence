import pytest
from fastapi.testclient import TestClient

def test_health_endpoint(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "ai_configured" in data
    assert "weather_provider" in data

def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

# -------------------------------------------------------------
# Safety Monitor Tests
# -------------------------------------------------------------
def test_safety_analyze_valid_jpeg(client: TestClient, sample_image_bytes):
    response = client.post(
        "/api/safety/analyze",
        files={"file": ("site_photo.jpg", sample_image_bytes, "image/jpeg")},
        data={"observation": "Active column reinforcement zone on 2nd tier"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk_level" in data
    assert "safety_score" in data
    assert 0 <= data["safety_score"] <= 100
    assert len(data["detected_hazards"]) > 0
    assert "disclaimer" in data

def test_safety_analyze_invalid_type(client: TestClient):
    response = client.post(
        "/api/safety/analyze",
        files={"file": ("document.txt", b"plain text content", "text/plain")}
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]

def test_safety_analyze_empty_file(client: TestClient):
    response = client.post(
        "/api/safety/analyze",
        files={"file": ("empty.png", b"", "image/png")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_safety_analyze_missing_file(client: TestClient):
    response = client.post("/api/safety/analyze", data={"observation": "Test without file"})
    assert response.status_code == 422

# -------------------------------------------------------------
# Crack Detection Tests
# -------------------------------------------------------------
def test_crack_analyze_valid_png(client: TestClient, sample_png_bytes):
    response = client.post(
        "/api/crack/analyze",
        files={"file": ("crack.png", sample_png_bytes, "image/png")},
        data={"description": "Diagonal fissure across 230mm brick wall"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "crack_classification" in data
    assert "apparent_severity" in data
    assert len(data["recommended_next_steps"]) > 0
    assert "disclaimer" in data
    assert "licensed structural engineer" in data["disclaimer"].lower() or "professional" in data["disclaimer"].lower()

def test_crack_analyze_invalid_mime(client: TestClient):
    response = client.post(
        "/api/crack/analyze",
        files={"file": ("report.pdf", b"%PDF-1.5 test", "application/pdf")}
    )
    assert response.status_code == 400

# -------------------------------------------------------------
# Project Planner Tests
# -------------------------------------------------------------
def test_planner_calculate_valid(client: TestClient):
    payload = {
        "plot_length_ft": 40.0,
        "plot_width_ft": 60.0,
        "location": "Bengaluru",
        "construction_type": "Residential",
        "number_of_floors": 2,
        "quality_grade": "Standard",
        "generate_render": False
    }
    response = client.post("/api/planner/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_built_up_area_sqft"] > 0
    assert data["materials"]["cement_bags"] > 0
    assert data["materials"]["steel_tons"] > 0
    assert data["materials"]["concrete_volume_m3"] > 0
    assert data["cost_breakdown"]["total_estimated_cost_inr"] > 0
    assert len(data["schedule_phases"]) == 6

def test_planner_calculate_invalid_dimensions(client: TestClient):
    payload = {
        "plot_length_ft": -10.0,
        "plot_width_ft": 60.0,
        "number_of_floors": 2
    }
    response = client.post("/api/planner/calculate", json=payload)
    assert response.status_code == 422

# -------------------------------------------------------------
# Real Estate Valuation Tests
# -------------------------------------------------------------
def test_valuation_estimate_valid(client: TestClient):
    payload = {
        "location": "Indiranagar",
        "city": "Bengaluru",
        "property_area_sqft": 1500,
        "property_type": "Apartment",
        "building_age_years": 3,
        "condition": "Good / Well Maintained",
        "amenities": ["Covered Car Parking", "100% Power Backup"],
        "parking_spaces": 1
    }
    response = client.post("/api/valuation/estimate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_market_value_avg_inr"] > 0
    assert data["estimated_market_value_min_inr"] < data["estimated_market_value_max_inr"]
    assert data["indicative_monthly_rent_inr"] > 0
    assert data["gross_rental_yield_percent"] > 0
    assert len(data["valuation_drivers"]) > 0

def test_valuation_estimate_zero_area(client: TestClient):
    payload = {
        "location": "Bandra",
        "city": "Mumbai",
        "property_area_sqft": 0,
        "property_type": "Apartment"
    }
    response = client.post("/api/valuation/estimate", json=payload)
    assert response.status_code == 422

# -------------------------------------------------------------
# Knowledge Assistant Tests
# -------------------------------------------------------------
def test_knowledge_ask_valid(client: TestClient):
    payload = {
        "category": "Technique",
        "question": "What is the minimum curing duration for concrete slabs?"
    }
    response = client.post("/api/knowledge/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["answer"]) > 10
    assert len(data["key_points"]) > 0
    assert len(data["applicable_standards"]) > 0

def test_knowledge_ask_empty_question(client: TestClient):
    payload = {"category": "Safety", "question": "   "}
    response = client.post("/api/knowledge/ask", json=payload)
    assert response.status_code == 400

# -------------------------------------------------------------
# Construction Chatbot Tests
# -------------------------------------------------------------
def test_chat_message_valid(client: TestClient):
    payload = {
        "message": "What is the nominal ratio for M20 concrete?",
        "history": []
    }
    response = client.post("/api/chat/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["reply"]) > 10

def test_chat_message_empty(client: TestClient):
    payload = {"message": "   "}
    response = client.post("/api/chat/message", json=payload)
    assert response.status_code == 400

# -------------------------------------------------------------
# Daily Site Assistant Tests
# -------------------------------------------------------------
def test_daily_site_plan_valid(client: TestClient):
    payload = {
        "planned_activity": "Ground floor slab reinforcement and shuttering",
        "workforce_count": 12,
        "site_condition": "Normal Dry Ground"
    }
    response = client.post("/api/daily-site/plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["daily_task_breakdown"]) > 0
    assert len(data["site_safety_checklist"]) > 0
    assert len(data["required_materials_and_equipment"]) > 0

def test_daily_site_plan_empty_activity(client: TestClient):
    payload = {"planned_activity": "   "}
    response = client.post("/api/daily-site/plan", json=payload)
    assert response.status_code == 400

# -------------------------------------------------------------
# Weather Advisor Tests
# -------------------------------------------------------------
def test_weather_advisory_valid(client: TestClient):
    payload = {
        "location": "Mumbai",
        "planned_activity": "Concreting / Slab Pouring"
    }
    response = client.post("/api/weather/advisory", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["advisory_status"] in ["GO", "CAUTION", "NO-GO"]
    assert "weather" in data
    assert "temperature_c" in data["weather"]
    assert "wind_speed_kmh" in data["weather"]

def test_weather_advisory_empty_location(client: TestClient):
    payload = {
        "location": "",
        "planned_activity": "Concreting"
    }
    response = client.post("/api/weather/advisory", json=payload)
    assert response.status_code == 400
