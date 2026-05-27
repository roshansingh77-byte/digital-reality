import { DocumentType } from "@/context/AppContext";
import * as FileSystem from "expo-file-system";

// Generate UUID v4 without external dependency
export function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const DOCUMENT_TYPES: Record<DocumentType, { label: string; extensions: string[] }> = {
  PO: { label: "Purchase Order", extensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx"] },
  "Site Permit": { label: "Site Permit", extensions: [".pdf", ".doc", ".docx", ".jpg", ".png"] },
  Report: { label: "Report", extensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx"] },
  Drawing: { label: "Drawing", extensions: [".pdf", ".dwg", ".jpg", ".png"] },
  Photo: { label: "Photo/Image", extensions: [".jpg", ".png", ".jpeg", ".gif", ".bmp"] },
  Other: { label: "Other", extensions: [".*"] },
};

export function getMimeType(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

export function getDocumentType(filename: string): DocumentType {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
  if (imageExts.includes(ext)) return "Photo";
  return "Other";
}

export async function copyFileToDocumentsDir(sourceUri: string, filename: string): Promise<string> {
  const documentsDir = `${FileSystem.documentDirectory}documents/`;
  
  // Ensure documents directory exists
  try {
    await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
  } catch (e) {
    // Directory might already exist
  }

  const destUri = documentsDir + generateId() + "_" + filename;
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destUri,
  });

  return destUri;
}

export async function getFileInfo(uri: string): Promise<{ size: number; filename: string }> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    const filename = uri.split("/").pop() || "unknown";
    return {
      size: info.size || 0,
      filename,
    };
  } catch (error) {
    return { size: 0, filename: "unknown" };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function getFileIcon(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  const iconMap: Record<string, string> = {
    ".pdf": "file-pdf",
    ".doc": "file-text",
    ".docx": "file-text",
    ".xls": "file",
    ".xlsx": "file",
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".gif": "image",
    ".bmp": "image",
  };
  return iconMap[ext] || "file";
}
