"""FastAPI application entry point for the Civic Service Request Triage API."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from database import get_db_connection, init_db
from agent_service import classify_request_agent
from mcp_tools import create_service_ticket_tool, route_department_tool
from schemas import ServiceRequestInput, ServiceRequestOutput


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database on startup."""
    init_db()
    yield


app = FastAPI(
    title="Civic Service Request Triage API",
    description="Agentic triage system for the City of Los Angeles — Department of General Services",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Return service health status."""
    return {"status": "ok", "service": "Civic Service Request Triage API"}


@app.post("/api/requests", response_model=ServiceRequestOutput)
def create_request(body: ServiceRequestInput):
    """
    Accept a new service request, classify it via the agent, persist it, and
    simulate MCP tool calls for ticket creation and department routing.
    """
    classification = classify_request_agent(body.request_text)

    conn = get_db_connection()
    cursor = conn.execute(
        """
        INSERT INTO service_requests
            (request_text, location, submitted_by, category, priority,
             summary, recommended_action, department)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            body.request_text,
            body.location,
            body.submitted_by,
            classification["category"],
            classification["priority"],
            classification["summary"],
            classification["recommended_action"],
            classification["department"],
        ),
    )
    conn.commit()
    record = conn.execute(
        "SELECT * FROM service_requests WHERE id = ?", (cursor.lastrowid,)
    ).fetchone()
    conn.close()

    ticket_result = create_service_ticket_tool(
        record["id"], record["category"], record["priority"]
    )
    route_department_tool(record["department"], ticket_result["ticket_id"])

    return ServiceRequestOutput(**dict(record))


@app.get("/api/requests", response_model=list[ServiceRequestOutput])
def list_requests(
    category: str = Query(default=None),
    priority: str = Query(default=None),
):
    """Return all service requests, optionally filtered by category and/or priority."""
    query = "SELECT * FROM service_requests WHERE 1=1"
    params: list = []

    if category:
        query += " AND category = ?"
        params.append(category)
    if priority:
        query += " AND priority = ?"
        params.append(priority)

    query += " ORDER BY created_at DESC"

    conn = get_db_connection()
    rows = conn.execute(query, params).fetchall()
    conn.close()

    return [ServiceRequestOutput(**dict(row)) for row in rows]


@app.get("/api/requests/{request_id}", response_model=ServiceRequestOutput)
def get_request(request_id: int):
    """Return a single service request by its ID, or 404 if not found."""
    conn = get_db_connection()
    row = conn.execute(
        "SELECT * FROM service_requests WHERE id = ?", (request_id,)
    ).fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Request not found")

    return ServiceRequestOutput(**dict(row))
