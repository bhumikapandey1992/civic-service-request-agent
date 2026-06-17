# Agent Regeneration Blueprint

This document gives an AI coding agent everything it needs to rebuild this application
from scratch. For each file: its path, purpose, and exact implementation instructions.

---

## `backend/database.py`
**Purpose:** SQLite initialization and connection factory.
**Instructions:**
- Import `sqlite3` and `os`
- `DB_PATH = "./civic_requests.db"`
- `init_db()` → open connection, execute CREATE TABLE IF NOT EXISTS for `service_requests` (11 columns as in schema), commit, close
- `get_db_connection()` → `sqlite3.connect(DB_PATH)` with `row_factory = sqlite3.Row`, return connection

---

## `backend/models.py`
**Purpose:** Domain model as a plain Python dataclass (no ORM).
**Instructions:**
- `from dataclasses import dataclass`
- `@dataclass class ServiceRequest` with fields: `id: int`, `request_text: str`, `location: str`, `submitted_by: str`, `category: str`, `priority: str`, `summary: str`, `recommended_action: str`, `department: str`, `status: str`, `created_at: str`

---

## `backend/schemas.py`
**Purpose:** Pydantic v2 validation and serialization.
**Instructions:**
- `ServiceRequestInput(BaseModel)` with `request_text`, `location`, `submitted_by` as str fields; use `@field_validator` to enforce `len >= 10`, `len >= 2`, `len >= 2` respectively (strip whitespace)
- `ServiceRequestOutput(BaseModel)` with all 11 fields as str/int; no validators needed

---

## `backend/agent_service.py`
**Purpose:** Classify a request via LLM or rule-based fallback.
**Instructions:**
- `classify_request_agent(request_text: str) -> dict`
- Check `os.environ.get("OPENAI_API_KEY")`; if truthy → `_classify_with_llm()`; else → `_classify_with_rules()`
- `_classify_with_llm(request_text, api_key)`: instantiate `openai.OpenAI(api_key=api_key)`, call `client.chat.completions.create(model="gpt-3.5-turbo", temperature=0.2, messages=[system+user])`, parse response as JSON
- System prompt: instruct model to return ONLY JSON with keys `category`, `priority`, `summary`, `recommended_action`, `department`
- `_classify_with_rules(request_text)`: lowercase text, iterate `keywords` dict → first match = category (default `"General Inquiry"`); iterate `priority_keywords` dict Critical→High→Medium→Low → first match = priority (default `"Low"`); build summary, action, department from static maps; return dict

---

## `backend/mcp_tools.py`
**Purpose:** Simulate MCP-style external tool calls.
**Instructions:**
- `create_service_ticket_tool(request_id: int, category: str, priority: str) -> dict` → returns dict with `ticket_id = f"LA-DGS-{request_id:05d}"`, `status="created"`, `message`
- `route_department_tool(department: str, ticket_id: str) -> dict` → returns dict with `status="routed"`, `message`
- `classify_request_tool(category: str, confidence: str = "rule-based") -> dict` → returns dict with `status="classified"`

---

## `backend/main.py`
**Purpose:** FastAPI application with 4 endpoints.
**Instructions:**
- Use `@asynccontextmanager` lifespan: call `init_db()` on startup
- Add `CORSMiddleware(allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])`
- `GET /health` → `{"status": "ok", "service": "Civic Service Request Triage API"}`
- `POST /api/requests` → validate with `ServiceRequestInput`, call `classify_request_agent`, INSERT into DB, SELECT by `lastrowid`, call `create_service_ticket_tool` + `route_department_tool`, return `ServiceRequestOutput(**dict(row))`
- `GET /api/requests` → optional `?category=` and `?priority=` query params, build WHERE clause, return list of `ServiceRequestOutput`
- `GET /api/requests/{request_id}` → SELECT by id, raise `HTTPException(404)` if None, else return `ServiceRequestOutput`

---

## `frontend/package.json`
**Purpose:** Node package manifest.
**Instructions:** `name="civic-service-request-frontend"`, `type="module"`, scripts `dev=vite` and `build=vite build`, deps `react@^18.2.0` + `react-dom@^18.2.0`, devDeps `@vitejs/plugin-react@^4.2.1` + `vite@^5.2.0`

