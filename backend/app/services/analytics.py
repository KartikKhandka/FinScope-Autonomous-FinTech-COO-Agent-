from datetime import date, timedelta
from typing import Any, Dict, List, Optional

from app.models import UploadedDataset
from app.schemas import (
    DashboardResponse,
    RevenueAnalysisResponse,
    ForecastResponse,
    FraudAnalysisResponse,
    ChurnAnalysisResponse,
)
from app.services.datasets import load_metrics, _safe


def get_dashboard_metrics(dataset: Optional[UploadedDataset] = None) -> DashboardResponse:
    metrics = load_metrics(dataset)
    if not metrics:
        return DashboardResponse(
            revenue=[], profit=[], active_users=[], churn_rate=0.0, default_rate=0.0, fraud_alerts=0, kpis=[]
        )

    numeric_summary = metrics.get("numeric_summary") or {}
    keyword_counts = metrics.get("keyword_counts") or {}
    rows_count = metrics.get("row_count", 0)

    revenue = metrics.get("revenue_series") or _build_series_from_summary(numeric_summary, ["revenue", "sales", "income", "amount"])
    profit = metrics.get("profit_series") or _build_series_from_summary(numeric_summary, ["profit", "margin", "net_income"])
    active_users = _build_series_from_summary(numeric_summary, ["users", "customers", "accounts", "active_users"])

    churn_rate = metrics.get("churn_probability", 0.0)
    fraud_score = metrics.get("fraud_score", 0.0)
    fraud_alerts = int(fraud_score * rows_count) if rows_count > 0 else 0
    default_rate = _compute_default_rate(numeric_summary)

    kpis = metrics.get("top_kpis") or []

    return DashboardResponse(
        revenue=revenue,
        profit=profit,
        active_users=active_users,
        churn_rate=churn_rate,
        default_rate=default_rate,
        fraud_alerts=fraud_alerts,
        kpis=kpis,
    )


def get_revenue_analysis(dataset: Optional[UploadedDataset] = None) -> RevenueAnalysisResponse:
    metrics = load_metrics(dataset)
    if not metrics:
        return RevenueAnalysisResponse(revenue_trend=[], profit_trend=[], growth_rate=[], insights=[])

    numeric_summary = metrics.get("numeric_summary") or {}
    revenue = metrics.get("revenue_series") or _build_series_from_summary(numeric_summary, ["revenue", "sales", "income", "amount"])
    profit = metrics.get("profit_series") or _build_series_from_summary(numeric_summary, ["profit", "margin", "net_income"])
    insights = metrics.get("revenue_insights") or []

    return RevenueAnalysisResponse(
        revenue_trend=revenue,
        profit_trend=profit,
        growth_rate=_build_growth_rate(revenue),
        insights=insights,
    )


def get_forecast(dataset: Optional[UploadedDataset] = None) -> ForecastResponse:
    metrics = load_metrics(dataset)
    if not metrics:
        return ForecastResponse(forecast_30d=[], forecast_60d=[], forecast_90d=[], risk_warning="")

    source_series = metrics.get("revenue_series") or []
    if len(source_series) >= 2:
        last_value = float(source_series[-1]["value"])
        avg_growth = _average_growth(source_series)
        base = date.today()
        forecast_30 = [{"date": str(base + timedelta(days=offset)), "value": round(last_value + avg_growth * offset, 2)} for offset in range(1, 31)]
        forecast_60 = forecast_30 + [{"date": str(base + timedelta(days=30 + i)), "value": round(last_value + avg_growth * (30 + i), 2)} for i in range(30)]
        forecast_90 = forecast_60 + [{"date": str(base + timedelta(days=60 + i)), "value": round(last_value + avg_growth * (60 + i), 2)} for i in range(30)]

        risk_warning = metrics.get("cashflow_risk", "")
        return ForecastResponse(forecast_30d=forecast_30, forecast_60d=forecast_60, forecast_90d=forecast_90, risk_warning=risk_warning)
    
    return ForecastResponse(forecast_30d=[], forecast_60d=[], forecast_90d=[], risk_warning="")


def get_fraud_analysis(dataset: Optional[UploadedDataset] = None) -> FraudAnalysisResponse:
    metrics = load_metrics(dataset)
    if not metrics:
        return FraudAnalysisResponse(fraud_score=0.0, fraud_trend=[], suspicious_segments=[])

    suspicious_segments = metrics.get("fraud_insights") or []
    fraud_score = metrics.get("fraud_score", 0.0)
    fraud_trend = [{"date": "Current", "value": round(fraud_score * 100, 1)}]

    return FraudAnalysisResponse(
        fraud_score=fraud_score,
        fraud_trend=fraud_trend,
        suspicious_segments=suspicious_segments,
    )


def get_churn_analysis(dataset: Optional[UploadedDataset] = None) -> ChurnAnalysisResponse:
    metrics = load_metrics(dataset)
    if not metrics:
        return ChurnAnalysisResponse(churn_probability=0.0, high_risk_segments=[], drivers=[])

    high_risk_segments = metrics.get("churn_insights") or []
    drivers = metrics.get("churn_drivers") or []
    churn_probability = metrics.get("churn_probability", 0.0)

    return ChurnAnalysisResponse(
        churn_probability=churn_probability,
        high_risk_segments=high_risk_segments,
        drivers=drivers,
    )


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def _build_series_from_summary(numeric_summary: Dict[str, Dict[str, float]], names: List[str]) -> List[dict]:
    for column, values in numeric_summary.items():
        normalized = column.lower().replace(" ", "_")
        if any(name in normalized for name in names):
            return [{"date": "Latest", "value": float(values.get("latest", 0))}]
    return []


def _build_growth_rate(series: List[dict]) -> List[dict]:
    if len(series) < 2:
        return []
    rates = []
    previous = float(series[0]["value"])
    for point in series[1:]:
        current = float(point["value"])
        rate = 0 if previous == 0 else ((current - previous) / previous) * 100
        rates.append({"date": point["date"], "value": round(rate, 2)})
        previous = current
    return rates


def _average_growth(series: List[dict]) -> float:
    if len(series) < 2:
        return 0
    changes = [float(series[i]["value"]) - float(series[i - 1]["value"]) for i in range(1, len(series))]
    return sum(changes) / len(changes)


def _compute_default_rate(numeric_summary: Dict[str, Dict[str, float]]) -> float:
    for col, stats in numeric_summary.items():
        col_lower = col.lower().replace(" ", "_")
        if "default" in col_lower and 0 <= stats.get("average", 0) <= 1:
            return _safe(stats["average"])
    return 0.0
