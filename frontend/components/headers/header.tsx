"use client";

// Left rail that lists local chat sessions. Sessions are frontend-only for now and are not persisted.
import {
  ChevronDown,
  LogIn,
  MessageSquare,
  Plus,
  Search,
  Settings,
  UserCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  AwaitedReactNode,
} from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  return (
    <div className="w-full h-20 relative bg-white border-b border-gray-200">
      <div className="w-36 h-8 left-[24px] top-[24px] absolute inline-flex justify-start items-center gap-3">
        <div className="w-8 h-8 px-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[10px] flex justify-center items-center">
          <div className="w-3.5 h-7 relative">
            <div className="left-0 top-[-1px] absolute justify-start text-white text-lg font-bold font-['Segoe_UI_Emoji'] leading-7">
              D
            </div>
          </div>
        </div>
        <div className="flex-1 h-7 relative">
          <div className="left-0 top-[-2.50px] absolute justify-start text-gray-900 text-xl font-medium font-['Segoe_UI_Emoji'] leading-7">
            DocuMind
          </div>
        </div>
      </div>
      <div className="w-28 h-12 px-3 py-2 right-[24px] top-[16px] absolute rounded-[10px] inline-flex justify-start items-center gap-2">
        <div className="w-8 h-8 px-1.5 bg-gray-300 rounded-full flex justify-center items-center">
          <div className="w-5 h-5 relative overflow-hidden">
            <UserCircle2 className="h-5 w-5 text-gray-600" />
          </div>
        </div>
        <div className="w-7 h-5 relative">
          <div className="left-[-1px] top-[-1.50px] absolute text-center justify-start text-gray-700 text-sm font-medium font-['Segoe_UI_Emoji'] leading-5">
            User
          </div>
        </div>
        <div className="w-4 h-4 relative overflow-hidden">
            <ChevronDown className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  );
}
