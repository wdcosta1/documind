"use client";

// Left rail that lists local chat sessions. Sessions are frontend-only for now and are not persisted.
import { ChartBarIcon, Command, MessageSquare, Plus, Search } from "lucide-react";
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
    <aside className="w-64 h-[817px] bg-gray-50 border-r border-gray-200 inline-flex flex-col justify-start items-start">
      <div className="w-64 h-16 px-4 pt-4 flex flex-col justify-start items-start">
        <button
          onClick={handleCreateSession}
          className="w-52 h-11 relative rounded-[31px] bg-[#2B7FFF] hover:opacity-90 transition-opacity flex items-center justify-center"
          type="button"
        >
          <div className="flex items-center gap-2 justify-center">
            <Plus className="h-4 w-4 text-white" />
            <span className="text-white text-base font-normal font-['Space_Grotesk']">
              New Chat
            </span>
          </div>
        </button>
      </div>

      <div className="w-64 flex-1 px-2 flex flex-col justify-start items-start overflow-hidden">
        <div className="self-stretch h-8 px-3 py-2 inline-flex justify-start items-start">
          <div className="flex-1 justify-start text-gray-500 text-xs font-medium font-['Segoe_UI_Emoji'] uppercase leading-4 tracking-wide">
            Chat History
          </div>
        </div>
        <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-1 overflow-y-auto">
          {sessions.map((session: any) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session)}
              className={cn(
                "self-stretch h-14 rounded-[10px] flex flex-col justify-start items-start p-3 transition-all",
                session.id === selectedSessionId
                  ? "bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
                  : "bg-gray-50 hover:bg-white"
              )}
              type="button"
            >
              <div className="flex items-start gap-3 w-full">
                <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-1 min-w-0">
                  <div className="self-stretch h-5 relative overflow-hidden">
                    <div className="justify-start text-gray-900 text-sm font-medium font-['Segoe_UI_Emoji'] leading-5 truncate">
                      {session.title}
                    </div>
                  </div>
                  <div className="self-stretch h-4 inline-flex justify-start items-start">
                    <div className="flex-1 justify-start text-gray-400 text-xs font-medium font-['Segoe_UI_Emoji'] leading-4 truncate">
                      {session.updatedAt}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
