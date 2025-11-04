"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useSchematicEntitlement } from "@schematichq/schematic-react";
import { uploadPdf } from "@/actions/uploadPdf";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface PDFDropzoneProps {
  onUploadSuccess?: () => void;
}

function PDFDropzone({ onUploadSuccess }: PDFDropzoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  //schematic things
  const {
    value: isFeatureEnabled,
    featureUsageExceeded,
    featureAllocation,
    featureUsage,
  } = useSchematicEntitlement("scan");

  const router = useRouter();
  const { user } = useUser();

  const isUserSignedIn = !!user;

  // Allow upload if user is signed in and either:
  // 1. Feature allocation is defined and not exceeded
  // 2. Feature is explicitly enabled and not exceeded
  const canUpload =
    isUserSignedIn && featureAllocation !== undefined && !featureUsageExceeded;

  console.log("PDFDropzone Debug:", {
    isUserSignedIn,
    isFeatureEnabled,
    featureAllocation,
    featureUsage,
    featureUsageExceeded,
    canUpload,
  });

  const handleUpload = useCallback(
    async (files: FileList) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      // Validate file type
      if (file.type !== "application/pdf") {
        setUploadStatus({
          type: "error",
          message: "Please upload a PDF file only.",
        });
        return;
      }

      // Validate file size (e.g., max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setUploadStatus({
          type: "error",
          message: "File size must be less than 10MB.",
        });
        return;
      }

      setIsUploading(true);
      setUploadStatus({ type: null, message: "" });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadPdf(formData);

        if (result.sucess) {
          setUploadStatus({
            type: "success",
            message: `${file.name} uploaded successfully! Redirecting...`,
          });

          // Redirect to the receipt detail page
          if (result.data?.receiptId) {
            setTimeout(() => {
              router.push(`/recipts/${result.data.receiptId}`);
            }, 1000);
          }

          // Call the callback to refresh the receipts list
          if (onUploadSuccess) {
            onUploadSuccess();
          }
        } else {
          setUploadStatus({
            type: "error",
            message: result.message || "Upload failed. Please try again.",
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadStatus({
          type: "error",
          message: "An error occurred during upload. Please try again.",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess, router],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);

      if (!user) {
        setUploadStatus({
          type: "error",
          message: "Please sign in to upload files.",
        });
        return;
      }

      if (!canUpload) {
        setUploadStatus({
          type: "error",
          message: featureUsageExceeded
            ? "You've reached your scan limit. Please upgrade your plan."
            : "Upload feature is not available.",
        });
        return;
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [user, canUpload, featureUsageExceeded, handleUpload],
  );

  const handleClick = useCallback(() => {
    if (!user) {
      setUploadStatus({
        type: "error",
        message: "Please sign in to upload files.",
      });
      return;
    }

    if (!canUpload) {
      setUploadStatus({
        type: "error",
        message: featureUsageExceeded
          ? "You've reached your scan limit. Please upgrade your plan."
          : "Upload feature is not available.",
      });
      return;
    }

    fileInputRef.current?.click();
  }, [user, canUpload, featureUsageExceeded]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleUpload(e.target.files);
      }
    },
    [handleUpload],
  );

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading || !canUpload}
      />

      <div
        onDragOver={canUpload ? handleDragOver : undefined}
        onDragLeave={canUpload ? handleDragLeave : undefined}
        onDrop={canUpload ? handleDrop : undefined}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
          ${
            isDraggingOver
              ? "border-black bg-black/5 dark:border-white dark:bg-white/5 scale-[1.02]"
              : "border-black dark:border-white hover:border-black/70 dark:hover:border-white/70"
          }
          ${!canUpload ? "opacity-50 cursor-not-allowed" : ""}
          ${isUploading ? "pointer-events-none" : ""}
        `}
      >
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-black dark:text-white animate-spin" />
              <p className="text-lg font-semibold text-black dark:text-white">
                Uploading...
              </p>
              <p className="text-sm text-black dark:text-white">
                Please wait while we process your receipt
              </p>
            </>
          ) : (
            <>
              <div className="relative">
                <Upload className="w-12 h-12 text-black dark:text-white" />
                <FileText className="w-6 h-6 text-black dark:text-white absolute -bottom-1 -right-1" />
              </div>
              <div>
                <p className="text-lg font-semibold text-black dark:text-white">
                  {canUpload
                    ? "Drop your receipt here or click to browse"
                    : !user
                      ? "Please sign in to upload receipts"
                      : featureUsageExceeded
                        ? "Scan limit reached"
                        : "Upload not available"}
                </p>
                {canUpload && (
                  <p className="text-sm text-black dark:text-white mt-2">
                    Supports PDF files up to 10MB
                  </p>
                )}
              </div>
              {canUpload &&
                featureAllocation !== undefined &&
                featureUsage !== undefined && (
                  <div className="mt-2 px-4 py-2 bg-black/5 dark:bg-white/5 border border-black dark:border-white rounded-lg">
                    <p className="text-sm text-black dark:text-white">
                      Scans used:{" "}
                      <span className="font-semibold text-black dark:text-white">
                        {featureUsage} /{" "}
                        {featureAllocation === -1 ? "∞" : featureAllocation}
                      </span>
                    </p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {uploadStatus.type && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
            uploadStatus.type === "success"
              ? "bg-black/5 dark:bg-white/5 text-black dark:text-white border border-black dark:border-white"
              : "bg-black/5 dark:bg-white/5 text-black dark:text-white border border-black dark:border-white"
          }`}
        >
          {uploadStatus.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="text-sm font-medium">{uploadStatus.message}</p>
        </div>
      )}
    </div>
  );
}

export default PDFDropzone;
