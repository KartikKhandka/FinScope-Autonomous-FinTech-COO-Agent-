import csv
import io
import json
import math
import os
import re
import tempfile
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models import UploadedDataset

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    from docx import Document
except ImportError:
    Document = None

MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024 * 1024  # 2.5 GB
KEYWORDS = ["revenue", "profit", "expense", "cash", "customer", "churn", "risk", "fraud", "loan", "default"]

# ---------------------------------------------------------------------------
# Public CRUD helpers
# ---------------------------------------------------------------------------

async def stream_upload_to_disk(file: UploadFile) -> str:
    fd, temp_path = tempfile.mkstemp()
    total_size = 0
    with os.fdopen(fd, 'wb') as f:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            total_size += len(chunk)
            if total_size > MAX_UPLOAD_BYTES:
                os.unlink(temp_path)
                raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File must be 2.5GB or smaller")
            f.write(chunk)
    
    if total_size == 0:
        os.unlink(temp_path)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
        
    return temp_path

async def create_dataset_from_upload(db: Session, username: str, file: UploadFile) -> UploadedDataset:
    filename = file.filename or "uploaded-file"
    content_type = file.content_type or "application/octet-stream"
    
    temp_path = await stream_upload_to_disk(file)
    try:
        extracted_text, structured_rows, total_row_count = extract_file_content_from_disk(
            filename, content_type, temp_path
        )
        metrics = build_dataset_metrics(filename, extracted_text, structured_rows)
        metrics["row_count"] = total_row_count
        
        dataset = UploadedDataset(
            owner_username=username,
            filename=filename,
            content_type=content_type,
            extracted_text=extracted_text[:1000000],
            metrics_json=json.dumps(metrics),
            uploaded_at=datetime.utcnow(),
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)


def get_latest_dataset(db: Session, username: str) -> Optional[UploadedDataset]:
    return (
        db.query(UploadedDataset)
        .filter(UploadedDataset.owner_username == username)
        .order_by(UploadedDataset.uploaded_at.desc())
        .first()
    )


def list_datasets(db: Session, username: str) -> List[UploadedDataset]:
    return (
        db.query(UploadedDataset)
        .filter(UploadedDataset.owner_username == username)
        .order_by(UploadedDataset.uploaded_at.desc())
        .all()
    )


def dataset_to_summary(dataset: UploadedDataset) -> Dict[str, Any]:
    metrics = load_metrics(dataset)
    return {
        "id": dataset.id,
        "filename": dataset.filename,
        "content_type": dataset.content_type,
        "uploaded_at": dataset.uploaded_at.isoformat(),
        "summary": metrics.get("summary", []),
        "columns": metrics.get("columns", []),
        "row_count": metrics.get("row_count", 0),
        "word_count": metrics.get("word_count", 0),
        "data_source": "uploaded",
    }


def load_metrics(dataset: Optional[UploadedDataset]) -> Dict[str, Any]:
    if not dataset:
        return {}
    try:
        return json.loads(dataset.metrics_json)
    except json.JSONDecodeError:
        return {}


# ---------------------------------------------------------------------------
# File extraction helpers
# ---------------------------------------------------------------------------

def extract_file_content_from_disk(filename: str, content_type: str, path: str) -> Tuple[str, List[Dict[str, Any]], int]:
    lower_name = filename.lower()
    
    if lower_name.endswith(".csv") or "csv" in content_type:
        rows, total_count = parse_csv_rows_from_disk(path)
        text = extract_text_sample_from_disk(path)
        return text, rows, total_count
        
    if lower_name.endswith(".json") or "json" in content_type:
        rows, total_count = parse_json_rows_from_disk(path)
        text = extract_text_sample_from_disk(path)
        return text, rows, total_count
    
    with open(path, "rb") as f:
        content = f.read(10 * 1024 * 1024)
        
    text = decode_text(content)
    if lower_name.endswith((".txt", ".md", ".html", ".htm")) or content_type.startswith("text/"):
        return text, [], 0
    if lower_name.endswith(".pdf") or content_type == "application/pdf":
        return extract_pdf_text(content), [], 0
    if lower_name.endswith(".docx") or "wordprocessingml" in content_type:
        return extract_docx_text(content), [], 0
    return text, [], 0


