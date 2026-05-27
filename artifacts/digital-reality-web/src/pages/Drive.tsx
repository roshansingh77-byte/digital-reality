import { useState, useEffect, useCallback } from "react";
import { signIn, signOut, isSignedIn } from "@/services/googleAuth";
import {
  listFiles,
  searchFiles,
  uploadFile,
  createFolder,
  deleteFile,
  getDownloadUrl,
  type DriveFile,
  type DriveFileList,
  getFileIcon,
  formatFileSize,
  formatDate,
} from "@/services/googleDrive";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LogIn,
  LogOut,
  Upload,
  FolderPlus,
  Download,
  Trash2,
  ExternalLink,
  File,
  Folder,
  Image,
  FileText,
  Sheet,
  FileArchive,
  Search,
  ChevronRight,
  Home,
  RefreshCw,
  Loader2,
  HardDrive,
} from "lucide-react";

function FileIcon({ file, className }: { file: DriveFile; className?: string }) {
  const icon = getFileIcon(file.mimeType, file.fileExtension);
  const cls = `w-5 h-5 shrink-0 ${className || ""}`;
  if (file.mimeType === "application/vnd.google-apps.folder") return <Folder className={`${cls} text-amber-500`} />;
  if (icon === "image") return <Image className={`${cls} text-green-500`} />;
  if (icon === "pdf") return <FileText className={`${cls} text-red-500`} />;
  if (icon === "sheet") return <Sheet className={`${cls} text-emerald-600`} />;
  if (icon === "doc") return <FileText className={`${cls} text-blue-600`} />;
  return <File className={`${cls} text-muted-foreground`} />;
}

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function DrivePage() {
  const [authenticated, setAuthenticated] = useState(isSignedIn());
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderPath, setFolderPath] = useState<{ id?: string; name: string }[]>([
    { id: undefined, name: "Shared Drive" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const loadFiles = useCallback(async (folderId?: string, query?: string) => {
    setLoading(true);
    try {
      let result: DriveFileList;
      if (query) {
        result = await searchFiles(query);
      } else {
        result = await listFiles(folderId);
      }
      setFiles(result.files || []);
    } catch (err: any) {
      console.error("Failed to load files:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadFiles(currentFolderId, searchQuery || undefined);
    }
  }, [authenticated, currentFolderId, loadFiles]);

  const handleSignIn = async () => {
    try {
      await signIn();
      setAuthenticated(true);
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  };

  const handleSignOut = () => {
    signOut();
    setAuthenticated(false);
    setFiles([]);
    setCurrentFolderId(undefined);
    setFolderPath([{ id: undefined, name: "Shared Drive" }]);
  };

  const navigateToFolder = (folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchQuery("");
  };

  const navigateToPath = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    const last = newPath[newPath.length - 1];
    setFolderPath(newPath);
    setCurrentFolderId(last.id);
    setSearchQuery("");
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (authenticated) {
      loadFiles(undefined, value || undefined);
    }
  };

  const handleUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      setUploading(true);
      try {
        for (const file of files) {
          await uploadFile(file, currentFolderId);
        }
        loadFiles(currentFolderId, searchQuery || undefined);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      await createFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName("");
      loadFiles(currentFolderId, searchQuery || undefined);
    } catch (err) {
      console.error("Create folder failed:", err);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDelete = async (file: DriveFile) => {
    if (!confirm(`Delete "${file.name}"?`)) return;
    try {
      await deleteFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDownload = async (file: DriveFile) => {
    try {
      const url = await getDownloadUrl(file.id);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (!authenticated) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <HardDrive className="w-6 h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Google Drive</h1>
        </div>
        <Card className="max-w-md mx-auto mt-16">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <HardDrive className="w-12 h-12 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold mb-1">Connect Google Drive</h2>
              <p className="text-sm text-muted-foreground">Sign in to access your shared Drive and manage files.</p>
            </div>
            <Button onClick={handleSignIn} className="gap-2">
              <LogIn className="w-4 h-4" /> Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-primary shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Google Drive</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 self-start sm:self-auto">
          <LogOut className="w-4 h-4" /> Disconnect
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap min-w-0">
          {folderPath.map((p, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
              {i === 0 ? (
                <button onClick={() => navigateToPath(0)} className="hover:text-foreground transition-colors flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" /> {p.name}
                </button>
              ) : (
                <button
                  onClick={() => navigateToPath(i)}
                  className={`truncate hover:text-foreground transition-colors max-w-[120px] sm:max-w-[200px] ${i === folderPath.length - 1 ? "text-foreground font-medium" : ""}`}
                >
                  {p.name}
                </button>
              )}
            </span>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-8 h-9 w-full sm:w-48 text-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => loadFiles(currentFolderId)} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" onClick={handleUpload} disabled={uploading} className="gap-1.5">
          <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload"}
        </Button>
        <div className="flex items-center gap-2">
          <Input
            placeholder="New folder name..."
            className="h-9 text-sm w-44"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
          />
          <Button variant="outline" size="sm" onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName.trim()} className="gap-1.5">
            <FolderPlus className="w-4 h-4" /> New Folder
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <File className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">This folder is empty</p>
            </div>
          ) : (
            <div className="divide-y">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  {file.mimeType === "application/vnd.google-apps.folder" ? (
                    <button onClick={() => navigateToFolder(file)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <FileIcon file={file} />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </button>
                  ) : (
                    <a
                      href={file.webViewLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <FileIcon file={file} />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium truncate block">{file.name}</span>
                      </div>
                    </a>
                  )}
                  <span className="text-xs text-muted-foreground hidden sm:block w-20 text-right tabular-nums">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-xs text-muted-foreground hidden md:block w-24 text-right tabular-nums">
                    {formatDateShort(file.modifiedTime)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.mimeType !== "application/vnd.google-apps.folder" && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(file)} title="Download">
                          <Download className="w-4 h-4" />
                        </Button>
                        {file.webViewLink && (
                          <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Open in Drive">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(file)} title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
