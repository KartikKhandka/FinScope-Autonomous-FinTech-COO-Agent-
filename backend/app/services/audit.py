from datetime import datetime
from pathlib import Path

LOG_FILE = Path(__file__).resolve().parent.parent / "audit.log"


def log_audit_event(user: str, action: str, details: str = "") -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(f"{datetime.utcnow().isoformat()}Z|{user}|{action}|{details}\n")
