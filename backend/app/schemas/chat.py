"""Pydantic models for chat request and response payloads."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Frontend payload describing which documents to search and what to ask."""
    document_ids: list[str] = Field(..., min_length=1, description="Identifiers returned at upload time")
    message: str = Field(..., min_length=1, description="User prompt")


class Citation(BaseModel):
    """Short citation snippet tied to a retrieved chunk in the local index."""
    chunk_id: str
    preview: str


class ChatResponse(BaseModel):
    """Model answer plus the chunk previews used to ground the response."""
    answer: str
    citations: list[Citation]
    used_llm: bool
