"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Upload, FileText, Trash2, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

interface UploadedReceipt {
  id: string;
  name: string;
  size: number;
  preview: string;
  file: File;
}

function DashboardPage() {
  const [receipts, setReceipts] = useState<UploadedReceipt[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newReceipts: UploadedReceipt[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const reader = new FileReader();

        reader.onload = (e) => {
          const preview = e.target?.result as string;
          newReceipts.push({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            preview: preview,
            file: file,
          });

          if (newReceipts.length === files.length) {
            setReceipts((prev) => [...prev, ...newReceipts]);
            setIsUploading(false);
          }
        };

        reader.readAsDataURL(file);
      }
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setIsUploading(true);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsUploading(true);
      processFiles(e.target.files);
    },
    [processFiles],
  );

  const handleRemoveReceipt = useCallback((id: string) => {
    setReceipts((prev) => prev.filter((receipt) => receipt.id !== id));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              Please sign in to upload and manage your receipts. Track expenses
              and get insights into your spending.
            </p>
            <SignInButton mode="modal">
              <Button size="lg" className="font-semibold">
                Sign In to Continue
              </Button>
            </SignInButton>
          </motion.div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Receipt Dashboard</h1>
              <p className="text-muted-foreground">
                Upload and manage your receipts in one place
              </p>
            </div>

            {/* Upload Area */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Upload Receipts</CardTitle>
                <CardDescription>
                  Drag and drop your receipt images or PDFs, or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer hover:border-primary/50 ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleFileInput}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      {isDragging
                        ? "Drop files here"
                        : "Drop receipts here or click to upload"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: JPG, PNG, PDF (Max 10MB per file)
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Receipts */}
            {receipts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Receipts ({receipts.length})</CardTitle>
                    <CardDescription>
                      Review and manage your uploaded receipts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {receipts.map((receipt, index) => (
                        <motion.div
                          key={receipt.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <FileText className="w-8 h-8 text-primary shrink-0" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveReceipt(receipt.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <p
                              className="font-medium text-sm truncate"
                              title={receipt.name}
                            >
                              {receipt.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(receipt.size)}
                            </p>
                          </div>
                          {receipt.file.type.startsWith("image/") && (
                            <div className="mt-3 rounded overflow-hidden">
                              <img
                                src={receipt.preview}
                                alt={receipt.name}
                                className="w-full h-32 object-cover"
                              />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {receipts.length > 0 && (
                      <div className="mt-6 flex justify-end">
                        <Button size="lg" className="font-semibold">
                          Process {receipts.length} Receipt
                          {receipts.length > 1 ? "s" : ""}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Empty State */}
            {receipts.length === 0 && !isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center py-12"
              >
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No receipts uploaded yet. Start by uploading your first
                  receipt!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </SignedIn>
    </>
  );
}

export default DashboardPage;
