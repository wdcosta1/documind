"""HTTP endpoint for document-grounded chat requests."""

from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.document_pipeline import document_pipeline


router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat_with_document(payload: ChatRequest) -> ChatResponse:
    """Runs retrieval over the selected documents and asks the configured LLM to answer."""
    return await document_pipeline.chat(payload)