def decode_text(content: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    return content.decode("utf-8", errors="ignore")


def extract_pdf_text(content: bytes) -> str:
    if PdfReader is None:
        return extract_printable_text(content, "PDF uploaded. Install pypdf for higher quality PDF text extraction.")
    try:
        reader = PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages).strip()
        return text or "PDF uploaded successfully, but no selectable text was found."
    except Exception:
        return extract_printable_text(content, "PDF uploaded. Install pypdf for higher quality PDF text extraction.")


def extract_docx_text(content: bytes) -> str:
    if Document is None:
        return extract_printable_text(content, "Word document uploaded. Install python-docx for higher quality DOCX text extraction.")
    try:
        document = Document(io.BytesIO(content))
        paragraphs = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
        text = "\n".join(paragraphs).strip()
        return text or "Word document uploaded successfully, but no paragraph text was found."
    except Exception:
        return extract_printable_text(content, "Word document uploaded. Install python-docx for higher quality DOCX text extraction.")


def extract_printable_text(content: bytes, fallback: str) -> str:
    text = decode_text(content)
    printable = re.sub(r"[^\x20-\x7E\n\r\t]+", " ", text)
    printable = re.sub(r"\s+", " ", printable).strip()
    return printable[:50000] if len(printable) > 80 else fallback


def extract_text_sample_from_disk(path: str, max_bytes=1000000) -> str:
    with open(path, "rb") as f:
        content = f.read(max_bytes)
    return decode_text(content)

