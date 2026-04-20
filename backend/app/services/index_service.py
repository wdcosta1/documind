"""Local indexing utilities for chunking, persisting, and searching document text."""

import json
from pathlib import Path
from typing import Any

from app.core.config import settings


class IndexService:
    def chunk_text(self, content: str, size: int = 800) -> list[dict[str, str]]:
        """Splits normalized text into fixed-size chunks for simple retrieval."""
        normalized = " ".join(content.split())
        if not normalized:
            return []

        chunks: list[dict[str, str]] = []
        for index, start in enumerate(range(0, len(normalized), size), start=1):
            text = normalized[start : start + size]
            chunks.append({"chunk_id": f"chunk-{index}", "text": text})
        return chunks

    def save_index(self, document_id: str, filename: str, chunks: list[dict[str, str]]) -> None:
        """Writes the searchable chunk payload to local disk."""
        index_root = Path(settings.local_storage_path) / "indexes"
        index_root.mkdir(parents=True, exist_ok=True)

        payload = {
            "document_id": document_id,
            "filename": filename,
            "chunks": chunks,
        }
        (index_root / f"{document_id}.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def load_index(self, document_id: str) -> dict:
        """Loads the persisted chunk payload for a single document id."""
        index_file = Path(settings.local_storage_path) / "indexes" / f"{document_id}.json"
        if not index_file.exists():
            raise FileNotFoundError(f"Document index not found for {document_id}")
        return json.loads(index_file.read_text(encoding="utf-8"))

    def save_document_record(self, record: dict[str, Any]) -> None:
        """Stores document metadata used by the list-documents endpoint."""
        record_root = Path(settings.local_storage_path) / "records"
        record_root.mkdir(parents=True, exist_ok=True)
        (record_root / f"{record['document_id']}.json").write_text(json.dumps(record, indent=2), encoding="utf-8")

    def list_document_records(self, user_id: str) -> list[dict[str, Any]]:
        """Returns only the document records that belong to the requested user."""
        record_root = Path(settings.local_storage_path) / "records"
        if not record_root.exists():
            return []

        records: list[dict[str, Any]] = []
        for file_path in sorted(record_root.glob("*.json"), reverse=True):
            payload = json.loads(file_path.read_text(encoding="utf-8"))
            if payload.get("user_id") == user_id:
                records.append(payload)
        return records

    def search(self, document_id: str, query: str, limit: int = 3) -> list[dict[str, str]]:
        """Performs a simple keyword-count ranking over stored chunks."""
        data = self.load_index(document_id)
        terms = [term.lower() for term in query.split() if term.strip()]
        scored: list[tuple[int, dict[str, str]]] = []

        for chunk in data["chunks"]:
            haystack = chunk["text"].lower()
            score = sum(haystack.count(term) for term in terms)
            if score > 0:
                scored.append((score, chunk))

        scored.sort(key=lambda item: item[0], reverse=True)
        return [chunk for _, chunk in scored[:limit]] or data["chunks"][:limit]


index_service = IndexService()
