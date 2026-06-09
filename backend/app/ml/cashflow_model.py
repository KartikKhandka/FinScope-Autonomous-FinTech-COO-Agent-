import numpy as np
from typing import Any, Dict, List, Optional

try:
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.metrics import mean_squared_error, mean_absolute_error
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


def forecast_from_series(series: List[Dict[str, Any]], periods: int = 30) -> List[Dict[str, Any]]:
    """Simple linear trend forecast from a value series.
    
    Args:
        series: List of {"date": ..., "value": ...} dicts.
        periods: Number of future periods to forecast.
    
    Returns:
        List of forecasted {"date": idx, "value": ...} dicts.
    """
    if len(series) < 2:
        return []

    values = [float(p["value"]) for p in series]
    n = len(values)

    # Simple linear regression
    x = np.arange(n, dtype=float)
    y = np.array(values, dtype=float)
    x_mean = x.mean()
    y_mean = y.mean()
    slope = np.sum((x - x_mean) * (y - y_mean)) / max(np.sum((x - x_mean) ** 2), 1e-10)
    intercept = y_mean - slope * x_mean

    forecast = []
    for i in range(periods):
        idx = n + i
        predicted = intercept + slope * idx
        forecast.append({"date": str(idx), "value": round(float(predicted), 2)})

    return forecast


def compute_cashflow_metrics(
    rows: List[Dict[str, Any]],
    revenue_col: Optional[str] = None,
    expense_col: Optional[str] = None,
    cash_col: Optional[str] = None,
) -> Dict[str, Any]:
    """Compute cash flow health metrics from structured data.
    
    Returns a dict with burn_rate, runway_months, and expense_ratio.
    """
    result: Dict[str, Any] = {}

    if revenue_col and expense_col:
        total_rev = 0.0
        total_exp = 0.0
        count = 0
        for row in rows:
            try:
                rev = float(str(row.get(revenue_col, 0)).replace(",", "").replace("$", ""))
                exp = float(str(row.get(expense_col, 0)).replace(",", "").replace("$", ""))
                total_rev += rev
                total_exp += exp
                count += 1
            except (ValueError, TypeError):
                continue

        if count > 0:
            result["avg_revenue"] = round(total_rev / count, 2)
            result["avg_expense"] = round(total_exp / count, 2)
            result["expense_ratio"] = round(total_exp / max(total_rev, 0.01) * 100, 1)
            monthly_burn = total_exp / count
            monthly_revenue = total_rev / count
            net_monthly = monthly_revenue - monthly_burn
            result["net_monthly"] = round(net_monthly, 2)

    if cash_col:
        cash_values = []
        for row in rows:
            try:
                cash_values.append(float(str(row.get(cash_col, 0)).replace(",", "").replace("$", "")))
            except (ValueError, TypeError):
                continue
        if cash_values:
            result["latest_cash"] = round(cash_values[-1], 2)
            result["avg_cash"] = round(sum(cash_values) / len(cash_values), 2)
            if len(cash_values) >= 2:
                half = len(cash_values) // 2
                first_avg = sum(cash_values[:half]) / half
                second_avg = sum(cash_values[half:]) / (len(cash_values) - half)
                result["cash_trend_pct"] = round(
                    ((second_avg - first_avg) / max(abs(first_avg), 0.01)) * 100, 1
                )

    return result


def train_cashflow_model(
    rows: List[Dict[str, Any]],
    target_col: str,
    feature_cols: List[str],
) -> Optional[Dict[str, Any]]:
    """Train a gradient boosting model on cashflow data with auto-detected columns."""
    if not HAS_SKLEARN or len(rows) < 20 or not feature_cols:
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
            try:
                target = float(str(row.get(target_col, "")).replace(",", "").replace("$", ""))
            except (ValueError, TypeError):
                continue
            X.append(features)
            y.append(target)

        if len(X) < 20:
            return None

        X_arr = np.array(X, dtype=float)
        y_arr = np.array(y, dtype=float)

        model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
        model.fit(X_arr, y_arr)
        predictions = model.predict(X_arr)

        rmse = float(mean_squared_error(y_arr, predictions, squared=False))
        mae = float(mean_absolute_error(y_arr, predictions))

        importances = list(zip(feature_cols, model.feature_importances_.tolist()))
        importances.sort(key=lambda x: x[1], reverse=True)

        return {
            "rmse": round(rmse, 2),
            "mae": round(mae, 2),
            "feature_importances": importances[:10],
            "samples": len(X),
        }
    except Exception:
        return None
