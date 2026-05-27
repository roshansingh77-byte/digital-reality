import { getAccessToken } from "./googleAuth";

const API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || "";

export interface SheetData {
  range: string;
  values: string[][];
}

async function apiRequest(path: string): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function getSheetNames(): Promise<string[]> {
  const data = await apiRequest(`/${SHEET_ID}?fields=sheets.properties`);
  return data.sheets?.map((s: any) => s.properties.title) || [];
}

export async function getSheetData(
  range?: string,
  sheetName?: string
): Promise<SheetData> {
  const tab = sheetName || "Sheet1";
  const r = range || "A1:Z1000";
  const data = await apiRequest(`/${SHEET_ID}/values/${encodeURIComponent(tab + "!" + r)}`);
  return { range: data.range, values: data.values || [] };
}

export async function getAllSheetData(sheetName?: string): Promise<SheetData> {
  return getSheetData("A1:ZZ5000", sheetName);
}

export function parseExpenseRows(values: string[][]): Record<string, string>[] {
  if (!values || values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map((row) => {
    const entry: Record<string, string> = {};
    headers.forEach((h, i) => {
      entry[h.trim()] = row[i] || "";
    });
    return entry;
  });
}
