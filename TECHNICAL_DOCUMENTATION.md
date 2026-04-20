# DocuMind Technical Documentation

## Overview

DocuMind is a two-part application:

- A `Next.js` frontend that lets a user upload documents, select one or more documents, and ask grounded questions in a chat-style workspace.
- A `FastAPI` backend that stores uploaded files locally, extracts text, chunks and indexes the extracted content, retrieves relevant chunks for each question, and sends grounded prompts to a local Ollama model.

The current system is optimized for local development rather than production infrastructure. Files, indexes, and metadata are written to disk, chat sessions are stored only in frontend memory, and retrieval uses simple keyword matching instead of vector search.

## Repository Structure

### Frontend

- `frontend/app`
  Contains the Next.js app router entrypoints, layout shell, homepage view, and page-level logic hook.
- `frontend/components/chat`
  Contains the chat workspace UI primitives: session list, document upload panel, and source selection panel.
- `frontend/components/ui`
  Contains shared UI primitives such as the reusable `Button`.
- `frontend/lib`
  Contains the backend API client, Redux setup, utility helpers, and typed hooks.
- `frontend/types`
  Contains TypeScript models for UI state and backend API contracts.

### Backend

- `backend/app/main.py`
  FastAPI entrypoint, CORS setup, and root route.
- `backend/app/api`
  Route definitions and API router composition.
- `backend/app/schemas`
  Pydantic request and response models.
- `backend/app/services`
  Application logic for upload, storage, indexing, retrieval, and LLM chat.
- `backend/data`
  Local runtime storage for uploaded files, document metadata records, and chunk indexes.

## Frontend Architecture

### Rendering Model

The frontend is a client-heavy Next.js application. The main page at `frontend/app/page.tsx` is mostly presentational. State and side effects live in `frontend/app/page.code.tsx` inside `useHomePageCode`.

This hook is the coordination layer for the frontend and manages:

- Current draft message text
- Uploaded document list fetched from the backend
- Which documents are selected for retrieval
- In-memory chat sessions
- In-memory message history per session
- Loading, upload, and send states
- User-facing error messages

### Frontend Data Flow

The typical user flow is:

1. The page loads and `useHomePageCode` calls `listDocuments(userId)`.
2. The backend returns document metadata.
3. The hook maps backend document records into `DocumentItem` values for display in the source panel.
4. The user uploads a file from `DocumentUpload`.
5. The hook calls `uploadDocument(file, userId)`.
6. The newly uploaded document is inserted into the local document list and automatically selected.
7. The user enters a prompt and submits the form.
8. The hook calls `chatWithDocuments({ document_ids, message })`.
9. The backend returns an answer plus citations.
10. The frontend appends the assistant answer to the selected session and includes citations inline in the message body.

### Session Model

Sessions are frontend-only and currently not persisted. Each session tracks:

- `id`
- `title`
- `preview`
- `updatedAt`
- `activeDocumentIds`

The actual message list is stored separately in `messagesBySession`. This keeps the session list lightweight while allowing different conversations to reuse the same document pool.

### Important Frontend Components

- `frontend/app/layout.tsx`
  Defines the global shell, header, footer, and provider wrapping.
- `frontend/app/page.tsx`
  Renders the three-column chat workspace and binds UI elements to the hook state.
- `frontend/components/chat/chat-history.tsx`
  Shows local chat sessions and allows switching or creating sessions.
- `frontend/components/chat/source-panel.tsx`
  Shows upload controls and the list of selectable documents.
- `frontend/components/chat/document-upload.tsx`
  Handles the file input and exposes upload state.
- `frontend/lib/api.ts`
  Encapsulates all fetch calls to the backend.

### Frontend State and Dependencies

Redux is configured, but the current chat experience does not depend on Redux state. The included store and counter slice appear to be scaffolding from a starter template. Most application behavior is currently managed with React local state in `useHomePageCode`.

The major frontend dependencies are:

- `next` and `react`
- `tailwindcss` for styling
- `lucide-react` for icons
- `class-variance-authority`, `clsx`, and `tailwind-merge` for component styling helpers
- `react-redux` and `@reduxjs/toolkit` for the existing provider/store scaffolding

## Backend Architecture

### API Layer

The backend exposes three main route groups:

- `/api/v1/health`
  Service readiness checks.
- `/api/v1/documents`
  Document upload and document listing.
- `/api/v1/chat`
  Document-grounded question answering.

`backend/app/api/router.py` wires these route groups into the FastAPI app in `backend/app/main.py`.

### Upload and Indexing Pipeline

The main backend orchestration lives in `backend/app/services/document_pipeline.py`.

When a file is uploaded:

