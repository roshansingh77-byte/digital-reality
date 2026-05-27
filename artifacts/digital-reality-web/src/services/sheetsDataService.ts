import { getAccessToken } from "./googleAuth";
import { createFolder, uploadFile, type DriveFile } from "./googleDrive";

const API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || "";
const DRIVE_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || "";

// ── Sheet Tab Definitions ────────────────────────────────────────────────────

export const TABS = {
  PROJECTS: "Projects",
  ACTIVITIES: "Activities",
  FIELDWORK: "FieldWork",
  PROCESSING: "Processing",
  MODELLING: "Modelling",
  DOCUMENTATION: "Documentation",
  INVOICES: "Invoices",
  ADVANCES: "Advances",
  EXPENSES: "Expenses",
  EQUIPMENT: "Equipment",
  DOCUMENTS: "Documents",
  PIPELINES: "Pipelines",
  MODELLING_DAILY: "ModellingDaily",
  USERS: "Users",
  EQUIPMENT_LOG: "EquipmentLog",
} as const;

type TabName = (typeof TABS)[keyof typeof TABS];

export const TAB_HEADERS: Record<TabName, string[]> = {
  Projects: [
    "id", "name", "location", "state", "lat", "lng", "status", "progress",
    "client", "projectId", "poValue", "startDate", "endDate", "projectManager",
    "clientGroupCode", "clientCode", "client3Code", "cloveProjectCode",
    "clientProjectCode", "bidQuote", "enquiryDate", "estimatedDate",
    "orderedDate", "inputReceivableDate", "proposedDate", "deliveredDate",
    "quotedHours", "orderHours", "receivedHours", "areaSqKm", "resolution",
  ],
  Activities: [
    "id", "projectId", "activityType", "date", "location", "lat", "lng",
    "fieldWorkId", "processingId", "modellingId", "documentationId",
  ],
  FieldWork: [
    "id", "date", "time", "location", "lat", "lng", "areaSqKm", "linearKm",
    "equipmentUsed", "remarks", "completed",
  ],
  Processing: [
    "id", "softwareUsed", "inputFiles", "outputFiles", "processingStatus",
    "remarks", "completed",
  ],
  Modelling: [
    "id", "modelType", "softwareUsed", "modelFile", "remarks", "completed",
  ],
  Documentation: [
    "id", "reportUpload", "pdfUpload", "documentVersion", "remarks", "completed",
  ],
  Invoices: [
    "id", "projectId", "number", "description", "amount", "date", "status",
  ],
  Advances: [
    "id", "projectId", "personName", "amount", "date", "purpose", "settled",
    "settledDate", "remarks",
  ],
  Expenses: [
    "id", "projectId", "expenseType", "date", "amount", "paidBy", "location",
    "remarks", "reviewStatus", "reviewedBy", "reviewedAt", "rejectionReason",
  ],
  Equipment: [
    "id", "name", "type", "status", "assignedTo", "serialNumber",
    "quantity", "location",
  ],
  Documents: [
    "id", "projectId", "name", "mimeType", "size", "data", "uploadedAt",
    "category", "expenseId", "driveFileId", "driveWebViewLink",
  ],
  Pipelines: [
    "id", "projectId", "pipelineType", "stage", "completed", "date", "time",
    "location", "areaSqKm", "linearKm",
  ],
  ModellingDaily: [
    "id", "projectId", "personName", "startDate", "endDate", "startTime",
    "endTime", "totalHours", "process", "status", "ipComp",
  ],
  Users: [
    "id", "name", "email", "role", "password", "isApproved", "googleId", "projectAssigned",
  ],
  EquipmentLog: [
    "id", "equipmentId", "equipmentName", "field", "oldValue", "newValue",
    "changedBy", "timestamp",
  ],
};

// ── API Helpers ──────────────────────────────────────────────────────────────

async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  const url = `${API_BASE}/${SHEET_ID}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API error: ${res.status} ${err}`);
  }
  return res.json();
}

// ── Sheet Initialization ────────────────────────────────────────────────────

export async function ensureSheetsExist(): Promise<void> {
  const data = await apiRequest("?fields=sheets.properties");
  const existingTabs: string[] = (data.sheets || []).map(
    (s: any) => s.properties.title
  );
  const allTabs = Object.values(TABS);
  const missing = allTabs.filter((t) => !existingTabs.includes(t));
  if (missing.length === 0) return;

  const requests = missing.map((tab) => ({
    addSheet: { properties: { title: tab } },
  }));
  await apiRequest(":batchUpdate", {
    method: "POST",
    body: JSON.stringify({ requests }),
  });

  for (const tab of missing) {
    const headers = TAB_HEADERS[tab as TabName];
    if (headers) {
      await apiRequest(`/values/${encodeURIComponent(tab + "!A1")}?valueInputOption=RAW`, {
        method: "PUT",
        body: JSON.stringify({ values: [headers], majorDimension: "ROWS" }),
      });
    }
  }
}

