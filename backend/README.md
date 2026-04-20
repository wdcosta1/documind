# Backend

FastAPI backend for document upload, lightweight local indexing, and document-grounded chat with Ollama.

## Run locally

1. Create a virtual environment.
2. Install dependencies from `requirements.txt`.
3. Set the values in `.env`.
4. Make sure Ollama is running locally and the model in `OLLAMA_MODEL` is pulled.
5. Start the API with:

```bash
uvicorn app.main:app --reload
```

## Ollama configuration

Use these environment variables:

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT_SECONDS=60
```

Example setup:

```bash
ollama serve
ollama pull llama3.2
```

## Current behavior

- `POST /api/v1/documents/upload` stores files locally and creates a lightweight local text index.
- `POST /api/v1/chat` retrieves matching chunks from the uploaded document index and sends them to Ollama as grounded context.
- Supported text extraction includes `txt`, `md`, `csv`, `json`, `pdf`, and `docx` files.
- If you uploaded a PDF or DOCX before enabling extraction, re-upload it so the backend rebuilds the local index with the extracted text.
