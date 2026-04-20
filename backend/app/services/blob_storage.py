"""Local file storage service used in place of cloud blob storage during development."""

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings


class BlobStorageService:
    async def upload_document(self, file: UploadFile, user_id: str) -> tuple[str, str, bytes]:
        """Persists the raw uploaded file and returns its id, path, and bytes for downstream indexing."""
        document_id = str(uuid4())
        file_bytes = await file.read()
        safe_name = file.filename or "document.txt"

        root = Path(settings.local_storage_path) / "uploads" / user_id
        root.mkdir(parents=True, exist_ok=True)

        destination = root / f"{document_id}-{safe_name}"
        destination.write_bytes(file_bytes)
        return document_id, destination.as_posix(), file_bytes


blob_storage_service = BlobStorageService()
