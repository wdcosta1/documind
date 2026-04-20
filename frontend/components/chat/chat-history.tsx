"use client";

// Left rail that lists local chat sessions. Sessions are frontend-only for now and are not persisted.
import { MessageSquare, Plus, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  sessions: any[];
  handleCreateSession: () => void;
  selectedSessionId: string;
  handleSelectSession: (session: any) => void;
}

export default function ChatHistory({
  sessions,
  handleCreateSession,
  selectedSessionId,
  handleSelectSession
}: ChatHistoryProps) {
  return (
    <aside className="rounded-[1.75rem] border border-white/60 bg-white/80 p-4 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Chat History
          </h1>
        </div>
        <Button size="icon" onClick={handleCreateSession}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {sessions.map((session: any) => (
          <button
            className={cn(
              "w-full rounded-2xl border p-4 text-left transition-all",
              session.id === selectedSessionId
                ? "border-primary/40 bg-primary/10 shadow-sm"
                : "border-border/70 bg-white/60 hover:border-primary/20 hover:bg-white",
            )}
            key={session.id}
            onClick={() => handleSelectSession(session)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-xl bg-slate-950 p-2 text-white">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted-foreground">
                {session.updatedAt}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-950">
              {session.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {session.preview}
            </p>
          </button>
        ))}
      </div>
    </aside>
  );
}
