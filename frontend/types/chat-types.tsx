// UI-facing types used by the chat workspace state and components.
export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
};

export type ChatSession = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  activeDocumentIds: string[];
};

export type DocumentItem = {
  id: string;
  name: string;
  status: "Indexed" | "Processing";
  size: string;
  uploadedAt: string;
};
