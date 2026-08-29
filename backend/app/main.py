from fastapi import FastAPI

from app.api.routers.auth import router as auth_router
from app.api.routers.game import router as game_router
from app.api.routers.admin import router as admin_router

from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Cadence API",
    description="Backend API for the Cadence daily puzzle platform",
    version="0.1.0",
)

app.mount(
    "/images",
    StaticFiles(directory="app/static/images"),
    name="images",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://cadence-phi-flame.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(game_router)
app.include_router(admin_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "cadence-api",
    }