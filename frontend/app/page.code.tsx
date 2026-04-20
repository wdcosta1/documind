"use client";

// This hook owns the full home-page interaction model:
// loading uploaded documents, tracking chat sessions, uploading files,
// and sending grounded questions to the backend.
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

import { chatWithDocuments, listDocuments, uploadDocument } from "@/lib/api";
import { ChatMessage, ChatSession, DocumentItem } from "@/types/chat-types";

import {
  formatFileSize,
  formatRelativeDate,
  initialMessages,
  initialSessions,
  userId,
} from "./page.util";

export function useHomePageCode() {
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
      // Newly uploaded documents are auto-selected so the user can immediately ask about them.
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

      // Citations are rendered directly into the message body because the UI currently treats assistant
      // messages as plain text rather than a structured answer plus a sidecar citation component.
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

  return {
    draft,
    documents,
    errorMessage,
    handleCreateSession,
    handleSelectSession,
    handleSubmit,
    handleToggleDocument,
    handleUpload,
    isLoadingDocuments,
    isSending,
    isUploading,
    selectedDocumentIds,
    selectedDocuments,
    selectedMessages,
    selectedSession,
    selectedSessionId,
    sessions,
    setDraft,
  };
}
