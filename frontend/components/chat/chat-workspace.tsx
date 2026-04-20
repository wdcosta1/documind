"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { chatWithDocuments, listDocuments, uploadDocument } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ChatMessage, ChatSession, DocumentItem } from "@/types/chat-types";
import ChatHistory from "./chat-history";
import SourcePanel from "./source-panel";



const userId = "demo-user";

const initialSessions: ChatSession[] = [
  {
    id: "session-1",
    title: "New Document Chat",
    preview: "Ask questions against one or more uploaded documents.",
    updatedAt: "Just now",
    activeDocumentIds: [],
  },
];

const initialMessages: Record<string, ChatMessage[]> = {
  "session-1": [
    {
      id: "m-1",
      role: "assistant",
      content:
        "Upload a document on the right, select it, and ask a question. I will call the FastAPI backend and respond with grounded content from the indexed document set.",
      timestamp: "Now",
    },
  ],
};

function formatRelativeDate(value: string) {
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

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "Unknown size";
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatWorkspace() {
  const [sessions, setSessions] = useState(initialSessions);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState(
    initialSessions[0].id,
  );
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [messagesBySession, setMessagesBySession] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
  const selectedMessages = messagesBySession[selectedSessionId] ?? [];

  useEffect(() => {
    let ignore = false;

    async function loadDocuments() {
      try {
        setIsLoadingDocuments(true);
        setErrorMessage(null);

        const response = await listDocuments(userId);
        if (ignore) {
          return;
        }

        setDocuments(
          response.map((document) => ({
            id: document.document_id,
            name: document.filename,
            status: document.status === "indexed" ? "Indexed" : "Processing",
            size:
              document.chunk_count > 0
                ? `${document.chunk_count} chunks`
                : "Pending",
            uploadedAt: formatRelativeDate(document.uploaded_at),
          })),
        );
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load documents.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingDocuments(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedDocuments = useMemo(
    () =>
      documents.filter((document) => selectedDocumentIds.includes(document.id)),
    [documents, selectedDocumentIds],
  );

  const handleSelectSession = (session: ChatSession) => {
    setSelectedSessionId(session.id);
    setSelectedDocumentIds(session.activeDocumentIds);
    setErrorMessage(null);
  };

  const handleCreateSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: "New Document Chat",
      preview:
        "Start a fresh conversation against one or more uploaded documents.",
      updatedAt: "Just now",
      activeDocumentIds: [],
    };

    setSessions((current) => [newSession, ...current]);
    setMessagesBySession((current) => ({
      ...current,
      [newSession.id]: [
        {
          id: `m-${Date.now()}`,
          role: "assistant",
          content:
            "New session created. Select documents on the right, then send a question to the backend.",
          timestamp: "Now",
        },
      ],
    }));
    setSelectedSessionId(newSession.id);
    setSelectedDocumentIds([]);
    setErrorMessage(null);
  };

  const handleToggleDocument = (documentId: string) => {
    setSelectedDocumentIds((current) => {
      const next = current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId];

      setSessions((existing) =>
        existing.map((session) =>
          session.id === selectedSessionId
            ? { ...session, activeDocumentIds: next, updatedAt: "Just now" }
            : session,
        ),
      );

      return next;
    });
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);

      const response = await uploadDocument(file, userId);
      const uploadedDocument: DocumentItem = {
        id: response.document_id,
        name: response.filename,
        status:
          response.status === "uploaded_and_indexed" ? "Indexed" : "Processing",
        size: formatFileSize(file.size),
        uploadedAt: formatRelativeDate(response.uploaded_at),
      };

      setDocuments((current) => [
        uploadedDocument,
        ...current.filter((item) => item.id !== uploadedDocument.id),
      ]);
      setSelectedDocumentIds((current) => [
        uploadedDocument.id,
        ...current.filter((id) => id !== uploadedDocument.id),
      ]);
      setSessions((current) =>
        current.map((session) =>
          session.id === selectedSessionId
            ? {
                ...session,
                activeDocumentIds: [
                  uploadedDocument.id,
                  ...session.activeDocumentIds.filter(
                    (id) => id !== uploadedDocument.id,
                  ),
                ],
                updatedAt: "Just now",
              }
            : session,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Upload failed.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedDraft = draft.trim();

    if (!trimmedDraft || isSending) {
      return;
    }

    if (selectedDocumentIds.length === 0) {
      setErrorMessage(
        "Select at least one uploaded document before sending a message.",
      );
      return;
    }

    const now = "Now";
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedDraft,
      timestamp: now,
    };

    setErrorMessage(null);
    setIsSending(true);
    setDraft("");
    setMessagesBySession((current) => ({
      ...current,
      [selectedSessionId]: [...(current[selectedSessionId] ?? []), userMessage],
    }));

    try {
      const response = await chatWithDocuments({
        document_ids: selectedDocumentIds,
        message: trimmedDraft,
      });

      const citations =
        response.citations.length > 0
          ? `\n\nCitations:\n${response.citations
              .map((citation) => `- ${citation.chunk_id}: ${citation.preview}`)
              .join("\n")}`
          : "";

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: "assistant",
        content: `${response.answer}${citations}`,
        timestamp: "Now",
      };

      setMessagesBySession((current) => ({
        ...current,
        [selectedSessionId]: [
          ...(current[selectedSessionId] ?? []),
          assistantMessage,
        ],
      }));

      setSessions((current) =>
        current.map((session) =>
          session.id === selectedSessionId
            ? {
                ...session,
                title:
                  session.title === "New Document Chat"
                    ? trimmedDraft.slice(0, 36)
                    : session.title,
                preview: trimmedDraft,
                updatedAt: "Just now",
                activeDocumentIds: selectedDocumentIds,
              }
            : session,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Chat request failed.";
      setErrorMessage(message);
      setMessagesBySession((current) => ({
        ...current,
        [selectedSessionId]: [
          ...(current[selectedSessionId] ?? []),
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            content: `The backend request failed: ${message}`,
            timestamp: "Now",
          },
        ],
      }));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        <ChatHistory
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          handleSelectSession={handleSelectSession}
          handleCreateSession={handleCreateSession}
        />

        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/80 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="border-b border-border/70 px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">
                  Active conversation
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                  {selectedSession.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Ask questions grounded in your selected documents, then
                  surface answers, summaries, and citations.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDocuments.length > 0 ? (
                  selectedDocuments.map((document) => (
                    <div
                      className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                      key={document.id}
                    >
                      {document.name}
                    </div>
                  ))
                ) : (
                  <div className="rounded-full border border-border bg-background/80 px-3 py-1 text-sm text-muted-foreground">
                    No documents selected
                  </div>
                )}
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="mx-6 mt-5 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errorMessage}
              </div>
            </div>
          ) : null}

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {selectedMessages.map((message) => (
              <div
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
                key={message.id}
              >
                <div
                  className={cn(
                    "max-w-3xl whitespace-pre-wrap rounded-[1.5rem] px-5 py-4 shadow-sm",
                    message.role === "user"
                      ? "bg-slate-950 text-white"
                      : "border border-border/70 bg-background/90 text-slate-800",
                  )}
                >
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] opacity-70">
                    {message.role === "user" ? "You" : "Assistant"}
                    <span>{message.timestamp}</span>
                  </div>
                  <p className="text-sm leading-7">{message.content}</p>
                </div>
              </div>
            ))}

            {isSending ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 rounded-[1.5rem] border border-border/70 bg-background/90 px-5 py-4 text-sm text-slate-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating an answer from the backend...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-border/70 px-6 py-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="rounded-[1.5rem] border border-border bg-background/80 p-3 shadow-inner">
                <textarea
                  className="min-h-[120px] w-full resize-none bg-transparent p-2 text-sm text-slate-900 outline-none placeholder:text-muted-foreground"
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask about the selected document set. Example: Summarize the renewal clauses and highlight obligations for our team."
                  value={draft}
                />
                <div className="flex flex-col gap-3 border-t border-border/70 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                    Messages are sent to FastAPI with the selected document ids.
                  </div>
                  <Button
                    className="gap-2 self-start sm:self-auto"
                    disabled={isSending}
                    type="submit"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send message
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <SourcePanel
          isUploading={isUploading}
          handleUpload={handleUpload}
          documents={documents}
          isLoadingDocuments={isLoadingDocuments}
          selectedDocumentIds={selectedDocumentIds}
          handleToggleDocument={handleToggleDocument}
        />
      </div>
    </main>
  );
}