---

## `frontend/vite.config.js`
**Purpose:** Vite build config with API proxy.
**Instructions:** `defineConfig({ plugins: [react()], server: { proxy: { '/api': 'http://localhost:8000' } } })`

---

## `frontend/index.html`
**Purpose:** HTML shell that mounts the React app.
**Instructions:** Standard HTML5 boilerplate; title "Civic Service Request Triage"; `<div id="root"></div>`; `<script type="module" src="/src/main.jsx"></script>`

---

## `frontend/src/main.jsx`
**Purpose:** React entry point.
**Instructions:** `ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)`

---

## `frontend/src/api/requests.js`
**Purpose:** HTTP client functions.
**Instructions:**
- `submitRequest(data)` → `fetch('/api/requests', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) })` → return `.json()`
- `fetchRequests(filters = {})` → build URLSearchParams from `filters.category` and `filters.priority`, `fetch('/api/requests?...')` → return `.json()`
- Both throw `Error` on non-ok response

---

## `frontend/src/components/RequestForm.jsx`
**Purpose:** Submission form with result card.
**Instructions:**
- useState for `requestText`, `location`, `submittedBy`, `loading`, `result`, `error`
- Form with textarea (requestText, minLength=10), two text inputs (location, submittedBy), submit button disabled while loading
- `handleSubmit` calls `submitRequest()`, sets `result` on success, `error` on failure
- Result card shows: ticket ID, category, priority badge (color from PRIORITY_COLORS map), summary, recommended_action, department, status
- Error shows in red box
- Call `onRequestSubmitted` prop after success
- Inline styles only; PRIORITY_COLORS: Critical=#dc2626, High=#ea580c, Medium=#ca8a04, Low=#16a34a

---

## `frontend/src/components/RequestDashboard.jsx`
**Purpose:** Filterable table of all service requests.
**Instructions:**
- Props: `refreshTrigger` (number)
- useState for `requests`, `loading`, `error`, `categoryFilter`, `priorityFilter`
- `useEffect` with deps `[refreshTrigger, categoryFilter, priorityFilter]` → calls `fetchRequests({category, priority})`
- Render: two `<select>` dropdowns (All Categories / All Priorities), Refresh button, table with 9 columns (ID, Submitted By, Location, Category, Priority, Summary, Department, Status, Date)
- Priority cells use PRIORITY_COLORS badge
- "No requests found." when array is empty
- Inline styles only

---

## `frontend/src/App.jsx`
**Purpose:** Root layout and refresh coordination.
**Instructions:**
- `useState(0)` for `refreshTrigger`
- `handleRequestSubmitted` increments `refreshTrigger`
- Render: header (bg #1e3a5f, white text, emoji + title + subtitle), two-column `display:grid` using `gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))'`, `<RequestForm onRequestSubmitted={handleRequestSubmitted} />`, `<RequestDashboard refreshTrigger={refreshTrigger} />`
- Inline styles only

---

## `requirements.txt`
```
fastapi==0.111.0
uvicorn==0.29.0
pydantic==2.7.1
openai==1.30.1
python-dotenv==1.0.1
```

---

## `.env.example`
```
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Validation Checklist

- [ ] `GET /health` returns `{"status": "ok", ...}` with HTTP 200
- [ ] `POST /api/requests` with a valid body returns a classified `ServiceRequestOutput` with all 11 fields populated
- [ ] `POST /api/requests` with `request_text` under 10 chars returns HTTP 422
- [ ] `GET /api/requests` returns an array (empty or non-empty)
- [ ] `GET /api/requests?category=Facility+Maintenance` returns only Facility Maintenance records
- [ ] `GET /api/requests/999` returns HTTP 404 when no such record exists
- [ ] `civic_requests.db` is created automatically in `backend/` on first uvicorn startup
- [ ] The rule-based fallback fires when `OPENAI_API_KEY` is not set and correctly classifies "elevator is broken" as Facility Maintenance / High
- [ ] The React dashboard auto-refreshes after a successful form submission
- [ ] The entire app runs with no CSS files — all styles are inline in JSX
