# Agentic Civic Service Request Triage System

An AI-powered triage system for the City of Los Angeles — Department of General Services that automatically classifies, prioritizes, summarizes, and routes incoming service requests.

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, SQLite (raw sqlite3), Pydantic v2
- **AI/Agent:** OpenAI gpt-3.5-turbo (optional) + rule-based keyword fallback
- **Frontend:** React 18, Vite 5
- **Styling:** Inline styles only (no CSS framework)

## Prerequisites

- Python 3.11+
- Node.js 18+
- pip and npm

## Installation — Backend

```bash
cd civic-service-request-agent/backend

python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r ../requirements.txt
```

## Installation — Frontend

```bash
cd civic-service-request-agent/frontend

npm install
```

## Running the Application

**Terminal 1 — Backend:**

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

## Open the App

- UI: [http://localhost:5173](http://localhost:5173)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in values:

```
OPENAI_API_KEY=sk-...   # Optional
```

Load it before starting the server:

```bash
export $(cat .env | xargs) && uvicorn main:app --reload
```

Or use `python-dotenv` (already in requirements) — place `.env` in the `backend/` directory and it will be picked up automatically if you add `load_dotenv()` to `main.py`.

## Works Without an API Key

If `OPENAI_API_KEY` is not set, the system falls back to a deterministic keyword-matching
algorithm that covers all six categories and four priority levels. No network calls are made
and no API costs are incurred.

## API Summary

| Method | Endpoint               | Description                      |
|--------|------------------------|----------------------------------|
| GET    | /health                | Liveness check                   |
| POST   | /api/requests          | Submit and classify a request    |
| GET    | /api/requests          | List all requests (filterable)   |
| GET    | /api/requests/{id}     | Get a single request by ID       |

Full interactive documentation at `http://localhost:8000/docs`.
