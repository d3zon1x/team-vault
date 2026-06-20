from fastapi import FastAPI

from app.api.router import api_router

app = FastAPI(
    title="TeamVault API",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")