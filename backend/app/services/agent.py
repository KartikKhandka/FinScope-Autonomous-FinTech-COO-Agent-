from app.schemas import AskCOORequest, AskCOOResponse
from app.models import UploadedDataset
from app.services.datasets import load_metrics, _fmt
from typing import Any, Dict, List


def ask_coo_agent(payload: AskCOORequest, dataset: UploadedDataset | None = None) -> AskCOOResponse:
    question = payload.question.strip()
    q_lower = question.lower()
    metrics = load_metrics(dataset)

    if not metrics:
        return AskCOOResponse(
            answer=(
                "No dataset has been uploaded yet. Please go to the Data page and upload your company data "
                "(CSV, JSON, PDF, etc.) so I can provide data-driven insights specific to your business."
            )
        )

    numeric_summary = metrics.get("numeric_summary") or {}
    keyword_counts = metrics.get("keyword_counts") or {}
    columns = metrics.get("columns") or []
    row_count = metrics.get("row_count", 0)
    revenue_insights = metrics.get("revenue_insights") or []
    churn_insights = metrics.get("churn_insights") or []
    churn_drivers = metrics.get("churn_drivers") or []
    fraud_insights = metrics.get("fraud_insights") or []
    cashflow_risk = metrics.get("cashflow_risk") or ""
    top_kpis = metrics.get("top_kpis") or []
    churn_probability = metrics.get("churn_probability", 0)
    fraud_score = metrics.get("fraud_score", 0)

    # ----- Revenue questions -----
    if any(kw in q_lower for kw in ["revenue", "sales", "income", "earning"]):
        parts = [f"Based on your uploaded dataset ({row_count} records, {len(columns)} columns):\n"]
        for insight in revenue_insights[:5]:
            parts.append(f"• {insight}")
        if top_kpis:
            rev_kpi = next((k for k in top_kpis if k["label"].lower() in ["revenue", "sales", "income"]), None)
            if rev_kpi:
                parts.append(f"\nCurrent {rev_kpi['label']}: {_fmt(rev_kpi['value'])} (trend: {rev_kpi['change']:.1f}%)")
        answer = "\n".join(parts)

    # ----- Profit / margin questions -----
    elif any(kw in q_lower for kw in ["profit", "margin", "net income"]):
        parts = [f"Profit analysis from your dataset ({row_count} records):\n"]
        profit_insights = [i for i in revenue_insights if any(w in i.lower() for w in ["profit", "margin"])]
        if profit_insights:
            for insight in profit_insights:
                parts.append(f"• {insight}")
        else:
            for col, stats in numeric_summary.items():
                if any(w in col.lower() for w in ["profit", "margin", "net"]):
                    parts.append(f"• {col}: total {_fmt(stats['total'])}, avg {_fmt(stats['average'])}, latest {_fmt(stats['latest'])}, trend {stats['trend_pct']:.1f}%")
        if not profit_insights and len(parts) == 1:
            parts.append("• No profit-specific columns detected. Upload data with 'profit' or 'margin' columns for detailed analysis.")
        answer = "\n".join(parts)

    # ----- Expense / cost questions -----
    elif any(kw in q_lower for kw in ["expense", "cost", "spending", "burn"]):
        parts = [f"Expense analysis from your dataset:\n"]
        for col, stats in numeric_summary.items():
            if any(w in col.lower() for w in ["expense", "cost", "spend"]):
                parts.append(f"• {col}: total {_fmt(stats['total'])}, avg {_fmt(stats['average'])}, trend {stats['trend_pct']:.1f}%")
        if cashflow_risk:
            parts.append(f"\nCash flow risk assessment: {cashflow_risk}")
        if len(parts) == 1:
            parts.append("• No expense-specific columns found. Upload data with 'expense' or 'cost' columns.")
        answer = "\n".join(parts)

    # ----- Churn / customer questions -----
    elif any(kw in q_lower for kw in ["churn", "customer", "retention", "attrition"]):
        parts = [f"Customer/Churn analysis from your dataset ({row_count} records):\n"]
        parts.append(f"Overall churn probability: {churn_probability * 100:.1f}%\n")
        if churn_insights:
            parts.append("High-risk segments:")
            for insight in churn_insights[:5]:
                parts.append(f"• {insight}")
        if churn_drivers:
            parts.append("\nKey churn drivers:")
            for driver in churn_drivers[:4]:
                parts.append(f"• {driver}")
        answer = "\n".join(parts)

    # ----- Fraud / risk questions -----
    elif any(kw in q_lower for kw in ["fraud", "risk", "anomal", "suspicious"]):
        parts = [f"Risk/Fraud analysis from your dataset ({row_count} records):\n"]
        parts.append(f"Fraud risk score: {fraud_score * 100:.1f}%\n")
        if fraud_insights:
            for insight in fraud_insights[:5]:
                parts.append(f"• {insight}")
        answer = "\n".join(parts)

    # ----- Cash flow / forecast questions -----
    elif any(kw in q_lower for kw in ["cash", "forecast", "predict", "future", "trend"]):
        parts = ["Cash flow and forecast analysis:\n"]
        if cashflow_risk:
            parts.append(cashflow_risk)
        rev_series = metrics.get("revenue_series") or []
        if rev_series and len(rev_series) >= 2:
            first_val = rev_series[0]["value"]
            last_val = rev_series[-1]["value"]
            change = ((last_val - first_val) / max(abs(first_val), 0.01)) * 100
            parts.append(f"\nRevenue series: {len(rev_series)} data points, overall change: {change:.1f}%")
            parts.append(f"Latest value: {_fmt(last_val)}, starting value: {_fmt(first_val)}")
        answer = "\n".join(parts)

    # ----- Loan / default questions -----
    elif any(kw in q_lower for kw in ["loan", "default", "credit", "repayment"]):
        parts = ["Loan/Default analysis:\n"]
        for col, stats in numeric_summary.items():
            if any(w in col.lower() for w in ["loan", "default", "credit", "repayment", "risk_score"]):
                parts.append(f"• {col}: total {_fmt(stats['total'])}, avg {_fmt(stats['average'])}, latest {_fmt(stats['latest'])}, range [{_fmt(stats['min'])} - {_fmt(stats['max'])}]")
        if len(parts) == 1:
            parts.append("• No loan-specific columns found. Upload data with loan/credit columns for analysis.")
        answer = "\n".join(parts)

    # ----- KPI / dashboard / summary questions -----
    elif any(kw in q_lower for kw in ["kpi", "dashboard", "summary", "overview", "performance", "metric"]):
        parts = [f"Dataset overview ({row_count} records, columns: {', '.join(columns[:10])}):\n"]
        parts.append("Key Performance Indicators:")
        for kpi in top_kpis[:5]:
            trend_arrow = "↑" if kpi["trend"] == "up" else "↓"
            parts.append(f"• {kpi['label']}: {_fmt(kpi['value'])} {trend_arrow} {kpi['change']:.1f}%")
        parts.append(f"\nChurn probability: {churn_probability * 100:.1f}%")
        parts.append(f"Fraud risk score: {fraud_score * 100:.1f}%")
        answer = "\n".join(parts)

    # ----- Column / data structure questions -----
    elif any(kw in q_lower for kw in ["column", "field", "data", "structure", "what data", "what column"]):
        parts = [f"Your dataset '{metrics.get('filename', 'uploaded file')}' contains {row_count} records with {len(columns)} columns:\n"]
        for col in columns:
            if col in numeric_summary:
                stats = numeric_summary[col]
                parts.append(f"• {col} (numeric): avg {_fmt(stats['average'])}, range [{_fmt(stats['min'])} - {_fmt(stats['max'])}]")
            else:
                parts.append(f"• {col} (text/categorical)")
        answer = "\n".join(parts)

    # ----- Generic / recommendation questions -----
    else:
        parts = [f"Based on your dataset ({row_count} records, {len(columns)} columns):\n"]

        # Show top KPIs
        if top_kpis:
            parts.append("Key metrics:")
            for kpi in top_kpis[:3]:
                trend_arrow = "↑" if kpi["trend"] == "up" else "↓"
                parts.append(f"• {kpi['label']}: {_fmt(kpi['value'])} {trend_arrow} {kpi['change']:.1f}%")

        # Show key findings
        findings = []
        if churn_probability > 0.1:
            findings.append(f"⚠ Churn rate is elevated at {churn_probability * 100:.1f}%")
        if fraud_score > 0.05:
            findings.append(f"⚠ Fraud risk score: {fraud_score * 100:.1f}%")
        for insight in revenue_insights[:2]:
            findings.append(f"📊 {insight}")

        if findings:
            parts.append("\nKey findings:")
            for f in findings:
                parts.append(f"• {f}")

        # Recommendation
        parts.append("\nAsk me about specific topics like 'revenue trends', 'churn analysis', 'fraud risk', or 'cash flow forecast' for deeper analysis.")
        answer = "\n".join(parts)

    return AskCOOResponse(answer=answer)
