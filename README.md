# DocuMind

AI-powered document Q&A application that lets users upload files and ask grounded questions using a locally running LLM (Ollama).

---

## 🚀 Demo


<div style="position: relative; padding-bottom: 54.114583333333336%; height: 0;"><iframe src="https://www.loom.com/embed/510965f9d0bb42a5abf1465d52ed1029" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>


---

<img width="1865" height="945" alt="image" src="https://github.com/user-attachments/assets/443f47bf-f324-4421-b85d-9a634e4afea4" />

## 🎨 Design & Wireframes

Figma designs for this project:

- 🧩 Wireframes
- 🎯 High-fidelity UI mockups
- 🏗 Architecture diagrams

👉 View in Figma: [https://www.figma.com/file/your-link](https://www.figma.com/design/HwuhHkoglpnkpdWgLLuzyZ/DocuMin?node-id=9-546&t=N9VbZuaW6hvQpKhH-1)

## ✨ Features

- 📄 Upload documents (PDF, DOCX, TXT, CSV, JSON, MD)
- 💬 Chat with your documents in a conversational UI
- 🧠 Grounded answers based only on document content
- 📚 Multi-document selection for contextual queries
- ⚡ Local LLM integration using Ollama
- 🗂 Lightweight indexing and retrieval pipeline

---

## 🛠 Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- TailwindCSS

**Backend**
- FastAPI (Python)
- Pydantic

**AI / Processing**
- Ollama (local LLM)
- Custom text extraction + chunking
- Keyword-based retrieval

---

## 🧩 Architecture Overview
User
↓
Next.js Frontend
↓
FastAPI Backend
↓
Text Extraction → Chunking → Local Index (JSON)
↓
Retrieval (keyword search)
↓
Ollama (LLM)
↓
Grounded Response + Citations


---

## 🔄 How It Works
### Upload Flow
1. User uploads a document
2. Backend stores file locally
3. Text is extracted based on file type
4. Content is chunked into smaller sections
5. Chunks are saved as a local index
6. Metadata is stored for retrieval

### Chat Flow
1. User selects one or more documents
2. User submits a question
3. Backend retrieves relevant chunks
4. Context is sent to Ollama
5. LLM generates a grounded response
6. Response + citations are returned to UI

---

## 🏃 Run Locally
### Prerequisites
- Node.js
- Python 3.9+
- Ollama installed and running

---

### 1. Start Ollama

bash ollama run llama3

### 2. Backend Setup
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

### 3. Frontend Setup
cd frontend
npm install
npm run dev

⚙️ Environment Variables
Create a .env file in the backend:
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
OLLAMA_TIMEOUT_SECONDS=60

⚠️ Current Limitations
Chat sessions are not persisted
Retrieval is keyword-based (not semantic)
No authentication (uses demo user)
Local file storage only (not cloud-ready)
No OCR for scanned documents
Citations are rendered as plain text

🚧 Future Improvements
Add embeddings + vector search
Persist chat sessions (DB or local storage)
Add authentication (Auth0 / Firebase)
OCR support for scanned PDFs
Deploy to cloud (Azure / AWS)
Streaming responses for better UX

💡 Why This Project?

DocuMind demonstrates how to build a lightweight, end-to-end Retrieval-Augmented Generation (RAG) system using a modern full-stack architecture and local LLM infrastructure.

It focuses on:

Clear data flow from ingestion → retrieval → generation
Developer-friendly, inspectable indexing
Local-first AI workflows without external dependencies

📬 Contact

If you’d like to discuss this project or collaborate, feel free to reach out!
