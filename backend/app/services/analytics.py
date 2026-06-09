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
from app.services.datasets import load_metrics, build_series, find_column, parse_number, _safe


def get_dashboard_metrics(dataset: Optional[UploadedDataset] = None) -> DashboardResponse:
    metrics = load_metrics(dataset)
    if not metrics:
        return _default_dashboard()

    numeric_summary = metrics.get("numeric_summary") or {}
    keyword_counts = metrics.get("keyword_counts") or {}
    rows_count = metrics.get("row_count", 0)

    # Revenue & Profit series from actual data
    revenue = metrics.get("revenue_series") or _build_series_from_summary(numeric_summary, ["revenue", "sales", "income", "amount"])
    profit = metrics.get("profit_series") or _build_series_from_summary(numeric_summary, ["profit", "margin", "net_income"])

    # Active users series
    active_users = _build_series_from_summary(numeric_summary, ["users", "customers", "accounts", "active_users"])
    if not active_users:
        active_users = [{"date": "Dataset", "value": float(rows_count)}]

    # Rates from actual flag columns stored at upload time
    churn_rate = metrics.get("churn_probability", 0.0)
    if churn_rate == 0:
        churn_rate = _ratio_from_keywords(keyword_counts, "churn", metrics)

    fraud_score = metrics.get("fraud_score", 0.0)
    fraud_alerts = int(keyword_counts.get("fraud", 0))
    if fraud_alerts == 0 and fraud_score > 0:
        fraud_alerts = max(1, int(fraud_score * rows_count)) if rows_count > 0 else 0

    default_rate = _compute_default_rate(numeric_summary, keyword_counts, metrics)

    # KPIs from real data
    kpis = metrics.get("top_kpis") or _fallback_kpis(metrics)

    return DashboardResponse(
        revenue=revenue or [{"date": "No data", "value": 0}],
        profit=profit or revenue or [{"date": "No data", "value": 0}],
        active_users=active_users,
        churn_rate=churn_rate,
        default_rate=default_rate,
        fraud_alerts=fraud_alerts,
        kpis=kpis,
    )


def get_revenue_analysis(dataset: Optional[UploadedDataset] = None) -> RevenueAnalysisResponse:
    metrics = load_metrics(dataset)
    if not metrics:
        return _default_revenue()

    numeric_summary = metrics.get("numeric_summary") or {}
    revenue = metrics.get("revenue_series") or _build_series_from_summary(numeric_summary, ["revenue", "sales", "income", "amount"])
    profit = metrics.get("profit_series") or _build_series_from_summary(numeric_summary, ["profit", "margin", "net_income"])

    # Use page-specific revenue insights — NOT the generic summary
    insights = metrics.get("revenue_insights") or []
    if not insights:
        insights = ["Upload a dataset with revenue/sales columns for detailed insights."]

    return RevenueAnalysisResponse(
        revenue_trend=revenue or [{"date": "No data", "value": 0}],
        profit_trend=profit or revenue or [{"date": "No data", "value": 0}],
        growth_rate=_build_growth_rate(revenue),
        insights=insights,
    )