def parse_csv_rows_from_disk(path: str, max_rows: int = 200000) -> Tuple[List[Dict[str, Any]], int]:
    rows = []
    total_count = 0
    
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            with open(path, "rt", encoding=encoding) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if total_count < max_rows:
                        rows.append(row)
                    total_count += 1
            return rows, total_count
        except UnicodeDecodeError:
            continue
        except csv.Error:
            return [], 0
            
    try:
        with open(path, "rt", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if total_count < max_rows:
                    rows.append(row)
                total_count += 1
        return rows, total_count
    except csv.Error:
        return [], 0

def parse_json_rows_from_disk(path: str, max_rows: int = 200000) -> Tuple[List[Dict[str, Any]], int]:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            data = json.load(f)
    except Exception:
        return [], 0
        
    rows = []
    if isinstance(data, list):
        for row in data:
            if isinstance(row, dict):
                rows.append(row)
    elif isinstance(data, dict):
        for value in data.values():
            if isinstance(value, list):
                for row in value:
                    if isinstance(row, dict):
                        rows.append(row)
                break
        if not rows:
            rows = [data]
            
    total_count = len(rows)
    return rows[:max_rows], total_count


# ---------------------------------------------------------------------------
# Numeric helpers
# ---------------------------------------------------------------------------

def parse_number(value: Any) -> Optional[float]:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = re.sub(r"[^0-9.\-]", "", str(value))
    if cleaned in ("", "-", ".", "-."):
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def _safe(val: float) -> float:
    """Return 0 for nan/inf values."""
    if math.isnan(val) or math.isinf(val):
        return 0.0
    return round(val, 2)


def find_column(row: Dict[str, Any], candidates: List[str]) -> Optional[str]:
    normalized = {key.lower().replace(" ", "_"): key for key in row.keys()}
    for candidate in candidates:
        if candidate in normalized:
            return normalized[candidate]
    for normalized_key, original_key in normalized.items():
        if any(candidate in normalized_key for candidate in candidates):
            return original_key
    return None


def _extract_column_values(rows: List[Dict[str, Any]], col: str) -> List[float]:
    """Extract all numeric values for a specific column."""
    values = []
    for row in rows:
        n = parse_number(row.get(col))
        if n is not None:
            values.append(n)
    return values


def _detect_bool_column(rows: List[Dict[str, Any]], candidates: List[str]) -> Optional[str]:
    """Find a boolean / 0-1 flag column matching any candidate name."""
    if not rows:
        return None
    col = find_column(rows[0], candidates)
    if col is None:
        return None
    # Verify it looks boolean-ish (all values are 0, 1, True, False, yes, no)
    for row in rows[:100]:
        raw = str(row.get(col, "")).strip().lower()
        if raw not in ("0", "1", "true", "false", "yes", "no", "0.0", "1.0", ""):
            return None  # not a flag column
    return col


def _flag_rate(rows: List[Dict[str, Any]], col: str) -> float:
    """Compute the True/1 rate for a boolean flag column."""
    total = 0
    positive = 0
    for row in rows:
        raw = str(row.get(col, "")).strip().lower()
        if raw in ("1", "true", "yes", "1.0"):
            positive += 1
            total += 1
        elif raw in ("0", "false", "no", "0.0"):
            total += 1
    return _safe(positive / max(total, 1))


# ---------------------------------------------------------------------------
# Series builders
# ---------------------------------------------------------------------------

def build_series(rows: List[Dict[str, Any]], value_names: List[str]) -> List[Dict[str, Any]]:
    if not rows:
        return []
    date_key = find_column(rows[0], ["date", "day", "month", "period", "timestamp", "year"])
    value_key = find_column(rows[0], value_names)
    if not value_key:
        return []
    series = []
    for index, row in enumerate(rows[-60:]):
        value = parse_number(row.get(value_key))
        if value is None:
            continue
        series.append({"date": str(row.get(date_key) or index + 1), "value": _safe(value)})
    return series


def summarize_numeric_columns(rows: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
    values: Dict[str, List[float]] = {}
    for row in rows:
        for key, value in row.items():
            number = parse_number(value)
            if number is not None:
                values.setdefault(key, []).append(number)
    result = {}
    for key, column_values in values.items():
        if not column_values:
            continue
        n = len(column_values)
        total = sum(column_values)
        avg = total / n
        sorted_vals = sorted(column_values)
        median = sorted_vals[n // 2] if n % 2 == 1 else (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2
        minimum = min(column_values)
        maximum = max(column_values)
        std = (sum((v - avg) ** 2 for v in column_values) / max(n - 1, 1)) ** 0.5
        latest = column_values[-1]
        # Trend: compare second half average to first half average
        half = n // 2
        if half > 0:
            first_half_avg = sum(column_values[:half]) / half
            second_half_avg = sum(column_values[half:]) / (n - half)
            trend_pct = ((second_half_avg - first_half_avg) / max(abs(first_half_avg), 0.01)) * 100
        else:
            trend_pct = 0
        result[key] = {
            "total": _safe(total),
            "average": _safe(avg),
            "median": _safe(median),
            "min": _safe(minimum),
            "max": _safe(maximum),
            "std": _safe(std),
            "latest": _safe(latest),
            "count": n,
            "trend_pct": _safe(trend_pct),
        }
    return result


# ---------------------------------------------------------------------------
# Page-specific insight builders
# ---------------------------------------------------------------------------

def _fmt(val: float) -> str:
    """Format a number for display — use commas and 2 decimal places."""
    if abs(val) >= 1_000_000:
        return f"${val:,.0f}"
    if abs(val) >= 1000:
        return f"{val:,.0f}"
    return f"{val:,.2f}"


def build_revenue_insights(
    rows: List[Dict[str, Any]],
    numeric_summary: Dict[str, Dict[str, float]],
    revenue_series: List[Dict[str, Any]],
    profit_series: List[Dict[str, Any]],
) -> List[str]:
    """Generate insights specific to the Revenue Analytics page."""
    insights: List[str] = []

    # Revenue column insights
    rev_col = find_column(rows[0], ["revenue", "sales", "income", "amount", "total_revenue"]) if rows else None
    if rev_col and rev_col in numeric_summary:
        stats = numeric_summary[rev_col]
        insights.append(
            f"Total {rev_col}: {_fmt(stats['total'])} across {stats['count']:.0f} records "
            f"(avg {_fmt(stats['average'])}, latest {_fmt(stats['latest'])})."
        )
        if stats["trend_pct"] > 2:
            insights.append(f"{rev_col} is trending upward by {stats['trend_pct']:.1f}% over the dataset period.")
        elif stats["trend_pct"] < -2:
            insights.append(f"{rev_col} is declining by {abs(stats['trend_pct']):.1f}% over the dataset period — investigate root causes.")
        else:
            insights.append(f"{rev_col} is relatively stable across the dataset (change: {stats['trend_pct']:.1f}%).")

    # Profit column insights
    profit_col = find_column(rows[0], ["profit", "net_income", "margin", "net_profit", "gross_profit"]) if rows else None
    if profit_col and profit_col in numeric_summary:
        stats = numeric_summary[profit_col]
        insights.append(
            f"Total {profit_col}: {_fmt(stats['total'])} "
            f"(avg {_fmt(stats['average'])}, range {_fmt(stats['min'])} to {_fmt(stats['max'])})."
        )
        if rev_col and rev_col in numeric_summary and numeric_summary[rev_col]["total"] > 0:
            margin = (stats["total"] / numeric_summary[rev_col]["total"]) * 100
            insights.append(f"Overall profit margin: {margin:.1f}%.")

    # Expense column insights
    exp_col = find_column(rows[0], ["expense", "expenses", "cost", "costs", "operating_expense"]) if rows else None
    if exp_col and exp_col in numeric_summary:
        stats = numeric_summary[exp_col]
        insights.append(f"Total {exp_col}: {_fmt(stats['total'])} (avg {_fmt(stats['average'])} per record).")

    # Growth rate from series
    if len(revenue_series) >= 2:
        first_val = revenue_series[0]["value"]
        last_val = revenue_series[-1]["value"]
        if first_val > 0:
            overall_growth = ((last_val - first_val) / first_val) * 100
            insights.append(f"Revenue grew {overall_growth:.1f}% from first to last data point in the series.")

    if not insights:
        # Fallback: show top numeric columns
        for col_name, stats in list(numeric_summary.items())[:3]:
            insights.append(f"{col_name}: total {_fmt(stats['total'])}, avg {_fmt(stats['average'])}, trend {stats['trend_pct']:.1f}%.")

    return insights or ["Upload a dataset with revenue, sales, or income columns for detailed revenue insights."]


def build_churn_insights(
    rows: List[Dict[str, Any]],
    numeric_summary: Dict[str, Dict[str, float]],
    keyword_counts: Dict[str, int],
) -> Tuple[List[str], List[str], float]:
    """Generate high-risk segments and drivers for the Customer Intelligence page.
    Returns (high_risk_segments, drivers, churn_probability).
    """
    segments: List[str] = []
    drivers: List[str] = []
    churn_probability = 0.0

    # Try to find a churn flag column
    churn_col = _detect_bool_column(rows, ["churn_flag", "churn", "churned", "is_churned", "has_churned"])
    if churn_col:
        rate = _flag_rate(rows, churn_col)
        churn_probability = rate
        segments.append(f"Overall churn rate from '{churn_col}': {rate * 100:.1f}%")
        if rate > 0.2:
            segments.append(f"CRITICAL: Churn rate exceeds 20% — immediate intervention needed.")
        elif rate > 0.1:
            segments.append(f"WARNING: Churn rate above 10% — proactive retention campaigns recommended.")
        else:
            segments.append(f"Churn rate is within healthy bounds (<10%).")

    # Look for customer segment columns
    seg_col = find_column(rows[0], ["segment", "category", "tier", "plan", "subscription", "account_type", "customer_type"]) if rows else None
    if seg_col and churn_col:
        # Compute churn rate per segment
        seg_churn: Dict[str, List[float]] = {}
        for row in rows:
            seg_val = str(row.get(seg_col, "Unknown")).strip()
            churn_val = str(row.get(churn_col, "")).strip().lower()
            is_churned = 1.0 if churn_val in ("1", "true", "yes", "1.0") else 0.0
            seg_churn.setdefault(seg_val, []).append(is_churned)
        for seg_name, values in sorted(seg_churn.items(), key=lambda x: sum(x[1]) / max(len(x[1]), 1), reverse=True)[:5]:
            seg_rate = sum(values) / max(len(values), 1) * 100
            segments.append(f"'{seg_name}' segment: {seg_rate:.1f}% churn rate ({len(values)} customers)")
    elif seg_col:
        # No churn flag, but show segment distribution
        seg_counts: Dict[str, int] = {}
        for row in rows:
            seg_val = str(row.get(seg_col, "Unknown")).strip()
            seg_counts[seg_val] = seg_counts.get(seg_val, 0) + 1
        for seg_name, count in sorted(seg_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            segments.append(f"'{seg_name}': {count} customers ({count / max(len(rows), 1) * 100:.1f}% of total)")

    # Drivers: look at numeric columns that correlate with churn
    if churn_col and rows:
        churn_flags = []
        for row in rows:
            raw = str(row.get(churn_col, "")).strip().lower()
            churn_flags.append(1.0 if raw in ("1", "true", "yes", "1.0") else 0.0)

        for col_name, stats in numeric_summary.items():
            if col_name == churn_col:
                continue
            col_values = _extract_column_values(rows, col_name)
            if len(col_values) != len(churn_flags) or len(col_values) < 10:
                continue
            # Simple correlation: compare average for churned vs non-churned
            churned_vals = [v for v, f in zip(col_values, churn_flags) if f == 1.0]
            non_churned_vals = [v for v, f in zip(col_values, churn_flags) if f == 0.0]
            if churned_vals and non_churned_vals:
                avg_churned = sum(churned_vals) / len(churned_vals)
                avg_non_churned = sum(non_churned_vals) / len(non_churned_vals)
                diff_pct = ((avg_churned - avg_non_churned) / max(abs(avg_non_churned), 0.01)) * 100
                if abs(diff_pct) > 5:
                    direction = "higher" if diff_pct > 0 else "lower"
                    drivers.append(
                        f"Churned customers have {abs(diff_pct):.1f}% {direction} '{col_name}' "
                        f"(avg {_fmt(avg_churned)} vs {_fmt(avg_non_churned)})."
                    )

    # Estimate churn probability from keyword counts if no flag column
    if not churn_col:
        churn_kw = keyword_counts.get("churn", 0)
        customer_kw = keyword_counts.get("customer", 0)
        total_words = sum(keyword_counts.values()) or 1
        churn_probability = min(0.85, round((churn_kw + customer_kw) / max(total_words, 1) * 0.5, 3))

    if not segments:
        segments = ["No churn-flag or customer-segment columns detected. Upload data with 'churn_flag' and 'segment' columns for detailed analysis."]
    if not drivers:
        drivers = ["No significant churn drivers detected. Ensure the dataset has a boolean 'churn_flag' column and numeric feature columns for correlation analysis."]

    return segments, drivers, churn_probability


def build_fraud_insights(
    rows: List[Dict[str, Any]],
    numeric_summary: Dict[str, Dict[str, float]],
    keyword_counts: Dict[str, int],
) -> Tuple[List[str], float]:
    """Generate suspicious segments and fraud score for the Risk Intelligence page.
    Returns (suspicious_segments, fraud_score).
    """
    segments: List[str] = []
    fraud_score = 0.0

    # Look for fraud flag column
    fraud_col = _detect_bool_column(rows, ["fraud_flag", "fraud", "is_fraud", "fraudulent"])
    if fraud_col:
        rate = _flag_rate(rows, fraud_col)
        fraud_score = rate
        segments.append(f"Fraud rate from '{fraud_col}' column: {rate * 100:.1f}% of transactions flagged.")
        if rate > 0.05:
            segments.append(f"ALERT: Fraud rate exceeds 5% — requires immediate review and enhanced monitoring.")
        elif rate > 0.01:
            segments.append(f"Elevated fraud rate ({rate * 100:.1f}%). Consider tightening detection thresholds.")

    # Look for risk score column
    risk_col = find_column(rows[0], ["risk_score", "risk", "risk_level", "risk_rating"]) if rows else None
    if risk_col and risk_col in numeric_summary:
        stats = numeric_summary[risk_col]
        segments.append(f"Risk scores: avg {_fmt(stats['average'])}, max {_fmt(stats['max'])}, std dev {_fmt(stats['std'])}.")
        high_risk_count = sum(1 for row in rows if (parse_number(row.get(risk_col)) or 0) > stats["average"] + stats["std"])
        segments.append(f"{high_risk_count} records ({high_risk_count / max(len(rows), 1) * 100:.1f}%) above high-risk threshold.")
        if not fraud_col:
            fraud_score = min(0.95, high_risk_count / max(len(rows), 1))

    # Try anomaly detection on numeric columns
    if rows and len(rows) >= 20:
        try:
            import numpy as np
            from sklearn.ensemble import IsolationForest

            # Extract numeric matrix
            numeric_cols = [col for col, stats in numeric_summary.items() if stats["count"] >= len(rows) * 0.5][:10]
            if numeric_cols:
                matrix = []
                for row in rows:
                    row_vals = []
                    for col in numeric_cols:
                        val = parse_number(row.get(col))
                        row_vals.append(val if val is not None else 0.0)
                    matrix.append(row_vals)
                data_array = np.array(matrix)
                # Normalize
                col_std = data_array.std(axis=0)
                col_std[col_std == 0] = 1
                data_normalized = (data_array - data_array.mean(axis=0)) / col_std

                model = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
                labels = model.fit_predict(data_normalized)
                anomaly_count = int(np.sum(labels == -1))
                anomaly_pct = anomaly_count / len(rows) * 100
                segments.append(f"ML anomaly detection: {anomaly_count} anomalous records found ({anomaly_pct:.1f}% of dataset).")

                if not fraud_col and not risk_col:
                    fraud_score = min(0.95, anomaly_count / max(len(rows), 1))

                # Identify which columns contributed most to anomalies
                anomaly_mask = labels == -1
                if anomaly_count > 0:
                    anomaly_means = data_array[anomaly_mask].mean(axis=0)
                    normal_means = data_array[~anomaly_mask].mean(axis=0)
                    deviations = []
                    for i, col in enumerate(numeric_cols):
                        if abs(normal_means[i]) > 0.01:
                            dev = abs(anomaly_means[i] - normal_means[i]) / max(abs(normal_means[i]), 0.01) * 100
                            deviations.append((col, dev, anomaly_means[i], normal_means[i]))
                    deviations.sort(key=lambda x: x[1], reverse=True)
                    for col, dev, anom_avg, norm_avg in deviations[:3]:
                        direction = "higher" if anom_avg > norm_avg else "lower"
                        segments.append(f"Anomalous records show {dev:.0f}% {direction} '{col}' (avg {_fmt(anom_avg)} vs normal {_fmt(norm_avg)}).")
        except Exception:
            pass  # ML libraries not available or data issue

    # Amount column analysis
    amt_col = find_column(rows[0], ["amount", "transaction_amount", "value", "total"]) if rows else None
    if amt_col and amt_col in numeric_summary:
        stats = numeric_summary[amt_col]
        if stats["max"] > stats["average"] * 5 and stats["max"] > 0:
            segments.append(
                f"High-value outliers detected in '{amt_col}': max {_fmt(stats['max'])} is "
                f"{stats['max'] / max(stats['average'], 0.01):.1f}x the average ({_fmt(stats['average'])})."
            )

    if not fraud_col and not risk_col:
        fraud_kw = keyword_counts.get("fraud", 0)
        risk_kw = keyword_counts.get("risk", 0)
        if fraud_kw > 0 or risk_kw > 0:
            segments.append(f"Keyword analysis: 'fraud' appears {fraud_kw} times, 'risk' appears {risk_kw} times in the dataset text.")
            if fraud_score == 0:
                fraud_score = min(0.5, (fraud_kw + risk_kw) / max(sum(keyword_counts.values()), 1))

    if not segments:
        segments = ["No fraud_flag, risk_score, or sufficient numeric data for anomaly detection. Upload data with these columns for fraud analysis."]

    return segments, max(fraud_score, 0.01)


def build_cashflow_risk(
    rows: List[Dict[str, Any]],
    numeric_summary: Dict[str, Dict[str, float]],
    revenue_series: List[Dict[str, Any]],
    profit_series: List[Dict[str, Any]],
) -> str:
    """Generate a risk assessment string for the Cash Flow Forecast page."""
    warnings: List[str] = []

    # Revenue vs expense comparison
    rev_col = find_column(rows[0], ["revenue", "sales", "income", "amount", "total_revenue"]) if rows else None
    exp_col = find_column(rows[0], ["expense", "expenses", "cost", "costs", "operating_expense"]) if rows else None

    if rev_col and exp_col and rev_col in numeric_summary and exp_col in numeric_summary:
        rev_total = numeric_summary[rev_col]["total"]
        exp_total = numeric_summary[exp_col]["total"]
        if rev_total > 0:
            ratio = exp_total / rev_total * 100
            warnings.append(f"Expense-to-revenue ratio: {ratio:.1f}%.")
            if ratio > 90:
                warnings.append("CRITICAL: Expenses exceed 90% of revenue — cash flow is under severe pressure.")
            elif ratio > 75:
                warnings.append("WARNING: Expenses are high relative to revenue — monitor burn rate closely.")

    # Profit trend
    if profit_series and len(profit_series) >= 2:
        first_half = profit_series[:len(profit_series) // 2]
        second_half = profit_series[len(profit_series) // 2:]
        first_avg = sum(p["value"] for p in first_half) / max(len(first_half), 1)
        second_avg = sum(p["value"] for p in second_half) / max(len(second_half), 1)
        if first_avg > 0:
            change = ((second_avg - first_avg) / first_avg) * 100
            if change < -10:
                warnings.append(f"Profit trend declining {abs(change):.1f}% — may indicate cash flow deterioration.")
            elif change > 10:
                warnings.append(f"Profit trend improving {change:.1f}% — positive cash flow outlook.")

    # Cash column if present
    cash_col = find_column(rows[0], ["cash", "cash_flow", "cashflow", "cash_balance", "net_cash"]) if rows else None
    if cash_col and cash_col in numeric_summary:
        stats = numeric_summary[cash_col]
        warnings.append(f"Cash flow — latest: {_fmt(stats['latest'])}, avg: {_fmt(stats['average'])}, trend: {stats['trend_pct']:.1f}%.")
        if stats["trend_pct"] < -10:
            warnings.append("Cash flow is trending downward — assess receivables and payment cycles.")

    # Loan / default analysis
    default_col = _detect_bool_column(rows, ["default", "defaulted", "is_default", "default_flag"])
    if default_col:
        rate = _flag_rate(rows, default_col)
        warnings.append(f"Default rate: {rate * 100:.1f}% from '{default_col}' column.")
        if rate > 0.1:
            warnings.append("High default rate increases credit risk exposure and may impair cash flow.")

    if not warnings:
        # Generic from available data
        for col, stats in list(numeric_summary.items())[:2]:
            warnings.append(f"{col}: trend {stats['trend_pct']:.1f}%, latest {_fmt(stats['latest'])}.")
        warnings.append("Upload data with revenue, expense, and cash flow columns for deeper risk assessment.")

    return " ".join(warnings)


def build_top_kpis(
    rows: List[Dict[str, Any]],
    numeric_summary: Dict[str, Dict[str, float]],
    keyword_counts: Dict[str, int],
) -> List[Dict[str, Any]]:
    """Build KPI cards from real column data for the Dashboard page."""
    kpis: List[Dict[str, Any]] = []

    # Priority order for KPI extraction
    kpi_candidates = [
        (["revenue", "sales", "income", "total_revenue"], "Revenue"),
        (["profit", "net_income", "net_profit", "gross_profit", "margin"], "Profit"),
        (["expense", "expenses", "cost", "costs"], "Expenses"),
        (["customers", "users", "accounts", "customer_count", "active_users"], "Customers"),
        (["cash", "cash_flow", "cashflow", "cash_balance"], "Cash Flow"),
        (["loan", "loans", "loan_amount"], "Loans"),
        (["amount", "transaction_amount", "total"], "Total Amount"),
    ]

    for names, label in kpi_candidates:
        col = find_column(rows[0], names) if rows else None
        if col and col in numeric_summary:
            stats = numeric_summary[col]
            trend = "up" if stats["trend_pct"] > 0 else "down"
            kpis.append({
                "label": label,
                "value": stats["latest"],
                "trend": trend,
                "change": stats["trend_pct"],
            })
        if len(kpis) >= 4:
            break

    # If we got fewer than 3, fill from remaining numeric columns
    used_cols = set()
    for names, _ in kpi_candidates:
        if rows:
            c = find_column(rows[0], names)
            if c:
                used_cols.add(c)

    for col, stats in numeric_summary.items():
        if col in used_cols or len(kpis) >= 5:
            break
        trend = "up" if stats["trend_pct"] > 0 else "down"
        kpis.append({
            "label": col,
            "value": stats["latest"],
            "trend": trend,
            "change": stats["trend_pct"],
        })

    if not kpis:
        kpis = [
            {"label": "Records", "value": float(len(rows)), "trend": "up", "change": 0},
            {"label": "Columns", "value": float(len(rows[0].keys()) if rows else 0), "trend": "up", "change": 0},
        ]

    return kpis


# ---------------------------------------------------------------------------
# Master metrics builder
# ---------------------------------------------------------------------------

def build_dataset_metrics(filename: str, text: str, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    words = re.findall(r"[A-Za-z0-9_%.$-]+", text)
    lower_text = text.lower()
    columns = list(rows[0].keys()) if rows else []
    numeric_summary = summarize_numeric_columns(rows)
    revenue_series = build_series(rows, ["revenue", "sales", "income", "amount"])
    profit_series = build_series(rows, ["profit", "net_income", "margin"])
    keyword_counts = {keyword: lower_text.count(keyword) for keyword in KEYWORDS}

    # File-level summary for the Datasets page
    summary = _build_file_summary(filename, rows, words, lower_text, numeric_summary)

    # Page-specific analytics
    revenue_insights = build_revenue_insights(rows, numeric_summary, revenue_series, profit_series)
    churn_segments, churn_drivers, churn_probability = build_churn_insights(rows, numeric_summary, keyword_counts)
    fraud_segments, fraud_score = build_fraud_insights(rows, numeric_summary, keyword_counts)
    cashflow_risk = build_cashflow_risk(rows, numeric_summary, revenue_series, profit_series)
    top_kpis = build_top_kpis(rows, numeric_summary, keyword_counts)

    return {
        # Existing fields
        "summary": summary,
        "columns": columns,
        "row_count": len(rows),
        "word_count": len(words),
        "keyword_counts": keyword_counts,
        "numeric_summary": numeric_summary,
        "revenue_series": revenue_series,
        "profit_series": profit_series,
        # NEW: page-specific analytics
        "revenue_insights": revenue_insights,
        "churn_insights": churn_segments,
        "churn_drivers": churn_drivers,
        "churn_probability": churn_probability,
        "fraud_insights": fraud_segments,
        "fraud_score": fraud_score,
        "cashflow_risk": cashflow_risk,
        "top_kpis": top_kpis,
    }


def _build_file_summary(
    filename: str,
    rows: List[Dict[str, Any]],
    words: List[str],
    lower_text: str,
    numeric_summary: Dict[str, Dict[str, float]],
) -> List[str]:
    """Build a file-level summary used only on the Datasets page."""
    summary = [f"{filename} is now the active dataset for this account."]
    if rows:
        summary.append(f"Detected {len(rows)} structured rows and {len(rows[0].keys()) if rows else 0} columns.")
        col_names = list(rows[0].keys())
        summary.append(f"Columns: {', '.join(col_names[:12])}{'...' if len(col_names) > 12 else ''}.")
    else:
        summary.append(f"Extracted approximately {len(words)} words for AI COO analysis.")

    strongest_keywords = sorted(KEYWORDS, key=lambda keyword: lower_text.count(keyword), reverse=True)[:3]
    mentioned = [keyword for keyword in strongest_keywords if lower_text.count(keyword) > 0]
    if mentioned:
        summary.append("Most visible business themes: " + ", ".join(mentioned) + ".")

    if numeric_summary:
        for col_name, stats in list(numeric_summary.items())[:3]:
            summary.append(f"{col_name}: total {_fmt(stats['total'])}, avg {_fmt(stats['average'])}, latest {_fmt(stats['latest'])}.")

    return summary
