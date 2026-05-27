import { getAccessToken } from "./googleAuth";

const API_BASE = "https://www.googleapis.com/drive/v3";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  parents?: string[];
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  fileExtension?: string;
  description?: string;
}

export interface DriveFileList {
  files: DriveFile[];
  nextPageToken?: string;
}

const SHARED_DRIVE_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || "";
const DRIVE_PARAMS = SHARED_DRIVE_ID
  ? "supportsAllDrives=true&includeItemsFromAllDrives=true&corpora=drive&driveId=" + SHARED_DRIVE_ID
  : "";

async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getAccessToken();
  const url = `${API_BASE}${path}${path.includes("?") ? "&" : "?"}${DRIVE_PARAMS}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive API error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function listFiles(
  folderId?: string,
  pageToken?: string,
  query?: string
): Promise<DriveFileList> {
  const rootId = SHARED_DRIVE_ID;
  const parent = folderId || rootId;
  const q = query
    ? `('${parent}' in parents) and (name contains '${query.replace(/'/g, "\\'")}') and trashed=false`
    : `'${parent}' in parents and trashed=false`;
  const params = `q=${encodeURIComponent(q)}&pageSize=100&fields=files(id,name,mimeType,size,modifiedTime,createdTime,parents,webViewLink,iconLink,thumbnailLink,fileExtension,description)&orderBy=folder,name&${pageToken ? `pageToken=${pageToken}` : ""}`;
  return apiRequest(`/files?${params}`);
}

export async function searchFiles(query: string): Promise<DriveFileList> {
  const q = `(name contains '${query.replace(/'/g, "\\'")}') and trashed=false`;
  const params = `q=${encodeURIComponent(q)}&pageSize=50&fields=files(id,name,mimeType,size,modifiedTime,parents,webViewLink,iconLink,fileExtension)`;
  return apiRequest(`/files?${params}`);
}

export async function getFile(fileId: string): Promise<DriveFile> {
  return apiRequest(`/files/${fileId}?fields=id,name,mimeType,size,modifiedTime,createdTime,parents,webViewLink,iconLink,thumbnailLink,fileExtension,description`);
}

export async function getDownloadUrl(fileId: string): Promise<string> {
  const token = await getAccessToken();
  return `${API_BASE}/files/${fileId}?alt=media&${DRIVE_PARAMS}&access_token=${token}`;
}

export async function uploadFile(
  file: File,
  parentFolderId?: string
): Promise<DriveFile> {
  const token = await getAccessToken();
  const rootId = SHARED_DRIVE_ID;
  const parentId = parentFolderId || rootId;

  const metadata = {
    name: file.name,
    parents: [parentId],
    mimeType: file.type || "application/octet-stream",
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", file);

  const url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function createFolder(
  name: string,
  parentFolderId?: string
): Promise<DriveFile> {
  const token = await getAccessToken();
  const rootId = SHARED_DRIVE_ID;
  const parentId = parentFolderId || rootId;

  const metadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId],
  };

  const url = `https://www.googleapis.com/drive/v3/files?supportsAllDrives=true`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create folder error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function deleteFile(fileId: string): Promise<void> {
  await apiRequest(`/files/${fileId}`, { method: "DELETE" });
}

export function getFileIcon(mimeType: string, fileExtension?: string): string {
  if (mimeType === "application/vnd.google-apps.folder") return "folder";
  if (mimeType === "application/vnd.google-apps.spreadsheet") return "sheet";
  if (mimeType === "application/vnd.google-apps.document") return "doc";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (fileExtension === "xlsx" || fileExtension === "xls") return "sheet";
  return "file";
}

export function formatFileSize(bytes?: string): string {
  if (!bytes) return "";
  const num = parseInt(bytes, 10);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
