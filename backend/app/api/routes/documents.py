"""HTTP endpoints for document upload and document listing."""

from fastapi import APIRouter, File, Form, Query, UploadFile

from app.schemas.document import DocumentSummary, DocumentUploadResponse
from app.services.document_pipeline import document_pipeline


router = APIRouter()


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
) -> DocumentUploadResponse:
    """Stores the uploaded file, indexes its text, and returns document metadata."""
    return await document_pipeline.upload(file=file, user_id=user_id)


@router.get("", response_model=list[DocumentSummary])
async def list_documents(user_id: str = Query(...)) -> list[DocumentSummary]:
    """Returns the uploaded documents that belong to the requested user."""
    return document_pipeline.list_documents(user_id=user_id)
