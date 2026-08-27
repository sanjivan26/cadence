from fastapi import FastAPI


app = FastAPI(
    title="Cadence API",
    description="Backend API for the Cadence daily puzzle platform",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "cadence-api",
    }