def get_forecast(dataset: Optional[UploadedDataset] = None) -> ForecastResponse:
    metrics = load_metrics(dataset)
    source_series = metrics.get("revenue_series") or [] if metrics else []

    if source_series and len(source_series) >= 2:
        last_value = float(source_series[-1]["value"])
        avg_growth = _average_growth(source_series)
        base = date.today()
        forecast_30 = [
            {"date": str(base + timedelta(days=offset)), "value": round(last_value + avg_growth * offset, 2)}
            for offset in range(1, 31)
        ]
        forecast_60 = forecast_30 + [
            {"date": str(base + timedelta(days=30 + i)), "value": round(last_value + avg_growth * (30 + i), 2)}
            for i in range(30)
        ]
        forecast_90 = forecast_60 + [
            {"date": str(base + timedelta(days=60 + i)), "value": round(last_value + avg_growth * (60 + i), 2)}
            for i in range(30)
        ]

        # Use the page-specific risk assessment — NOT a hardcoded string
        risk_warning = ""
        if metrics:
            risk_warning = metrics.get("cashflow_risk", "")
        if not risk_warning:
            risk_warning = (
                f"Forecast extrapolates from {len(source_series)} data points with avg daily change of {avg_growth:,.0f}. "
                "Validate column mapping and business assumptions before using for decisions."
            )

        return ForecastResponse(
            forecast_30d=forecast_30,
            forecast_60d=forecast_60,
            forecast_90d=forecast_90,
            risk_warning=risk_warning,
        )

    # Fallback — single-point or no series
    if metrics and source_series:
        base_value = float(source_series[-1]["value"]) if source_series else 0
    elif metrics:
        # Try to get any numeric value to base the forecast on
        numeric_summary = metrics.get("numeric_summary") or {}
        base_value = 0
        for col, stats in numeric_summary.items():
            if stats.get("latest", 0) > 0:
                base_value = stats["latest"]
                break
    else:
        base_value = 0

    base = date.today()
    forecast_30 = [
        {"date": str(base + timedelta(days=d)), "value": round(base_value * (1 + 0.002 * d), 2)}
        for d in range(1, 31)
    ]
    forecast_60 = forecast_30 + [
        {"date": str(base + timedelta(days=30 + i)), "value": round(base_value * (1 + 0.002 * (30 + i)), 2)}
        for i in range(30)
    ]
    forecast_90 = forecast_60 + [
        {"date": str(base + timedelta(days=60 + i)), "value": round(base_value * (1 + 0.002 * (60 + i)), 2)}
        for i in range(30)
    ]

    risk_warning = metrics.get("cashflow_risk", "") if metrics else ""
    if not risk_warning:
        risk_warning = "Insufficient time-series data for reliable forecasting. Upload a dataset with date and revenue columns for better predictions."

    return ForecastResponse(
        forecast_30d=forecast_30,
        forecast_60d=forecast_60,
        forecast_90d=forecast_90,
        risk_warning=risk_warning,
    )


def get_fraud_analysis(dataset: Optional[UploadedDataset] = None) -> FraudAnalysisResponse:
    metrics = load_metrics(dataset)
    if not metrics:
        return _default_fraud()

    # Use page-specific fraud insights — NOT the generic summary
    suspicious_segments = metrics.get("fraud_insights") or []
    fraud_score = metrics.get("fraud_score", 0.0)

    if not suspicious_segments:
        keyword_counts = metrics.get("keyword_counts") or {}
        fraud_count = int(keyword_counts.get("fraud", 0))
        risk_count = int(keyword_counts.get("risk", 0))
        if fraud_count > 0 or risk_count > 0:
            suspicious_segments = [
                f"'fraud' keyword appears {fraud_count} times in the dataset.",
                f"'risk' keyword appears {risk_count} times in the dataset.",
            ]
        else:
            suspicious_segments = ["No fraud indicators detected in the current dataset."]

    # Fraud trend from series data
    fraud_trend = [{"date": "Current", "value": round(fraud_score * 100, 1)}]

    return FraudAnalysisResponse(
        fraud_score=fraud_score,
        fraud_trend=fraud_trend,
        suspicious_segments=suspicious_segments,
    )


