from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models
from app.api import router
from app.database import Base, engine

app = FastAPI(
    title="Autonomous FinTech COO Agent API",
    description="Backend services for fintech KPI monitoring, forecasting, churn prediction, fraud detection, and executive recommendations.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {"status": "ok"}
