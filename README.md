# Autonomous FinTech COO Agent

An AI-powered executive intelligence platform for fintech operations. This scaffold includes a React dashboard frontend, FastAPI backend, PostgreSQL database, and ML service placeholders for churn, cash flow, and fraud detection.

## Architecture

- Frontend: React + JavaScript + MUI + Recharts + React Query
- Backend: FastAPI + SQLAlchemy + JWT auth
- Database: PostgreSQL
- ML modules: XGBoost / LightGBM / Prophet placeholders
- Deployment: Docker + docker-compose

## Quickstart

1. Start services:
   ```bash
   docker compose up --build
   ```
2. Open the backend at `http://localhost:8000`.
3. Install frontend dependencies and run the UI:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Navigate to `http://localhost:5173`.

## Backend startup

From the project root:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

By default the backend now uses SQLite at `backend/fintech_coo.db` if `DATABASE_URL` is not configured.

## Seed sample data

Populate the database with sample fintech data:
```bash
cd backend
python -m app.services.seed
```

## Login

Use the login page to create a unique username and password. After registration, sign in with those same credentials to access the dashboard and AI COO assistant.

## API Endpoints

- `GET /api/dashboard`
- `GET /api/revenue-analysis`
- `GET /api/forecast`
- `GET /api/fraud-analysis`
- `GET /api/churn-analysis`
- `POST /api/generate-report`
- `POST /api/ask-coo-agent`

## Notes

- Copy `.env.example` to `.env` and update `DATABASE_URL` / `SECRET_KEY` before production.
- Update `backend/app/auth.py` with a secure `SECRET_KEY` before production if you do not use environment variables.
- Replace stub logic in `backend/app/services` and `backend/app/ml` with real data pipelines and model training.
- Add PostgreSQL migrations and proper authentication for production use.