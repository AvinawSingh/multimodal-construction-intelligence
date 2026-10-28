import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import get_settings
from routers import health, safety, crack, planner, valuation, knowledge, chat, daily_site, weather

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("construction_intelligence")

settings = get_settings()

app = FastAPI(
    title="Multimodal Construction Intelligence Platform",
    description="SkillWallet AI backend delivering vision-based safety audits, structural crack forensics, project planning, valuation, and site intelligence.",
    version="1.0.0"
)

# CORS Middleware setup
origins = settings.cors_origin_list
if "*" not in origins and "http://localhost:5173" not in origins:
    origins.append("http://localhost:5173")
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")
if "http://127.0.0.1:5173" not in origins:
    origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request. Please try again or check site inputs."
        }
    )

# Include API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(safety.router, prefix="/api")
app.include_router(crack.router, prefix="/api")
app.include_router(planner.router, prefix="/api")
app.include_router(valuation.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(daily_site.router, prefix="/api")
app.include_router(weather.router, prefix="/api")

@app.get("/")
def root():
    return {
        "name": "Multimodal Construction Intelligence Platform API",
        "status": "online",
        "documentation": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
