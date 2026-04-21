"use client";

import { AlertCircle, Loader2, Paperclip, Send } from "lucide-react";

import ChatHistory from "@/components/chat/chat-history";
import SourcePanel from "@/components/chat/source-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useHomePageCode } from "./page.code";
import ChatWorkspace from "@/components/chat/chat-workspace";

export default function HomePage() {
  // The page itself is intentionally presentation-focused. Most stateful behavior lives in `useHomePageCode`.
  const {
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
  } = useHomePageCode();

  return (
    <main className="min-h-screen">
      <div className="w-full self-stretch inline-flex justify-start items-start overflow-hidden">
        <ChatHistory
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          handleSelectSession={handleSelectSession}
          handleCreateSession={handleCreateSession}
        />
        <ChatWorkspace 
          draft={draft}
          errorMessage={errorMessage}
          handleSubmit={handleSubmit}
          isSending={isSending}
          selectedDocuments={selectedDocuments}
          selectedMessages={selectedMessages}
          setDraft={setDraft}
          selectedSession={selectedSession}
          />

          <SourcePanel
          isUploading={isUploading}
          handleUpload={handleUpload}
          documents={documents}
          isLoadingDocuments={isLoadingDocuments}
          selectedDocumentIds={selectedDocumentIds}
          handleToggleDocument={handleToggleDocument}
        />
      </div>
      {/* <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        <ChatHistory
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          handleSelectSession={handleSelectSession}
          handleCreateSession={handleCreateSession}
        />

        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/80  backdrop-blur">
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
      </div> */}
    </main>
  );
}
