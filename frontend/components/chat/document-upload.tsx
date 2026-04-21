"use client";

// Small presentational uploader used by the source panel.
import { cn } from "@/lib/utils";
import { FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { ChangeEvent } from "react";

interface DocumentUploadProps {
  isUploading: boolean;
  handleUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function DocumentUpload({
  isUploading,
  handleUpload,
}: DocumentUploadProps) {
  return (
    <div className="self-stretch h-60 relative bg-gray-50 rounded-[10px] outline outline-2 outline-offset-[-2px] outline-gray-300">
      <div className="w-12 h-12 left-[143.50px] top-[34px] absolute overflow-hidden">
        <Upload className="h-10 w-10 text-gray-400" />
      </div>
      <div className="w-64 h-12 left-[34px] top-[98px] absolute">
        <div className="w-64 left-0 top-[-1.50px] absolute text-center justify-start text-gray-600 text-base font-normal font-['Segoe_UI_Emoji'] leading-6">
          Drag and drop your documents here, or
        </div>
      </div>
      <label className="w-20 h-6 left-[125.82px] top-[154px] absolute cursor-pointer">
        <div className="left-0 top-[-1.50px] absolute text-center justify-start text-blue-500 text-base font-medium font-['Segoe_UI_Emoji'] underline leading-6">
          browse files
        </div>
        <input
          className="hidden"
          disabled={isUploading}
          onChange={handleUpload}
          type="file"
        />
      </label>
      <div className="w-64 h-4 left-[34px] top-[210px] absolute inline-flex justify-start items-start">
        <div className="flex-1 text-center justify-start text-gray-500 text-xs font-normal font-['Segoe_UI_Emoji'] leading-4">
          Supports PDF, DOC, DOCX, TXT, MD
        </div>
      </div>
    </div>
  );
}
