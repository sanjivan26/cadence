from fastapi import FastAPI

from app.api.routers.auth import router as auth_router
from app.api.routers.game import router as game_router

app = FastAPI(
    title="Cadence API",
    description="Backend API for the Cadence daily puzzle platform",
    version="0.1.0",
)


app.include_router(auth_router)
app.include_router(game_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "cadence-api",
    }