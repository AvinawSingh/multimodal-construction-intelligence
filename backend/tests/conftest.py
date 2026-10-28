import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
import sys
import os

# Ensure backend root is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def sample_image_bytes():
    """Generates a valid 100x100 RGB JPEG image in memory for testing."""
    img = Image.new("RGB", (100, 100), color=(255, 120, 0))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    buffer.seek(0)
    return buffer.getvalue()

@pytest.fixture
def sample_png_bytes():
    """Generates a valid 100x100 RGBA PNG image in memory for testing."""
    img = Image.new("RGBA", (100, 100), color=(50, 150, 250, 255))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.getvalue()
