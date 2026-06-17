"""Plain Python dataclasses representing domain models (no ORM)."""

from dataclasses import dataclass


@dataclass
class ServiceRequest:
    """Represents a civic service request record from the database."""

    id: int
    request_text: str
    location: str
    submitted_by: str
    category: str
    priority: str
    summary: str
    recommended_action: str
    department: str
    status: str
    created_at: str
