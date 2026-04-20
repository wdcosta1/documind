# docuMind

Built a full-stack document intelligence app with Next.js and FastAPI that enables grounded Q&A over uploaded files using local indexing and Ollama LLM.

## Structure

- `frontend/`: Next.js app with App Router, Tailwind, Redux Toolkit, and shadcn-style UI primitives.
- `backend/`: FastAPI API scaffold for document upload, indexing, and chat orchestration.

## Frontend

```bash
cd frontend
npm run dev
```

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Planned Azure flow

1. Upload the original file to Azure Blob Storage.
2. Extract and chunk document text.
3. Push chunks and metadata into Azure AI Search.
4. Retrieve relevant chunks for each question.
5. Send the question plus retrieved context to your LLM.