// ── Read ─────────────────────────────────────────────────────────────────────

export async function readSheetRows(tab: TabName): Promise<string[][]> {
  const data = await apiRequest(
    `/values/${encodeURIComponent(tab + "!A:ZZ")}`
  );
  return (data.values || []).slice(1); // skip header row
}

export async function readSheetWithHeaders(
  tab: TabName
): Promise<{ headers: string[]; rows: string[][] }> {
  const data = await apiRequest(
    `/values/${encodeURIComponent(tab + "!A:ZZ")}`
  );
  const values: string[][] = data.values || [];
  return {
    headers: values[0] || TAB_HEADERS[tab],
    rows: values.slice(1),
  };
}

// ── Write Rows ───────────────────────────────────────────────────────────────

export async function appendRow(tab: TabName, values: string[]): Promise<void> {
  const range = encodeURIComponent(tab + "!A:A");
  await apiRequest(`/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values: [values], majorDimension: "ROWS" }),
  });
}

export async function updateRow(
  tab: TabName,
  rowIndex: number, // 1-indexed, includes header
  values: string[]
): Promise<void> {
  const range = encodeURIComponent(`${tab}!A${rowIndex}`);
  await apiRequest(`/values/${range}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [values], majorDimension: "ROWS" }),
  });
}

export async function deleteRow(
  tab: TabName,
  rowIndex: number // 1-indexed, includes header
): Promise<void> {
  const range = encodeURIComponent(`${tab}!A${rowIndex}:ZZ${rowIndex}`);
  await apiRequest(`/values/${range}:clear`, { method: "POST" });
}

export async function findRowIndex(
  tab: TabName,
  id: string
): Promise<number | null> {
  const data = await apiRequest(
    `/values/${encodeURIComponent(tab + "!A:A")}`
  );
  const ids: string[] = (data.values || []).map((r: string[]) => r[0]);
  const idx = ids.indexOf(id);
  if (idx === -1) return null;
  return idx + 1; // 1-indexed
}

// ── Full Dataset Load ────────────────────────────────────────────────────────

export async function loadAllData(): Promise<Record<string, string[][]>> {
  const result: Record<string, string[][]> = {};
  for (const tab of Object.values(TABS)) {
    try {
      result[tab] = await readSheetRows(tab as TabName);
    } catch {
      result[tab] = [];
    }
  }
  return result;
}

// ── Project-based Drive Folder Helpers ───────────────────────────────────────

export async function ensureProjectDriveFolder(
  projectName: string
): Promise<string> {
  const sanitized = projectName.replace(/[^\w\s-]/g, "").trim();
  const token = await getAccessToken();

  // Check if folder already exists
  const q = `name='${sanitized}' and '${DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const check = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const existing = await check.json();
  if (existing.files?.length > 0) return existing.files[0].id;

  // Create folder
  return createFolder(sanitized, DRIVE_FOLDER_ID).then((f) => f.id);
}

export async function ensureCategorySubfolder(
  parentFolderId: string,
  category: string
): Promise<string> {
  const token = await getAccessToken();
  const q = `name='${category}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const check = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const existing = await check.json();
  if (existing.files?.length > 0) return existing.files[0].id;

  return createFolder(category, parentFolderId).then((f) => f.id);
}

export async function uploadToProjectFolder(
  file: File,
  projectName: string,
  category: "document" | "invoice" | "expense"
): Promise<DriveFile> {
  const projectFolderId = await ensureProjectDriveFolder(projectName);
  const categoryFolderId = await ensureCategorySubfolder(projectFolderId, category === "document" ? "Documents" : category === "invoice" ? "Invoices" : "Expenses");
  return uploadFile(file, categoryFolderId);
}

// ── Serialization Helpers ────────────────────────────────────────────────────

export function serializeRow(headers: string[], data: Record<string, any>): string[] {
  return headers.map((h) => {
    const val = data[h];
    if (val === null || val === undefined) return "";
    if (Array.isArray(val)) return JSON.stringify(val);
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  });
}

export function deserializeRow<T>(headers: string[], row: string[]): T {
  const obj: Record<string, any> = {};
  headers.forEach((h, i) => {
    const val = row[i];
    if (val === "" || val === undefined) {
      obj[h] = undefined;
      return;
    }
    try {
      obj[h] = JSON.parse(val);
    } catch {
      obj[h] = val;
    }
  });
  return obj as T;
}
