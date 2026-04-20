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
    <div className="mt-5 rounded-[1.5rem] border border-dashed border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Upload className="h-5 w-5" />
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Upload document
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              PDF, DOCX, TXT, CSV, or markdown can flow through Azure Blob and
              your indexing pipeline.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? "Uploading..." : "Choose file"}
            <input
              className="hidden"
              disabled={isUploading}
              onChange={handleUpload}
              type="file"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
