import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from typing import Any, Dict, List, Optional


def detect_fraud_spikes(data: np.ndarray) -> Dict[str, Any]:
    """Run anomaly detection on a numeric numpy array.
    
    Args:
        data: 2D numpy array of shape (n_samples, n_features).
              Must already be cleaned (no NaN/inf).
    
    Returns:
        Dictionary with anomaly_score, fraud_risk_score, anomaly_indices, and cluster info.
    """
    if data.shape[0] < 10:
        return {
            "anomaly_score": 0.0,
            "fraud_risk_score": 0.0,
            "anomaly_count": 0,
            "clusters": [],
        }

    # Normalize for better detection
    col_std = data.std(axis=0)
    col_std[col_std == 0] = 1
    data_normalized = (data - data.mean(axis=0)) / col_std

    model = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
    anomaly_labels = model.fit_predict(data_normalized)
    anomaly_count = int(np.sum(anomaly_labels == -1))
    anomaly_score = anomaly_count / max(len(data), 1)

    # Cluster anomalies to find suspicious groups
    clusters = []
    try:
        if anomaly_count >= 5:
            anomaly_data = data_normalized[anomaly_labels == -1]
            clustering = DBSCAN(eps=1.5, min_samples=3).fit(anomaly_data)
            clusters = clustering.labels_.tolist()
    except Exception:
        pass

    return {
        "anomaly_score": float(anomaly_score),
        "fraud_risk_score": float(min(anomaly_score * 100, 100)),
        "anomaly_count": anomaly_count,
        "anomaly_indices": np.where(anomaly_labels == -1)[0].tolist(),
        "clusters": clusters,
    }


def detect_fraud_from_rows(rows: List[Dict[str, Any]], numeric_columns: List[str]) -> Dict[str, Any]:
    """Convenience wrapper: extract numeric columns from row dicts and run anomaly detection."""
    if not rows or not numeric_columns:
        return {"anomaly_score": 0.0, "fraud_risk_score": 0.0, "anomaly_count": 0, "clusters": []}

    matrix = []
    for row in rows:
        row_vals = []
        for col in numeric_columns:
            val = row.get(col)
            if val is None or val == "":
                row_vals.append(0.0)
            else:
                try:
                    row_vals.append(float(str(val).replace(",", "").replace("$", "")))
                except (ValueError, TypeError):
                    row_vals.append(0.0)
        matrix.append(row_vals)

    data = np.array(matrix, dtype=float)
    # Remove rows with NaN or inf
    valid_mask = np.isfinite(data).all(axis=1)
    data = data[valid_mask]

    if data.shape[0] < 10:
        return {"anomaly_score": 0.0, "fraud_risk_score": 0.0, "anomaly_count": 0, "clusters": []}

    return detect_fraud_spikes(data)
