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
import { cn } from "@/lib/utils";
import { ChatMessage, ChatSession, DocumentItem } from "@/types/chat-types";

interface ChaWorkspaceProps {
  errorMessage: string | null;
  selectedMessages: ChatMessage[];
  isSending: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  draft: string;
  setDraft: (value: string) => void;
  selectedSession: ChatSession;
  selectedDocuments: DocumentItem[];
}

export default function ChatWorkspace({
  errorMessage,
  selectedMessages,
  isSending,
  handleSubmit,
  draft,
  setDraft,
  selectedSession,
  selectedDocuments,
}: ChaWorkspaceProps) {
  return (
    <section className="flex-1 inline-flex flex-col justify-start items-start w-full">
      <div className="border-b border-border/70 px-6 py-5 w-full">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              {selectedSession.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDocuments.length > 0 ? (
              selectedDocuments.map((document) => (
                <div
                  className="rounded-full border border-primary/20 bg-[#2B7FFF] text-white px-3 py-1 text-sm font-medium text-primary"
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

      {selectedMessages.length === 1 ? (
        <div className="flex-1 inline-flex flex-col justify-start items-start">
          <div className="self-stretch px-44 py-20 flex flex-col justify-start items-start gap-2">
            <div className="self-stretch h-8 inline-flex justify-start items-start">
              <div className="flex-1 text-center justify-start text-gray-900 text-2xl font-medium font-['Segoe_UI_Emoji'] leading-8">
                Welcome to DocuMind
              </div>
            </div>
            <div className="self-stretch h-16 text-center justify-start text-gray-600 text-base font-normal font-['Segoe_UI_Emoji'] leading-6">
              Upload documents on the right and start asking questions about
              them. Your FastAPI backend will handle document indexing and AI
              responses.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 w-full max-h-[calc(100vh-400px)]">
            {selectedMessages.map((message) => (
              <>
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
                        ? "bg-[#2B7FFF] text-white"
                        : "border border-border/70 bg-[#F3F4F6] text-slate-800",
                    )}
                  >
                    <p className="text-sm leading-7">{message.content}</p>
                  </div>
                </div>
                <div>
                  <span
                    className={cn(
                      "flex text-xs text-muted-foreground align-right justify-end flex w-full",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {message.timestamp}
                  </span>
                </div>
              </>
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
        </>
      )}
      <div className="w-full h-25 px-4 pt-4 bg-white border-gray-200 flex flex-col justify-center items-center">
        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
          <div className="self-stretch w-full h-20 inline-flex justify-start items-start gap-2">
            <div className="flex-1 w-full h-auto px-4 py-3 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-gray-300 flex justify-start items-start">
              <textarea
                className="justify-start text-neutral-950/50 h-20 px-2 text-base font-normal font-['Segoe_UI_Emoji'] leading-6 w-full"
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask a question about your documents"
                value={draft}
              />
              <Button
                className="self-start sm:self-auto"
                disabled={isSending}
                type="submit"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 bg-[#2B7FFF] text-white" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
