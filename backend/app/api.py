from fastapi import APIRouter, Depends, File, HTTPException, status, Request, UploadFile
from sqlalchemy.orm import Session
from app.auth import authenticate_user, create_token_for_user, create_user, get_current_user, SECRET_KEY, ALGORITHM, get_user
import logging
from jose import JWTError, jwt

logger = logging.getLogger(__name__)
from app.database import get_db
from app.schemas import (
    DashboardResponse,
    RevenueAnalysisResponse,
    ForecastResponse,
    FraudAnalysisResponse,
    ChurnAnalysisResponse,
    ReportRequest,
    ReportResponse,
    AskCOORequest,
    AskCOOResponse,
    DatasetSummary,
    DatasetUploadResponse,
    RegisterRequest,
    TokenResponse,
    RefreshRequest,
)
from app.services.analytics import (
    get_dashboard_metrics,
    get_revenue_analysis,
    get_forecast,
    get_fraud_analysis,
    get_churn_analysis,
)
from app.services.audit import log_audit_event
from app.services.datasets import create_dataset_from_upload, dataset_to_summary, get_latest_dataset, list_datasets
from app.services.report import generate_executive_report
from app.services.agent import ask_coo_agent

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    user = create_user(db, payload.username, payload.password)
    log_audit_event(user.username, "register", f"IP: {request.client.host}")
    return create_token_for_user(user)

@router.post("/login", response_model=TokenResponse)
async def login(request: Request, db: Session = Depends(get_db)):
    username = None
    password = None
    content_type = request.headers.get("content-type", "")
    body = await request.body()
    
    if not body:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Empty request body")
    
    if "application/json" in content_type or (body and body.startswith(b'{')):
        try:
            payload = __import__('json').loads(body)
            username = payload.get("username")
            password = payload.get("password")
        except Exception:
            pass
    else:
        try:
            import urllib.parse
            form_data = urllib.parse.parse_qs(body.decode())
            username = form_data.get("username", [None])[0]
            password = form_data.get("password", [None])[0]
        except Exception:
            pass

    if not username or not password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="username and password required")

    user = authenticate_user(db, username, password)
    if not user:
        log_audit_event(username, "failed_login", f"IP: {request.client.host}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    log_audit_event(username, "login", f"IP: {request.client.host}")
    return create_token_for_user(user)

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        token_payload = jwt.decode(payload.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = token_payload.get("sub")
        token_type = token_payload.get("type")
        if not username or token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
        user = get_user(db, username)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        return create_token_for_user(user)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    log_audit_event(current_user["username"], "logout")
    return {"message": "Successfully logged out"}

@router.post("/reset-password")
def reset_password(username: str, db: Session = Depends(get_db)):
    user = get_user(db, username)
    if user:
        log_audit_event(username, "password_reset_requested")
    return {"message": "If an account exists, a reset link has been sent to the registered email."}

@router.post("/datasets/upload", response_model=DatasetUploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = await create_dataset_from_upload(db, current_user["username"], file)
    log_audit_event(current_user["username"], "dataset_upload", dataset.filename)
    return {"dataset": dataset_to_summary(dataset)}

@router.get("/datasets", response_model=list[DatasetSummary])
def datasets(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return [dataset_to_summary(dataset) for dataset in list_datasets(db, current_user["username"])]

@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event(current_user["username"], "dashboard_access")
    return get_dashboard_metrics(get_latest_dataset(db, current_user["username"]))

@router.get("/revenue-analysis", response_model=RevenueAnalysisResponse)
def revenue_analysis(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event(current_user["username"], "revenue_analysis")
    return get_revenue_analysis(get_latest_dataset(db, current_user["username"]))

@router.get("/forecast", response_model=ForecastResponse)
def forecast(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event(current_user["username"], "forecast")
    return get_forecast(get_latest_dataset(db, current_user["username"]))

@router.get("/fraud-analysis", response_model=FraudAnalysisResponse)
def fraud_analysis(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event(current_user["username"], "fraud_analysis")
    return get_fraud_analysis(get_latest_dataset(db, current_user["username"]))

@router.get("/churn-analysis", response_model=ChurnAnalysisResponse)
def churn_analysis(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event(current_user["username"], "churn_analysis")
    return get_churn_analysis(get_latest_dataset(db, current_user["username"]))

@router.post("/generate-report", response_model=ReportResponse)
def generate_report(payload: ReportRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event(current_user["username"], "generate_report", f"period={payload.period_start}..{payload.period_end}")
    return generate_executive_report(payload, get_latest_dataset(db, current_user["username"]))

@router.post("/ask-coo-agent", response_model=AskCOOResponse)
def ask_coo(payload: AskCOORequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event(current_user["username"], "ask_coo_agent", payload.question)
    return ask_coo_agent(payload, get_latest_dataset(db, current_user["username"]))
