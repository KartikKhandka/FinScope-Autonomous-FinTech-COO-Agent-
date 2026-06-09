import pandas as pd
import numpy as np
from typing import Any, Dict, List, Optional, Tuple

try:
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.metrics import precision_score, recall_score, f1_score
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


def compute_churn_stats(rows: List[Dict[str, Any]], churn_col: str) -> Dict[str, Any]:
    """Compute churn statistics from structured rows with a churn flag column.
    
    Args:
        rows: List of row dicts from the uploaded dataset.
        churn_col: Name of the boolean/0-1 churn flag column.
    
    Returns:
        Dictionary with churn_rate, total_customers, churned_count, and segment breakdowns.
    """
    total = 0
    churned = 0
    for row in rows:
        raw = str(row.get(churn_col, "")).strip().lower()
        if raw in ("1", "true", "yes", "1.0"):
            churned += 1
            total += 1
        elif raw in ("0", "false", "no", "0.0"):
            total += 1

    return {
        "churn_rate": churned / max(total, 1),
        "total_customers": total,
        "churned_count": churned,
        "retained_count": total - churned,
    }


def find_churn_drivers(
    rows: List[Dict[str, Any]],
    churn_col: str,
    numeric_columns: List[str],
) -> List[Tuple[str, float, float, float]]:
    """Find which numeric columns best correlate with churn.
    
    Returns list of (column_name, diff_pct, churned_avg, retained_avg) sorted by impact.
    """
    churn_flags = []
    for row in rows:
        raw = str(row.get(churn_col, "")).strip().lower()
        churn_flags.append(1.0 if raw in ("1", "true", "yes", "1.0") else 0.0)

    drivers = []
    for col in numeric_columns:
        if col == churn_col:
            continue
        churned_vals = []
        retained_vals = []
        for row, flag in zip(rows, churn_flags):
            val = row.get(col)
            if val is None or val == "":
                continue
            try:
                num = float(str(val).replace(",", "").replace("$", ""))
            except (ValueError, TypeError):
                continue
            if flag == 1.0:
                churned_vals.append(num)
            else:
                retained_vals.append(num)

        if len(churned_vals) >= 5 and len(retained_vals) >= 5:
            avg_churned = sum(churned_vals) / len(churned_vals)
            avg_retained = sum(retained_vals) / len(retained_vals)
            diff_pct = ((avg_churned - avg_retained) / max(abs(avg_retained), 0.01)) * 100
            if abs(diff_pct) > 3:
                drivers.append((col, diff_pct, avg_churned, avg_retained))

    drivers.sort(key=lambda x: abs(x[1]), reverse=True)
    return drivers


def train_churn_model(rows: List[Dict[str, Any]], churn_col: str, feature_cols: List[str]) -> Optional[Dict[str, Any]]:
    """Train a churn prediction model on the uploaded data.
    
    Auto-detects feature columns (uses all numeric columns except the target).
    Returns model metrics if successful, None if not enough data.
    """
    if not HAS_SKLEARN or len(rows) < 20 or len(feature_cols) < 1:
        return None

    try:
        X = []
        y = []
        for row in rows:
            features = []
            skip = False
            for col in feature_cols:
                val = row.get(col)
                try:
                    features.append(float(str(val).replace(",", "").replace("$", "")))
                except (ValueError, TypeError):
                    skip = True
                    break
            if skip:
                continue
            raw = str(row.get(churn_col, "")).strip().lower()
            if raw in ("1", "true", "yes", "1.0"):
                y.append(1)
            elif raw in ("0", "false", "no", "0.0"):
                y.append(0)
            else:
                continue
            X.append(features)

        if len(X) < 20 or len(set(y)) < 2:
            return None

        X_arr = np.array(X, dtype=float)
        y_arr = np.array(y, dtype=int)

        model = GradientBoostingClassifier(n_estimators=50, max_depth=3, random_state=42)
        model.fit(X_arr, y_arr)
        predictions = model.predict(X_arr)

        importances = list(zip(feature_cols, model.feature_importances_.tolist()))
        importances.sort(key=lambda x: x[1], reverse=True)

        return {
            "precision": round(float(precision_score(y_arr, predictions, zero_division=0)), 3),
            "recall": round(float(recall_score(y_arr, predictions, zero_division=0)), 3),
            "f1": round(float(f1_score(y_arr, predictions, zero_division=0)), 3),
            "feature_importances": importances[:10],
            "samples": len(X),
        }
    except Exception:
        return None
