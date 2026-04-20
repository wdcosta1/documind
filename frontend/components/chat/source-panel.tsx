"use client";

// Right rail that combines document upload with the selectable document list used for retrieval scope.
import { cn } from "@/lib/utils";
import { FileText, Loader2, Sparkles, Upload } from "lucide-react";
import DocumentUpload from "./document-upload";
import { ChangeEvent } from "react";

interface SourcePanelProps {
  isUploading: boolean;
  handleUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  documents: any[];
  isLoadingDocuments: boolean;
  selectedDocumentIds: string[];
  handleToggleDocument: (documentId: string) => void;
}

export default function SourcePanel({
  isUploading,
  handleUpload,
  documents,
  isLoadingDocuments,
  selectedDocumentIds,
  handleToggleDocument,
}: SourcePanelProps) {
  return (
    <aside className="rounded-[1.75rem] border border-white/60 bg-white/80 p-4 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="border-b border-border/70 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Source panel
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Upload a new file or select one or more indexed documents to define
          the context for the active chat.
        </p>
      </div>

      <DocumentUpload 
      isUploading={isUploading} 
      handleUpload={handleUpload} />

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-950">
            Uploaded documents
          </p>
          <p className="text-sm text-muted-foreground">
            {documents.length} files available for chat
          </p>
        </div>
        <div className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          Multi-select
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoadingDocuments ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/60 p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading uploaded documents...
          </div>
        ) : null}

        {!isLoadingDocuments && documents.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-white/60 p-4 text-sm leading-6 text-muted-foreground">
            No uploaded documents yet. Use the uploader above to create your
            first indexed source.
          </div>
        ) : null}

        {documents.map((document) => {
          const selected = selectedDocumentIds.includes(document.id);

          return (
            <button
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition-all",
                selected
                  ? "border-primary/40 bg-primary/10"
                  : "border-border/70 bg-white/60 hover:border-primary/20 hover:bg-white",
              )}
              key={document.id}
              onClick={() => handleToggleDocument(document.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-secondary p-2 text-slate-900">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {document.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {document.size} | {document.uploadedAt}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    document.status === "Indexed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700",
                  )}
                >
                  {document.status}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
