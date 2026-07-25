from datetime import date
from typing import List, Optional
from pydantic import BaseModel

class RegisterRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class DatasetSummary(BaseModel):
    id: int
    filename: str
    content_type: str
    uploaded_at: str
    summary: List[str]
    columns: List[str] = []
    row_count: int = 0
    word_count: int = 0
    data_source: str = "uploaded"

class DatasetUploadResponse(BaseModel):
    dataset: DatasetSummary

class KpiCard(BaseModel):
    label: str
    value: float
    trend: str
    change: float

class DashboardResponse(BaseModel):
    revenue: List[dict]
    profit: List[dict]
    active_users: List[dict]
    churn_rate: float
    default_rate: float
    fraud_alerts: int
    kpis: List[KpiCard]

class RevenueAnalysisResponse(BaseModel):
    revenue_trend: List[dict]
    profit_trend: List[dict]
    growth_rate: List[dict]
    insights: List[str]

class ForecastResponse(BaseModel):
    forecast_30d: List[dict]
    forecast_60d: List[dict]
    forecast_90d: List[dict]
    risk_warning: str

class FraudAnalysisResponse(BaseModel):
    fraud_score: float
    fraud_trend: List[dict]
    suspicious_segments: List[str]

class ChurnAnalysisResponse(BaseModel):
    churn_probability: float
    high_risk_segments: List[str]
    drivers: List[str]

class ReportRequest(BaseModel):
    period_start: date
    period_end: date
    include_forecast: bool = True

class ReportResponse(BaseModel):
    report_url: str
    summary: str

class AskCOORequest(BaseModel):
    question: str

class AskCOOResponse(BaseModel):
    answer: str
