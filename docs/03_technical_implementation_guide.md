# Technical Implementation Guide

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- pip (comes with Python)
- npm (comes with Node.js)

---

## Backend Setup

```bash
cd civic-service-request-agent/backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# (Optional) copy and edit environment file
cp ../.env.example ../.env
# Add your OPENAI_API_KEY to ../.env if you want LLM classification

# Start the API server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

## Frontend Setup

```bash
cd civic-service-request-agent/frontend

npm install
npm run dev
```

The UI will be available at `http://localhost:5173`.

---

## API Endpoints — Request/Response Examples

### POST /api/requests

**Request:**
```json
{
  "request_text": "The elevator at City Hall South is out of service",
  "location": "City Hall South, 111 E 1st St",
  "submitted_by": "Maria Lopez"
}
```

**Response:**
```json
{
  "id": 1,
  "request_text": "The elevator at City Hall South is out of service",
  "location": "City Hall South, 111 E 1st St",
  "submitted_by": "Maria Lopez",
  "category": "Facility Maintenance",
  "priority": "High",
  "summary": "Service request submitted regarding: The elevator at City Hall South is out of service...",
  "recommended_action": "Create a facility maintenance work order and notify the building operations team.",
  "department": "Building & Facility Operations",
  "status": "Open",
  "created_at": "2026-06-17 10:23:45"
}
```

### GET /api/requests

```
GET /api/requests
GET /api/requests?category=Facility+Maintenance
GET /api/requests?priority=High
GET /api/requests?category=Safety+Issue&priority=Critical
```

**Response:** Array of `ServiceRequestOutput` objects (same shape as above).

### GET /api/requests/{id}

```
GET /api/requests/1
```

**Response:** Single `ServiceRequestOutput` or `{"detail": "Request not found"}` (404).

### GET /health

```json
{"status": "ok", "service": "Civic Service Request Triage API"}
```

---

## Agent Service Logic

### LLM Path (`OPENAI_API_KEY` is set)

1. Instantiate `openai.OpenAI(api_key=api_key)`
2. Call `client.chat.completions.create(model="gpt-3.5-turbo", ...)`
3. System prompt instructs the model to return ONLY a JSON object with keys:
   `category`, `priority`, `summary`, `recommended_action`, `department`
4. Parse the response with `json.loads()`

### Rule-Based Fallback (no API key)

1. Lowercase the request text
2. Iterate category keyword lists; assign the first matching category (default: `General Inquiry`)
3. Iterate priority keyword lists in order Critical → High → Medium → Low; assign first match
4. Generate `summary` as `f"Service request submitted regarding: {request_text[:80]}..."`
5. Look up `recommended_action` and `department` from static maps keyed by category

---

## MCP Tool Signatures and Return Shapes

```python
create_service_ticket_tool(request_id: int, category: str, priority: str) -> dict
# Returns: {"tool", "ticket_id", "status", "category", "priority", "message"}

route_department_tool(department: str, ticket_id: str) -> dict
# Returns: {"tool", "department", "ticket_id", "status", "message"}

classify_request_tool(category: str, confidence: str = "rule-based") -> dict
# Returns: {"tool", "category", "confidence", "status"}
```

---

## Database Schema DDL

```sql
CREATE TABLE IF NOT EXISTS service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_text TEXT NOT NULL,
    location TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    summary TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Environment Variables

```
# .env (place in project root, next to requirements.txt)
OPENAI_API_KEY=sk-...   # Optional — omit to use rule-based fallback
```

Load in Python with:
```python
from dotenv import load_dotenv
load_dotenv()
```

---

## Frontend ↔ Backend Connection

Vite proxies all `/api` requests to `http://localhost:8000` during development:

```js
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

React components call relative paths (`/api/requests`) — no hardcoded ports in source.
For production, serve the built React app from FastAPI or a CDN and configure CORS accordingly.
