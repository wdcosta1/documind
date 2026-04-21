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
    <aside className="w-96 h-[817px] px-6 pt-6 bg-white border-l border-gray-200 inline-flex flex-col justify-start items-start gap-6 overflow-hidden">
      <div className="self-stretch h-7 relative">
        <h2 className="text-xl font-medium font-['Segoe_UI_Emoji'] text-gray-900 leading-7">
          Documents
        </h2>
      </div>

      <DocumentUpload isUploading={isUploading} handleUpload={handleUpload} />

      <div className="self-stretch h-7 relative">
        <h3 className="text-base font-medium text-gray-900 text-sm font-medium font-['Segoe_UI_Emoji'] text-black">
          Files Uploaded ({documents.length})
        </h3>
      </div>

      <div className="w-80 flex-1 relative bg-white overflow-y-auto">
        {isLoadingDocuments ? (
          <div className="flex items-center gap-3 rounded-[10px] bg-gray-50 p-4 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading uploaded documents...
          </div>
        ) : null}

        {!isLoadingDocuments && documents.length === 0 ? (
          <div className="rounded-[10px] bg-gray-50 p-4 text-sm text-gray-500">
            No uploaded documents yet. Use the uploader above to create your
            first indexed source.
          </div>
        ) : null}

        <div className="space-y-4 ">
          {documents.map((document) => {
            const selected = selectedDocumentIds.includes(document.id);

            return (
              <button
                className={cn(
                  "w-full h-16 rounded-[10px] shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] inline-flex flex-col justify-start items-start p-3 transition-all",
                  selected
                    ? "bg-[#2B7FFF] border border-blue-200 text-white hover:bg-[#2B7FFF]"
                    : "bg-white hover:bg-gray-50",
                )}
                key={document.id}
                onClick={() => handleToggleDocument(document.id)}
                type="button"
              >
                <div className="self-stretch relative">
                  <div className="w-52 absolute flex items-start gap-3">
                    <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                      <FileText className={cn("h-4 w-4 text-white", selected
                    ? "text-white"
                    : "text-gray-600"
                  )} />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1 min-w-0">
                      <div className="self-stretch h-5 relative overflow-hidden">
                        <div className={cn("justify-start text-gray-900 text-sm font-medium font-['Segoe_UI_Emoji'] leading-5 truncate", selected
                          ? "text-white"
                          : "text-gray-900"
                        )}>
                          {document.name}
                        </div>
                      </div>
                      <div className="self-stretch h-4 inline-flex justify-start items-start">
                        <div className={cn("flex-1 text-gray-400 text-xs font-medium font-['Segoe_UI_Emoji'] leading-4 truncate", selected
                          ? "text-white"
                          : "text-gray-400"
                        )}>
                          {document.uploadedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
