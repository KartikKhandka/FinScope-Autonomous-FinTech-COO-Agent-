from app.schemas import ReportRequest, ReportResponse
from app.models import UploadedDataset
from app.services.datasets import load_metrics, _fmt
from typing import Optional


def generate_executive_report(payload: ReportRequest, dataset: Optional[UploadedDataset] = None) -> ReportResponse:
    metrics = load_metrics(dataset) if dataset else {}

    parts = [f"Executive report for {payload.period_start} to {payload.period_end}."]

    if metrics:
        row_count = metrics.get("row_count", 0)
        columns = metrics.get("columns", [])
        parts.append(f"Data source: {row_count} records across {len(columns)} columns.")

        # KPI summary
        top_kpis = metrics.get("top_kpis") or []
        if top_kpis:
            kpi_lines = []
            for kpi in top_kpis[:5]:
                trend_arrow = "↑" if kpi["trend"] == "up" else "↓"
                kpi_lines.append(f"{kpi['label']}: {_fmt(kpi['value'])} ({trend_arrow}{kpi['change']:.1f}%)")
            parts.append("KPIs: " + " | ".join(kpi_lines) + ".")

        # Risk summary
        churn_prob = metrics.get("churn_probability", 0)
        fraud_score = metrics.get("fraud_score", 0)
        if churn_prob > 0 or fraud_score > 0:
            parts.append(f"Risk indicators: Churn probability {churn_prob * 100:.1f}%, Fraud risk score {fraud_score * 100:.1f}%.")

        # Cash flow
        cashflow_risk = metrics.get("cashflow_risk", "")
        if cashflow_risk:
            parts.append(f"Cash flow assessment: {cashflow_risk[:200]}")

        # Revenue insights
        revenue_insights = metrics.get("revenue_insights") or []
        if revenue_insights:
            parts.append("Revenue highlights: " + " ".join(revenue_insights[:3]))
    else:
        parts.append("No dataset uploaded — report contains placeholder data. Upload company data for a data-driven report.")

    return ReportResponse(report_url="/reports/fintech_coo_report.pdf", summary=" ".join(parts))