1. `BlobStorageService.upload_document` saves the raw file to local disk under `backend/data/uploads/<user_id>/`.
2. `DocumentPipeline._extract_text` chooses an extraction strategy based on file extension.
3. Supported text extraction currently includes:
   - `txt`
   - `md`
   - `csv`
   - `json`
   - `pdf`
   - `docx`
4. `IndexService.chunk_text` normalizes whitespace and breaks the text into fixed-size chunks.
5. `IndexService.save_index` writes chunk data to `backend/data/indexes/<document_id>.json`.
6. `IndexService.save_document_record` writes metadata to `backend/data/records/<document_id>.json`.
7. The upload endpoint returns a `DocumentUploadResponse`.

### Extraction Logic

Extraction is intentionally simple:

- Plain-text formats are decoded as UTF-8 and fall back to Latin-1.
- PDFs are parsed with `pypdf`, page by page.
- DOCX files are parsed with `python-docx`, paragraph by paragraph.

This means the quality of retrieval depends directly on extractor output. Scanned PDFs without embedded text will not produce useful answers unless an OCR step is added later.

### Retrieval Model

Retrieval is implemented in `IndexService.search`.

Current behavior:

- The document index is loaded from local JSON.
- The question is split into lowercase terms.
- Each chunk is scored by counting occurrences of those terms.
- The top matching chunks are returned.
- If no chunks match, the service falls back to the first few chunks.

This is intentionally lightweight and easy to inspect, but it is not semantic retrieval. Similar wording mismatches can reduce answer quality. A future upgrade path would be embeddings plus vector search.

### Chat / LLM Integration

`backend/app/services/chat_service.py` is the LLM integration layer.

Current behavior:

1. The pipeline passes retrieved chunks and selected document ids into `ChatService.answer`.
2. The service builds citations from the retrieved chunks.
3. It formats the chunks into a bounded text context block.
4. It sends a grounded chat request to Ollama at `OLLAMA_BASE_URL/api/chat`.
5. The configured model is read from `OLLAMA_MODEL`.
6. The answer is returned as `ChatResponse`.

The prompt instructs the model to:

- Use only the provided context
- Admit when the answer is not present
- Cite chunk ids inline

### Configuration

Backend configuration is defined in `backend/app/core/config.py` and loaded from `backend/.env`.

Important current settings:

- `API_V1_PREFIX`
- `FRONTEND_ORIGIN`
- `LOCAL_STORAGE_PATH`
- `LLM_PROVIDER`
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`
- `OLLAMA_TIMEOUT_SECONDS`

Some Azure-related settings are still present in the config class as placeholders from the original scaffold, but the active chat path currently uses Ollama.

## End-to-End Request Lifecycles

### Upload Lifecycle

1. User selects a file in the frontend.
2. The frontend sends a multipart upload request with `file` and `user_id`.
3. The backend saves the file to local storage.
4. The backend extracts text.
5. The backend chunks and indexes the text.
6. The backend stores a metadata record.
7. The frontend updates the visible document list and auto-selects the new file.

### Chat Lifecycle

1. User selects one or more documents.
2. User submits a prompt.
3. The frontend posts `document_ids` and `message` to `/api/v1/chat`.
4. The backend searches the local indexes for each selected document.
5. The backend sends the aggregated context to Ollama.
6. Ollama returns a grounded answer.
7. The backend returns the answer plus citations.
8. The frontend appends the result to the active session.

## Current Limitations

- Chat sessions are not persisted across refreshes.
- Retrieval is keyword-based rather than semantic.
- Uploaded files, indexes, and metadata are stored only on local disk.
- There is no authentication; the frontend uses a hardcoded `demo-user`.
- No OCR exists for scanned PDFs or image-based documents.
- Citations are appended as plain text instead of rendered as structured UI.
- Azure config fields remain in the backend settings even though the current path is local.
- The frontend still contains starter-template Redux artifacts that are not central to the current feature set.

## Recommended Next Steps

### Frontend

- Persist chat sessions to local storage or the backend.
- Replace the hardcoded `demo-user` with real authentication.
- Render citations in a dedicated component instead of embedding them into message text.
- Remove unused starter-template code or adopt Redux intentionally for shared app state.

### Backend

- Replace keyword search with embeddings and vector retrieval.
- Add OCR for scanned PDFs.
- Add structured logging and request tracing.
- Move file storage and indexes to production-ready infrastructure when needed.
- Consider async background indexing for larger files.

## Handoff Notes

For a new engineer, the most important files to read first are:

- `frontend/app/page.code.tsx`
- `frontend/lib/api.ts`
- `backend/app/services/document_pipeline.py`
- `backend/app/services/index_service.py`
- `backend/app/services/chat_service.py`

Those five files cover most of the real application behavior and make the rest of the codebase much easier to understand.
