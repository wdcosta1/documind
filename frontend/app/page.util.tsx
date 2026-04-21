// Shared page helpers and initial mock session state used by the homepage hook.
import { ChatMessage, ChatSession } from "@/types/chat-types";

export const userId = "demo-user";

export const initialSessions: ChatSession[] = [
  {
    id: "session-1",
    title: "New Document Chat",
    preview: "Ask questions against one or more uploaded documents.",
    updatedAt: "Just now",
    activeDocumentIds: [],
  },
];

export const initialMessages: Record<string, ChatMessage[]> = {
  "session-1": [
    {
      id: "m-1",
      role: "assistant",
      content:
        "Upload a document on the right, select it, and ask a question. I will call the FastAPI backend and respond with content from the indexed document set.",
      timestamp: "Now",
    },
  ],
};

export function formatRelativeDate(value: string) {
  // The backend returns ISO timestamps, but the UI displays friendlier local time labels.
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "Unknown size";
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
