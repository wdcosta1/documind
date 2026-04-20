// API contract types mirrored from the FastAPI response models.
export type DocumentSummary = {
  document_id: string
  filename: string
  storage_uri: string
  chunk_count: number
  status: string
  uploaded_at: string
  user_id: string
}

export type UploadResponse = {
  document_id: string
  filename: string
  storage_uri: string
  chunk_count: number
  status: string
  uploaded_at: string
  user_id: string
}

export type ChatCitation = {
  chunk_id: string
  preview: string
}

export type ChatRequest = {
  document_ids: string[]
  message: string
}

export type ChatResponse = {
  answer: string
  citations: ChatCitation[]
  used_llm: boolean
}
