# Logical Structure — Agentic Civic Service Request Triage System

## System Architecture Overview

The system is organized into five layers:

```
┌──────────────────────────────────────────────────────┐
│  Layer 1 – Frontend (React + Vite, port 5173)        │
│  RequestForm  │  RequestDashboard  │  api/requests.js │
└──────────────────────┬───────────────────────────────┘
                       │ HTTP /api/* (proxied by Vite)
┌──────────────────────▼───────────────────────────────┐
│  Layer 2 – API (FastAPI, port 8000)                   │
│  POST /api/requests  │  GET /api/requests             │
│  GET /api/requests/{id}  │  GET /health               │
└──────────────────────┬───────────────────────────────┘
                       │ Python function call
┌──────────────────────▼───────────────────────────────┐
│  Layer 3 – Agent Service (agent_service.py)           │
│  classify_request_agent()                             │
│    ├── LLM path: OpenAI gpt-3.5-turbo                │
│    └── Fallback: keyword rule matching                │
└──────────────────────┬───────────────────────────────┘
                       │ Python function call
┌──────────────────────▼───────────────────────────────┐
│  Layer 4 – MCP Tools (mcp_tools.py)                   │
│  create_service_ticket_tool()                         │
│  route_department_tool()                              │
│  classify_request_tool()                              │
└──────────────────────┬───────────────────────────────┘
                       │ sqlite3
┌──────────────────────▼───────────────────────────────┐
│  Layer 5 – Database (SQLite, civic_requests.db)       │
│  service_requests table                               │
└──────────────────────────────────────────────────────┘
```

## Data Flow (Submission Path)

1. Staff member fills in the RequestForm (request text, location, submitter name) and clicks Submit
2. React calls `POST /api/requests` with a JSON body via `fetch`
3. FastAPI validates the body against `ServiceRequestInput` (Pydantic)
4. `classify_request_agent()` is called with the request text
5. If `OPENAI_API_KEY` is set → OpenAI API call returns JSON classification
   Else → keyword matching rules produce classification dict
6. FastAPI inserts the classified record into the `service_requests` SQLite table
7. `create_service_ticket_tool()` and `route_department_tool()` are called (simulated)
8. The full `ServiceRequestOutput` is returned to the frontend
9. RequestForm displays the result card; `onRequestSubmitted` is called to refresh the dashboard

## Component Responsibility Table

| Component             | Technology         | Responsibility                                               |
|-----------------------|--------------------|--------------------------------------------------------------|
| `App.jsx`             | React              | Root layout, header, refresh state coordination              |
| `RequestForm.jsx`     | React              | Submission form, result display, error handling              |
| `RequestDashboard.jsx`| React              | Filterable table of all requests                             |
| `api/requests.js`     | Fetch API          | HTTP client wrappers for POST and GET endpoints              |
| `main.py`             | FastAPI            | API routing, CORS, lifespan, endpoint handlers               |
| `agent_service.py`    | Python             | LLM and rule-based classification logic                      |
| `mcp_tools.py`        | Python             | Simulated external system integrations                       |
| `database.py`         | sqlite3            | DB initialization, connection factory                        |
| `schemas.py`          | Pydantic v2        | Input validation and output serialization                    |
| `models.py`           | dataclasses        | Domain model (ServiceRequest)                                |

## Database Schema — `service_requests`

| Column             | Type      | Notes                                      |
|--------------------|-----------|--------------------------------------------|
| id                 | INTEGER   | Primary key, auto-increment                |
| request_text       | TEXT      | Raw description submitted by staff         |
| location           | TEXT      | Physical location of the issue             |
| submitted_by       | TEXT      | Name of the staff member submitting        |
| category           | TEXT      | One of 6 standard categories               |
| priority           | TEXT      | Low / Medium / High / Critical             |
| summary            | TEXT      | 1–2 sentence plain-English summary         |
| recommended_action | TEXT      | Specific next step for intake coordinator  |
| department         | TEXT      | Responsible department name                |
| status             | TEXT      | Default: 'Open'                            |
| created_at         | TIMESTAMP | Auto-set by SQLite on insert               |

## API Endpoints

| Method | Path                    | Description                                         |
|--------|-------------------------|-----------------------------------------------------|
| GET    | /health                 | Service liveness check                              |
| POST   | /api/requests           | Submit and classify a new service request           |
| GET    | /api/requests           | List all requests (filterable by category/priority) |
| GET    | /api/requests/{id}      | Retrieve a single request by ID                     |

## MCP Tool Functions

| Function                    | Simulates                              | Returns                                  |
|-----------------------------|----------------------------------------|------------------------------------------|
| `create_service_ticket_tool`| Creating a ticket in an external ITSM | ticket_id, status, category, priority    |
| `route_department_tool`     | Routing ticket to department queue     | department, ticket_id, status, message   |
| `classify_request_tool`     | MCP classification tool call           | category, confidence, status             |
