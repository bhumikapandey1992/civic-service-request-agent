"""Pydantic v2 schemas for request validation and response serialization."""

from pydantic import BaseModel, field_validator


class ServiceRequestInput(BaseModel):
    """Validates incoming service request submissions from staff."""

    request_text: str
    location: str
    submitted_by: str

    @field_validator("request_text")
    @classmethod
    def validate_request_text(cls, v: str) -> str:
        """Ensure request text has meaningful content."""
        if len(v.strip()) < 10:
            raise ValueError("request_text must be at least 10 characters")
        return v.strip()

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        """Ensure location is provided."""
        if len(v.strip()) < 2:
            raise ValueError("location must be at least 2 characters")
        return v.strip()

    @field_validator("submitted_by")
    @classmethod
    def validate_submitted_by(cls, v: str) -> str:
        """Ensure submitter name is provided."""
        if len(v.strip()) < 2:
            raise ValueError("submitted_by must be at least 2 characters")
        return v.strip()


class ServiceRequestOutput(BaseModel):
    """Serializes a complete service request record for API responses."""

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
