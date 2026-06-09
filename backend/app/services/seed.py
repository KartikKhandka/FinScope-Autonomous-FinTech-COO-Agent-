from datetime import date, datetime, timedelta
from random import choice, randint, random

from app.database import Base, engine, SessionLocal
from app.models import KPI, Loan, Revenue, Transaction, User

STATUS_CHOICES = ["active", "closed", "delinquent"]
REPAYMENT_CHOICES = ["current", "late", "default"]


def create_sample_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        today = date.today()
        db.query(KPI).delete()
        db.query(Transaction).delete()
        db.query(Loan).delete()
        db.query(User).delete()
        db.query(Revenue).delete()
        db.commit()

        for offset in range(120):
            current = today - timedelta(days=119 - offset)
            revenue_value = 320000 + offset * 2600 + randint(-12000, 12000)
            expenses_value = 180000 + offset * 1300 + randint(-8000, 8000)
            profit_value = max(0, revenue_value - expenses_value)
            db.add(Revenue(date=current, revenue=revenue_value, expenses=expenses_value, profit=profit_value))

            db.add(KPI(
                date=current,
                daily_active_users=1500 + offset * 5 + randint(-50, 50),
                monthly_active_users=48000 + offset * 20,
                cac=75.0 + offset * 0.2 + random() * 2,
                ltv=310.0 + offset * 0.15 + random() * 1.5,
                npa_ratio=0.03 + random() * 0.005,
                default_rate=0.035 + random() * 0.003,
            ))

        for i in range(1, 201):
            signup = today - timedelta(days=randint(30, 180))
            last_active = signup + timedelta(days=randint(0, 120))
            churn_flag = random() < 0.12
            db.add(User(
                user_id=f"user_{i}",
                signup_date=signup,
                last_active_date=min(last_active, today),
                churn_flag=churn_flag,
            ))

        for i in range(1, 101):
            created = today - timedelta(days=randint(1, 360))
            status = choice(STATUS_CHOICES)
            repayment_status = choice(REPAYMENT_CHOICES)
            db.add(Loan(
                loan_id=f"loan_{i}",
                amount=randint(15000, 250000),
                status=status,
                repayment_status=repayment_status,
                risk_score=round(0.2 + random() * 0.7, 3),
            ))

        for i in range(1, 151):
            tx_time = datetime.combine(today - timedelta(days=randint(0, 30)), datetime.min.time()) + timedelta(hours=randint(0, 23), minutes=randint(0, 59))
            fraud_flag = random() < 0.08
            amount = round(random() * 15000 + 50, 2)
            db.add(Transaction(
                transaction_id=f"txn_{i}",
                amount=amount,
                timestamp=tx_time,
                fraud_flag=fraud_flag,
            ))

        db.commit()
        print("Seed data inserted successfully.")
        print(f"Revenue rows: {db.query(Revenue).count()}")
        print(f"Users rows: {db.query(User).count()}")
        print(f"Loans rows: {db.query(Loan).count()}")
        print(f"Transactions rows: {db.query(Transaction).count()}")
        print(f"KPIs rows: {db.query(KPI).count()}")
    finally:
        db.close()


if __name__ == "__main__":
    create_sample_data()
