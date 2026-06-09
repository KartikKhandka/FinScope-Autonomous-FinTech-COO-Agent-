import csv
from datetime import date, timedelta

BASE_DATE = date(2026, 1, 1)


def generate_revenue_csv(path):
    with open(path, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["date", "revenue", "expenses", "profit"])
        for i in range(120):
            current = BASE_DATE + timedelta(days=i)
            revenue = 300000 + i * 2500
            expenses = 180000 + i * 1200
            profit = revenue - expenses
            writer.writerow([current, revenue, expenses, profit])


def generate_users_csv(path):
    with open(path, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["user_id", "signup_date", "last_active_date", "churn_flag"])
        for i in range(1, 201):
            signup = BASE_DATE + timedelta(days=i % 60)
            last_active = BASE_DATE + timedelta(days=120 - (i % 30))
            churn_flag = i % 10 == 0
            writer.writerow([f"user_{i}", signup, last_active, churn_flag])


def main():
    generate_revenue_csv("revenue.csv")
    generate_users_csv("users.csv")

if __name__ == "__main__":
    main()
