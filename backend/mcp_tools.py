"""MCP-style tool functions that simulate integration with external city systems."""


def create_service_ticket_tool(request_id: int, category: str, priority: str) -> dict:
    """Simulates creating a service ticket in an external system."""
    return {
        "tool": "create_service_ticket",
        "ticket_id": f"LA-DGS-{request_id:05d}",
        "status": "created",
        "category": category,
        "priority": priority,
        "message": f"Ticket LA-DGS-{request_id:05d} created successfully.",
    }


def route_department_tool(department: str, ticket_id: str) -> dict:
    """Simulates routing a ticket to the correct department queue."""
    return {
        "tool": "route_department",
        "department": department,
        "ticket_id": ticket_id,
        "status": "routed",
        "message": f"Ticket {ticket_id} routed to {department}.",
    }


def classify_request_tool(category: str, confidence: str = "rule-based") -> dict:
    """Simulates an MCP classification tool call."""
    return {
        "tool": "classify_request",
        "category": category,
        "confidence": confidence,
        "status": "classified",
    }
