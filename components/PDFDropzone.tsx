"use client";
import React, { useCallback, useState } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useSchematicEntitlement } from "@schematichq/schematic-react";

function PDFDropzone() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const canUpload = true;

  const handleUpload = useCallback((files: FileList) => {
    // Implement your file upload logic here
    console.log("Uploading file:", files);
  }, []);

  //schematic things
  const {
    value: isFeatureEnabled,
    featureUsageExceeded,
    featureAllocation,
    featureUsage,
  } = useSchematicEntitlement("scans");

  const router = useRouter();
  const { user } = useUser();

  console.log(user);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (!user) {
      alert("Please sign in to upload files.");
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, []);

  return (
    <DndContext sensors={sensors}>
      <div>
        <div
          onDragOver={canUpload ? handleDragOver : undefined}
          onDragLeave={canUpload ? handleDragLeave : undefined}
          onDrop={canUpload ? handleDrop : undefined}
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } ${!canUpload ? "opacity-50 pointer-events-none" : ""}`}
        >
          upload
        </div>
      </div>
    </DndContext>
  );
}

export default PDFDropzone;
