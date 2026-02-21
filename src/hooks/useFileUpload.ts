"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export interface UploadedFile {
  storage_path: string;
  url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".txt",
]);

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export function useFileUpload() {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const newFiles = Array.from(fileList);
      const valid: File[] = [];

      for (const file of newFiles) {
        if (!ALLOWED_EXTENSIONS.has(getExtension(file.name))) {
          toast.error(`File type not supported: ${file.name}`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File too large (max 10MB): ${file.name}`);
          continue;
        }
        valid.push(file);
      }

      setPendingFiles((prev) => {
        const combined = [...prev, ...valid];
        if (combined.length > MAX_FILES) {
          toast.error(`Maximum ${MAX_FILES} files at a time`);
          return combined.slice(0, MAX_FILES);
        }
        return combined;
      });
    },
    []
  );

  const removeFile = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setPendingFiles([]);
  }, []);

  const uploadFiles = useCallback(
    async (conversationKey: string): Promise<UploadedFile[]> => {
      if (pendingFiles.length === 0) return [];

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("conversation_key", conversationKey);
        for (const file of pendingFiles) {
          formData.append("files", file);
        }

        const res = await fetch("/api/chat/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }

        const { files } = await res.json();
        return files as UploadedFile[];
      } finally {
        setUploading(false);
      }
    },
    [pendingFiles]
  );

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    pendingFiles,
    uploading,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    fileInputRef,
    triggerFileSelect,
  };
}
