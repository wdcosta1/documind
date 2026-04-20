"""Pydantic models that define document-related API payloads."""

from pydantic import BaseModel


class DocumentSummary(BaseModel):
    """Metadata returned when the frontend lists uploaded documents."""
    document_id: str
    filename: str
    storage_uri: str
    chunk_count: int
    status: str
    uploaded_at: str
    user_id: str


class DocumentUploadResponse(BaseModel):
    """Response payload returned immediately after upload and indexing."""
    document_id: str
    filename: str
    storage_uri: str
    chunk_count: int
    status: str
    uploaded_at: str
    user_id: str
