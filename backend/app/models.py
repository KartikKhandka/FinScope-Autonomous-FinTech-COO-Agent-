from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Revenue(Base):
    __tablename__ = "revenue"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    revenue = Column(Float, nullable=False)
    expenses = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    signup_date = Column(Date, nullable=False)
    last_active_date = Column(Date, nullable=False)
    churn_flag = Column(Boolean, default=False)

class AuthUser(Base):
    __tablename__ = "auth_users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")

class UploadedDataset(Base):
    __tablename__ = "uploaded_datasets"
    id = Column(Integer, primary_key=True, index=True)
    owner_username = Column(String, index=True, nullable=False)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=False)
    metrics_json = Column(Text, nullable=False)
    uploaded_at = Column(DateTime, nullable=False)

class Loan(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(String, unique=True, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    repayment_status = Column(String, nullable=False)
    risk_score = Column(Float, nullable=False)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    fraud_flag = Column(Boolean, default=False)

class KPI(Base):
    __tablename__ = "kpis"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    daily_active_users = Column(Integer, nullable=False)
    monthly_active_users = Column(Integer, nullable=False)
    cac = Column(Float, nullable=False)
    ltv = Column(Float, nullable=False)
    npa_ratio = Column(Float, nullable=False)
    default_rate = Column(Float, nullable=False)
