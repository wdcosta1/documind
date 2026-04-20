// Thin frontend API client for the FastAPI backend.
import {
  ChatRequest,
  ChatResponse,
  DocumentSummary,
  UploadResponse,
} from "@/types/api-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function handleResponse<T>(response: Response): Promise<T> {
  // Normalize backend errors so components can show a single message string.
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(
      payload?.detail ?? `Request failed with status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

export async function listDocuments(
  userId: string,
): Promise<DocumentSummary[]> {
  const response = await fetch(
    `${API_BASE_URL}/documents?user_id=${encodeURIComponent(userId)}`,
    {
      cache: "no-store",
    },
  );

  return handleResponse<DocumentSummary[]>(response);
}

export async function uploadDocument(
  file: File,
  userId: string,
): Promise<UploadResponse> {
  // Upload uses `FormData` because FastAPI expects both the file and user id as multipart fields.
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<UploadResponse>(response);
}

export async function chatWithDocuments(
  payload: ChatRequest,
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ChatResponse>(response);
}
