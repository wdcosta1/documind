"""Application service that orchestrates upload, extraction, indexing, and chat retrieval."""

from datetime import datetime, timezone
from io import BytesIO

from fastapi import HTTPException, UploadFile
from docx import Document as DocxDocument
from pypdf import PdfReader

from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.document import DocumentSummary, DocumentUploadResponse
from app.services.blob_storage import blob_storage_service
from app.services.chat_service import chat_service
from app.services.index_service import index_service


class DocumentPipeline:
    async def upload(self, file: UploadFile, user_id: str) -> DocumentUploadResponse:
        """Handles the full upload pipeline from raw file bytes to saved local index."""
        document_id, storage_uri, file_bytes = await blob_storage_service.upload_document(file, user_id)
        extracted_text = self._extract_text(file_bytes, file.filename or "document.txt")
        chunks = index_service.chunk_text(extracted_text)
        index_service.save_index(document_id, file.filename or "document.txt", chunks)
        uploaded_at = datetime.now(timezone.utc).isoformat()
        record = {
            "document_id": document_id,
            "filename": file.filename or "document.txt",
            "storage_uri": storage_uri,
            "chunk_count": len(chunks),
            "status": "indexed",
            "uploaded_at": uploaded_at,
            "user_id": user_id,
        }
        index_service.save_document_record(record)

        return DocumentUploadResponse(
            document_id=document_id,
            filename=file.filename or "document.txt",
            storage_uri=storage_uri,
            chunk_count=len(chunks),
            status="uploaded_and_indexed",
            uploaded_at=uploaded_at,
            user_id=user_id,
        )

    async def chat(self, payload: ChatRequest) -> ChatResponse:
        """Retrieves matching chunks across all selected documents before invoking the chat service."""
        chunks: list[dict[str, str]] = []
        missing_documents: list[str] = []

        for document_id in payload.document_ids:
            try:
                chunks.extend(index_service.search(document_id, payload.message))
            except FileNotFoundError:
                missing_documents.append(document_id)

        if missing_documents and not chunks:
            raise HTTPException(
                status_code=404,
                detail=f"Document index not found for: {', '.join(missing_documents)}",
            )

        return await chat_service.answer(payload.message, chunks, payload.document_ids)

    def list_documents(self, user_id: str) -> list[DocumentSummary]:
        """Returns serialized document records for the frontend source panel."""
        return [DocumentSummary(**record) for record in index_service.list_document_records(user_id=user_id)]

    def _extract_text(self, file_bytes: bytes, filename: str) -> str:
        """Dispatches to a format-specific extractor based on the uploaded filename."""
        suffix = filename.lower().rsplit(".", maxsplit=1)[-1] if "." in filename else "txt"
        if suffix == "pdf":
            return self._extract_pdf_text(file_bytes)

        if suffix == "docx":
            return self._extract_docx_text(file_bytes)

        if suffix not in {"txt", "md", "csv", "json"}:
            return (
                f"Unsupported document type: .{suffix}. Add a document extraction stage for this format "
                "before sending chunks to the retrieval and chat pipeline."
            )

        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1", errors="ignore")

    def _extract_pdf_text(self, file_bytes: bytes) -> str:
        """Extracts text from each PDF page and concatenates the non-empty results."""
        reader = PdfReader(BytesIO(file_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n\n".join(page.strip() for page in pages if page.strip())
        return text or "Uploaded PDF contained no extractable text."

    def _extract_docx_text(self, file_bytes: bytes) -> str:
        """Extracts visible paragraph text from a DOCX document."""
        document = DocxDocument(BytesIO(file_bytes))
        paragraphs = [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]
        text = "\n\n".join(paragraphs)
        return text or "Uploaded DOCX contained no extractable text."


document_pipeline = DocumentPipeline()