def get_churn_analysis(dataset: Optional[UploadedDataset] = None) -> ChurnAnalysisResponse:
    metrics = load_metrics(dataset)
    if not metrics:
        return _default_churn()

    # Use page-specific churn insights — NOT the generic summary
    high_risk_segments = metrics.get("churn_insights") or []
    drivers = metrics.get("churn_drivers") or []
    churn_probability = metrics.get("churn_probability", 0.0)

    if not high_risk_segments:
        high_risk_segments = ["No churn-specific data detected. Upload data with 'churn_flag' column for analysis."]
    if not drivers:
        drivers = ["Insufficient data for churn driver analysis. Include numeric feature columns alongside a churn flag."]

    return ChurnAnalysisResponse(
        churn_probability=churn_probability,
        high_risk_segments=high_risk_segments,
        drivers=drivers,
    )


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def _build_series_from_summary(numeric_summary: Dict[str, Dict[str, float]], names: List[str]) -> List[dict]:
    """Build a minimal series from numeric_summary for columns matching names."""
    for column, values in numeric_summary.items():
        normalized = column.lower().replace(" ", "_")
        if any(name in normalized for name in names):
            return [{"date": "Latest", "value": float(values.get("latest", 0))}]
    return []


def _build_growth_rate(series: List[dict]) -> List[dict]:
    if len(series) < 2:
        return [{"date": "N/A", "value": 0}]
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


def _ratio_from_keywords(keyword_counts: Dict[str, int], keyword: str, metrics: Dict[str, Any]) -> float:
    return min(0.75, round(float(keyword_counts.get(keyword, 0)) / max(float(metrics.get("word_count", 1)), 1) * 10, 3))


def _compute_default_rate(
    numeric_summary: Dict[str, Dict[str, float]],
    keyword_counts: Dict[str, int],
    metrics: Dict[str, Any],
) -> float:
    """Compute default rate from data or keywords."""
    # Check if there's a default-related column with rate-like values
    for col, stats in numeric_summary.items():
        col_lower = col.lower().replace(" ", "_")
        if "default" in col_lower and 0 <= stats.get("average", 0) <= 1:
            return _safe(stats["average"])
    return _ratio_from_keywords(keyword_counts, "default", metrics)


def _fallback_kpis(metrics: Dict[str, Any]) -> List[dict]:
    return [
        {"label": "Uploaded Rows", "value": float(metrics.get("row_count") or 0), "trend": "up", "change": 0},
        {"label": "Extracted Words", "value": float(metrics.get("word_count") or 0), "trend": "up", "change": 0},
        {"label": "Business Themes", "value": float(sum(1 for v in (metrics.get("keyword_counts") or {}).values() if v)), "trend": "up", "change": 0},
    ]


# ---------------------------------------------------------------------------
# Default (no-dataset) responses
# ---------------------------------------------------------------------------

def _default_dashboard() -> DashboardResponse:
    return DashboardResponse(
        revenue=[{"date": "No dataset", "value": 0}],
        profit=[{"date": "No dataset", "value": 0}],
        active_users=[{"date": "No dataset", "value": 0}],
        churn_rate=0,
        default_rate=0,
        fraud_alerts=0,
        kpis=[
            {"label": "Revenue", "value": 0, "trend": "up", "change": 0},
            {"label": "Profit", "value": 0, "trend": "up", "change": 0},
            {"label": "Customers", "value": 0, "trend": "up", "change": 0},
        ],
    )


def _default_revenue() -> RevenueAnalysisResponse:
    return RevenueAnalysisResponse(
        revenue_trend=[{"date": "No dataset", "value": 0}],
        profit_trend=[{"date": "No dataset", "value": 0}],
        growth_rate=[{"date": "N/A", "value": 0}],
        insights=["No dataset uploaded yet. Upload a CSV or JSON file from the Data page to see revenue analytics."],
    )


def _default_fraud() -> FraudAnalysisResponse:
    return FraudAnalysisResponse(
        fraud_score=0,
        fraud_trend=[{"date": "No dataset", "value": 0}],
        suspicious_segments=["No dataset uploaded yet. Upload data with fraud_flag or risk_score columns for fraud analysis."],
    )


def _default_churn() -> ChurnAnalysisResponse:
    return ChurnAnalysisResponse(
        churn_probability=0,
        high_risk_segments=["No dataset uploaded yet. Upload data with churn_flag and customer segment columns for churn analysis."],
        drivers=["Upload a structured dataset to enable churn driver analysis."],
    )
