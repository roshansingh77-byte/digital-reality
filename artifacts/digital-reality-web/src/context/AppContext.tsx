import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { isSignedIn } from "@/services/googleAuth";
import {
  ensureSheetsExist, readSheetRows, appendRow, findRowIndex, updateRow, deleteRow,
  TABS, TAB_HEADERS, serializeRow, deserializeRow, uploadToProjectFolder,
} from "@/services/sheetsDataService";

export type ProjectStatus = "Active" | "Completed" | "On Hold" | "Planning" | "Quotation Sent";
export type EquipmentStatus = "In Use" | "Available" | "Maintenance";
export type InvoiceStatus = "Paid" | "Partial" | "Pending" | "Not Raised";

export interface Project {
  id: string;
  name: string;
  location: string;
  state: string;
  lat: number;
  lng: number;
  status: ProjectStatus;
  progress: number;
  client: string;
  projectId: string;
  poValue: number;
  startDate: string;
  endDate: string;
  projectManager: string;
  clientGroupCode?: string;
  clientCode?: string;
  client3Code?: string;
  cloveProjectCode?: string;
  clientProjectCode?: string;
  bidQuote?: string;
  enquiryDate?: string;
  estimatedDate?: string;
  orderedDate?: string;
  inputReceivableDate?: string;
  proposedDate?: string;
  deliveredDate?: string;
  quotedHours?: number;
  orderHours?: number;
  receivedHours?: number;
  areaSqKm?: number;
  resolution?: string;
}

export interface FieldWorkSection {
  id: string;
  date: string;
  time: string;
  location: string;
  lat: number;
  lng: number;
  areaSqKm: number;
  linearKm: number;
  equipmentUsed: string[];
  remarks: string;
  completed: boolean;
}

export interface ProcessingSection {
  id: string;
  softwareUsed: string;
  inputFiles: string;
  outputFiles: string;
  processingStatus: string;
  remarks: string;
  completed: boolean;
}

export interface ModellingSection {
  id: string;
  modelType: string;
  softwareUsed: string;
  modelFile: string;
  remarks: string;
  completed: boolean;
}

export interface DocumentationSection {
  id: string;
  reportUpload: string;
  pdfUpload: string[];
  documentVersion: string;
  remarks: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  projectId: string;
  activityType: string;
  date: string;
  location: string;
  lat: number;
  lng: number;
  fieldWork: FieldWorkSection;
  processing: ProcessingSection;
  modelling: ModellingSection;
  documentation: DocumentationSection;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  assignedTo: string;
  serialNumber?: string;
  quantity?: number;
  location?: string;
  lastSeen?: string;
  notes?: string;
  imageUrl?: string;
}

export interface EquipmentLogEntry {
  id: string;
  equipmentId: string;
  equipmentName: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  number: string;
  description: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
}

export interface Advance {
  id: string;
  projectId: string;
  personName: string;
  amount: number;
  date: string;
  purpose: string;
  settled: boolean;
  settledDate?: string;
  remarks: string;
}

export interface Expense {
  id: string;
  projectId: string;
  expenseType: string;
  date: string;
  amount: number;
  paidBy: string;
  location: string;
  remarks: string;
  reviewStatus: "pending" | "submitted" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  mimeType: string;
  size: number;
  data: string;
  uploadedAt: string;
  category?: "document" | "invoice" | "expense";
  expenseId?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  isAdmin: boolean;
  googleId?: string;
  projectAssigned?: string;
}

export interface FieldWorkStage {
  completed: boolean;
  date?: string;
  time?: string;
  location?: string;
  areaSqKm?: number;
  linearKm?: number;
}

export type ProcessingStageName = "production" | "qc" | "qa" | "delivery";

export interface ModellingDailyEntry {
  id: string;
  projectId: string;
  personName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  process: ProcessingStageName;
  status: string;
  ipComp: string;
}

export interface StageProgress {
  production: FieldWorkStage;
  qc: FieldWorkStage;
  qa: FieldWorkStage;
  delivery: FieldWorkStage;
}

export type FieldWorkStageName = "recce" | "dgps" | "totalStation" | "scanning" | "instrumentation" | "uav" | "gpr";

export interface ProjectPipeline {
  processing: StageProgress;
  modelling: StageProgress;
  fieldWork: Record<FieldWorkStageName, FieldWorkStage>;
}

function calcActivityProgress(activity: Activity): number {
  const sections = [activity.fieldWork, activity.processing, activity.modelling, activity.documentation];
  const completed = sections.filter(s => s.completed).length;
  return Math.round((completed / 4) * 100);
}

function createEmptyFieldWork(id: string): FieldWorkSection {
  return { id, date: "", time: "", location: "", lat: 0, lng: 0, areaSqKm: 0, linearKm: 0, equipmentUsed: [], remarks: "", completed: false };
}

function createEmptyProcessing(id: string): ProcessingSection {
  return { id, softwareUsed: "", inputFiles: "", outputFiles: "", processingStatus: "Pending", remarks: "", completed: false };
}

function createEmptyModelling(id: string): ModellingSection {
  return { id, modelType: "", softwareUsed: "", modelFile: "", remarks: "", completed: false };
}

function createEmptyDocumentation(id: string): DocumentationSection {
  return { id, reportUpload: "", pdfUpload: [], documentVersion: "", remarks: "", completed: false };
}

function migrateOldActivity(a: OldActivityFormat): Activity {
  const fwId = `fw-${a.id}`;
  return {
    id: a.id,
    projectId: a.projectId,
    activityType: a.activityType,
    date: a.date,
    location: a.location,
    lat: a.lat,
    lng: a.lng,
    fieldWork: {
      id: fwId,
      date: a.date,
      time: "",
      location: a.location,
      lat: a.lat,
      lng: a.lng,
      areaSqKm: a.areaCovered,
      linearKm: 0,
      equipmentUsed: a.equipmentUsed,
      remarks: a.remarks,
      completed: true,
    },
    processing: createEmptyProcessing(`proc-${a.id}`),
    modelling: createEmptyModelling(`mod-${a.id}`),
    documentation: createEmptyDocumentation(`doc-${a.id}`),
  };
}

interface OldActivityFormat {
  id: string;
  projectId: string;
  activityType: string;
  date: string;
  location: string;
  lat: number;
  lng: number;
  equipmentUsed: string[];
  areaCovered: number;
  progress: number;
  remarks: string;
  photos?: string[];
}

interface AppState {
  user: User | null;
  projects: Project[];
  activities: Activity[];
  equipment: Equipment[];
  equipmentLogs: EquipmentLogEntry[];
  invoices: Invoice[];
  expenses: Expense[];
  advances: Advance[];
  documents: Document[];
  pipelines: Record<string, ProjectPipeline>;
  modellingDailyEntries: Record<string, ModellingDailyEntry[]>;
  users: User[];
}

interface AppContextType extends AppState {
  login: (email: string, password: string, userName?: string) => Promise<boolean>;
  logout: () => void;
  addProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  addActivity: (a: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  updateActivityWorkflow: (activityId: string, section: "fieldWork" | "processing" | "modelling" | "documentation", data: Partial<FieldWorkSection | ProcessingSection | ModellingSection | DocumentationSection>) => void;
  addExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  addInvoice: (i: Invoice) => void;
  addAdvance: (a: Advance) => void;
  updateAdvance: (id: string, updates: Partial<Advance>) => void;
  deleteAdvance: (id: string) => void;
  submitExpensesForReview: (projectId?: string) => void;
  approveExpense: (id: string) => void;
  rejectExpense: (id: string, reason: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addEquipment: (e: Equipment) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addEquipmentLog: (entry: EquipmentLogEntry) => void;
  addDocument: (d: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  togglePipelineStage: (projectId: string, pipeline: "processing" | "modelling", stage: ProcessingStageName, checked: boolean) => void;
  setPipelineStageDetails: (projectId: string, pipeline: "processing" | "modelling", stage: ProcessingStageName, details: Partial<FieldWorkStage>) => void;
  toggleFieldWorkStage: (projectId: string, stage: FieldWorkStageName, completed: boolean) => void;
  setFieldWorkStageDateTime: (projectId: string, stage: FieldWorkStageName, date: string, time: string) => void;
  setFieldWorkStageDetails: (projectId: string, stage: FieldWorkStageName, details: Partial<FieldWorkStage>) => void;
  addModellingDailyEntry: (entry: ModellingDailyEntry) => void;
  updateModellingDailyEntry: (id: string, updates: Partial<ModellingDailyEntry>) => void;
  deleteModellingDailyEntry: (projectId: string, id: string) => void;
  getActivityProgress: (activity: Activity) => number;
  addUser: (u: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}



const EMPTY_FIELD_WORK_STAGE: FieldWorkStage = { completed: false };
const EMPTY_STAGE: StageProgress = { production: { ...EMPTY_FIELD_WORK_STAGE }, qc: { ...EMPTY_FIELD_WORK_STAGE }, qa: { ...EMPTY_FIELD_WORK_STAGE }, delivery: { ...EMPTY_FIELD_WORK_STAGE } };
const EMPTY_PIPELINE: ProjectPipeline = {
  processing: { ...EMPTY_STAGE },
  modelling: { ...EMPTY_STAGE },
  fieldWork: { recce: { ...EMPTY_FIELD_WORK_STAGE }, dgps: { ...EMPTY_FIELD_WORK_STAGE }, totalStation: { ...EMPTY_FIELD_WORK_STAGE }, scanning: { ...EMPTY_FIELD_WORK_STAGE }, instrumentation: { ...EMPTY_FIELD_WORK_STAGE }, uav: { ...EMPTY_FIELD_WORK_STAGE }, gpr: { ...EMPTY_FIELD_WORK_STAGE } },
};

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "dr_app_data_web_v3";

const DEFAULT_EQUIPMENT: Equipment[] = [
  { id: "e1", name: "Navvis VLX3", type: "Mobile LiDAR Scanner", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "G11-0070", quantity: 1, location: "Vizag" },
  { id: "e2", name: "Navvis M6", type: "Mobile Mapping System", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "TK2-M3-8-004", quantity: 1, location: "Vizag" },
  { id: "e3", name: "Apple Ipad", type: "Tablet", status: "In Use", assignedTo: "Parag Sir", serialNumber: "DMPPD52BG5VN", quantity: 1, location: "HYD" },
  { id: "e4", name: "Matterport Pro2", type: "3D Camera", status: "In Use", assignedTo: "Parag Sir", serialNumber: "M02HCD7M", quantity: 1, location: "HYD" },
  { id: "e5", name: "Matterport", type: "3D Camera", status: "In Use", assignedTo: "Parag Sir", serialNumber: "MC200", quantity: 1, location: "HYD" },
  { id: "e6", name: "Cannon Mark 200D", type: "DSLR Camera", status: "In Use", assignedTo: "Tarun", serialNumber: "DS126762", quantity: 1, location: "Vizag" },
  { id: "e7", name: "Big Tripod", type: "Tripod", status: "In Use", assignedTo: "Parag Sir", serialNumber: "NA", quantity: 1, location: "HYD" },
  { id: "e8", name: "Small Tripod (Camera)", type: "Tripod", status: "In Use", assignedTo: "Tarun", serialNumber: "VCT-R640", quantity: 1, location: "Vizag" },
  { id: "e9", name: "Garmin VIRB 360", type: "360 Camera", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "57J007546", quantity: 1, location: "Vizag" },
  { id: "e10", name: "DJI Handy Cam (1 charger + 2 batteries)", type: "Action Camera", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "06NDCJI20A00VF", quantity: 1, location: "Vizag" },
  { id: "e11", name: "Contour2+", type: "Action Camera", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "2050600653", quantity: 1, location: "Vizag" },
  { id: "e12", name: "Stereo Lab ZED 2", type: "Depth Camera", status: "In Use", assignedTo: "Vijay Kesiraju", serialNumber: "19200", quantity: 1, location: "HYD" },
  { id: "e13", name: "Sensefly eBee (Fixed Wing Drone)", type: "Drone", status: "Maintenance", assignedTo: "", serialNumber: "Damaged", quantity: 1, location: "Confirmed by Siddarth sir" },
  { id: "e14", name: "Quantum Trinity F90 (Fixed-Wing VTOL)", type: "Drone", status: "In Use", assignedTo: "", serialNumber: "Mumbai", quantity: 1, location: "Confirmed by Siddarth sir" },
  { id: "e15", name: "DJI Phantom Pro4 V2", type: "Drone", status: "Maintenance", assignedTo: "Roshan Singh", serialNumber: "Damaged", quantity: 1, location: "Vizag Office" },
  { id: "e16", name: "Laptop", type: "Computer", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "", quantity: 1, location: "Vizag" },
  { id: "e17", name: "Hard Disk", type: "Storage", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "4 TB", quantity: 1, location: "Vizag" },
  { id: "e18", name: "Mouse", type: "Accessory", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "", quantity: 1, location: "Vizag" },
  { id: "e19", name: "Shoes", type: "Safety Gear", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "", quantity: 7, location: "Vizag" },
  { id: "e20", name: "Safety Jacket", type: "Safety Gear", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "", quantity: 10, location: "Vizag" },
  { id: "e21", name: "Safety Helmet", type: "Safety Gear", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "", quantity: 10, location: "Vizag" },
  { id: "e22", name: "Structure Sensor", type: "3D Scanner", status: "Available", assignedTo: "", serialNumber: "36608", quantity: 1, location: "" },
  { id: "e23", name: "Project Tango Dev Kit Only Tab", type: "Tablet", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "NX-74751", quantity: 1, location: "Vizag" },
  { id: "e24", name: "Digital Lux Meter", type: "Measurement Tool", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "DC-9V", quantity: 1, location: "Vizag" },
  { id: "e25", name: "Disto D410", type: "Laser Distance Meter", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "1050920891", quantity: 1, location: "Vizag" },
  { id: "e26", name: "Walkie Talkie", type: "Communication", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "P3BCF1404/P3BCF0270", quantity: 2, location: "Vizag" },
  { id: "e27", name: "Insta 360 X5 & Selfie Stick", type: "360 Camera", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "IAHEA2505E455F", quantity: 1, location: "Vizag" },
  { id: "e28", name: "Gimbal Mozo", type: "Camera Gimbal", status: "In Use", assignedTo: "Roshan Singh", serialNumber: "2AMJRAIRCROSS-S", quantity: 1, location: "Vizag" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null, projects: [], activities: [], equipment: [], equipmentLogs: [],
    invoices: [], expenses: [], advances: [], documents: [],
    pipelines: {}, modellingDailyEntries: {}, users: [],
  });

  const [initialized, setInitialized] = useState(false);

  const persistState = useCallback((newState: Partial<AppState>) => {
    setState((prev) => {
      const merged = { ...prev, ...newState };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  useEffect(() => {
      const loadData = async () => {
      // Load from localStorage first (fast)
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.projects) {
            parsed.projects = parsed.projects.map((p: Record<string, unknown>) => ({
              ...p, lat: p.lat ?? 0, lng: p.lng ?? 0,
            }));
          }
          if (parsed.expenses) {
            parsed.expenses = parsed.expenses.map((e: Record<string, unknown>) => ({
              ...e,
              reviewStatus: e.reviewStatus || "pending",
            }));
          }
          if (parsed.activities) {
            parsed.activities = parsed.activities.map((a: Record<string, unknown>) => {
              if (a.fieldWork) return a;
              return migrateOldActivity(a as unknown as OldActivityFormat);
            });
          }
          setState((prev) => ({ ...prev, ...parsed }));
        } catch {}
      } else {
        // Seed default equipment on fresh load
        setState((prev) => ({ ...prev, equipment: DEFAULT_EQUIPMENT }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ equipment: DEFAULT_EQUIPMENT }));
      }

      // Then try to load from Google Sheets (if signed in)
      if (isSignedIn()) {
        try {
          await ensureSheetsExist();
          {
            const raw = await readSheetRows(TABS.PROJECTS as any);
            if (raw.length > 0) {
              const headers = TAB_HEADERS[TABS.PROJECTS];
              const projects: Project[] = raw.map((r) => deserializeRow<Project>(headers, r));
              setState((prev) => ({ ...prev, projects }));
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"), projects }));
            }
          }
          {
            const raw = await readSheetRows(TABS.USERS as any);
            const headers = TAB_HEADERS[TABS.USERS];
            const users = raw
              .filter((r) => r[headers.indexOf("id")] && r[headers.indexOf("name")] && r[headers.indexOf("email")])
              .map((r) => {
                const email = r[headers.indexOf("email")] || "";
                const role = r[headers.indexOf("role")] || "";
                return {
                  id: r[headers.indexOf("id")] || "",
                  name: r[headers.indexOf("name")] || "",
                  email,
                  role,
                  isApproved: r[headers.indexOf("isApproved")] === "TRUE" || r[headers.indexOf("isApproved")] === "true",
                  isAdmin: role.toLowerCase() === "admin",
                  googleId: r[headers.indexOf("googleId")] || undefined,
                  projectAssigned: r[headers.indexOf("projectAssigned")] || undefined,
                } as User;
              });
            setState((prev) => ({ ...prev, users }));
            localStorage.setItem("dr_users_cache", JSON.stringify(users));
          }
        } catch (err) {
          console.warn("Failed to load data from sheets:", err);
        }
      }

      setInitialized(true);
    };
    loadData();
  }, []);

  const save = (newState: Partial<AppState>) => {
    setState((prev) => {
      const merged = { ...prev, ...newState };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  // For each data type, sync to sheets in background
  const syncToSheet = useCallback(async (tab: string, rows: Record<string, any>[]) => {
    if (!isSignedIn()) return;
    try {
      await ensureSheetsExist();
      const token = await (await import("@/services/googleAuth")).getAccessToken();
      const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;

      // Equipment tab: merge with existing rows to preserve extra data
      if (tab === TABS.EQUIPMENT) {
        const readRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent("Equipment!A:H")}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const existingData = await readRes.json();
        const existingRows: string[][] = existingData.values || [];
        const existingMap = new Map<string, string[]>();
        for (let i = 1; i < existingRows.length; i++) {
          const row = existingRows[i];
          if (row[0]) existingMap.set(row[0], row);
        }

        const headers = TAB_HEADERS[TABS.EQUIPMENT];
        const newRows: string[][] = [headers];
        for (const item of rows) {
          const existing = existingMap.get(item.id) || new Array(headers.length).fill("");
          newRows.push([
            item.id,
            item.name,
            item.type,
            item.status,
            item.assignedTo || existing[4] || "",
            item.serialNumber || existing[5] || "",
            String(item.quantity ?? existing[6] ?? 1),
            item.location || existing[7] || "",
          ]);
        }
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent("Equipment!A1")}?valueInputOption=RAW`,
          { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values: newRows, majorDimension: "ROWS" }) }
        );
        return;
      }

      const headers = TAB_HEADERS[tab as keyof typeof TAB_HEADERS] || Object.keys(rows[0] || {});
      const values: string[][] = [headers, ...rows.map((r) => serializeRow(headers, r as any))];
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tab + "!A1")}?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values, majorDimension: "ROWS" }),
        }
      );
    } catch (err) {
      console.warn(`Failed to sync ${tab} to sheets:`, err);
    }
  }, []);

  const getCachedUsers = useCallback((): User[] => {
    const cached = localStorage.getItem("dr_users_cache");
    if (cached) {
      try { return JSON.parse(cached); } catch { }
    }
    return [];
  }, []);

  const login = async (email: string, password: string, userName?: string): Promise<boolean> => {
    if (!email) return false;

    let users: User[] = [];
    let rawRows: Record<string, any>[] = [];

    try {
      const raw = await readSheetRows(TABS.USERS as any);
      const headers = TAB_HEADERS[TABS.USERS];
      rawRows = raw.map((r) => {
        const obj: Record<string, any> = {};
        headers.forEach((h, i) => { obj[h] = r[i] ?? ""; });
        return obj;
      });
      users = rawRows
        .filter((u) => u.id && u.name && u.email)
        .map((u) => ({
          id: String(u.id),
          name: String(u.name || ""),
          email: String(u.email || ""),
          role: String(u.role || ""),
          isApproved: u.isApproved === "TRUE" || u.isApproved === true || u.isApproved === "true",
          isAdmin: String(u.role).toLowerCase() === "admin",
          googleId: u.googleId ? String(u.googleId) : undefined,
          projectAssigned: u.projectAssigned ? String(u.projectAssigned) : undefined,
        }));
      localStorage.setItem("dr_users_cache", JSON.stringify(users));
    } catch {
      users = getCachedUsers();
    }

    setState((prev) => ({ ...prev, users }));

    let matched: User | undefined;
    if (userName && password === "") {
      matched = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.isApproved
      );
    } else {
      const matchedRow = rawRows.find((r) => {
        const rowEmail = (r.email || "").toLowerCase();
        const rowPass = r.password || "";
        return rowEmail === email.toLowerCase() && rowPass === password;
      });
      if (matchedRow) {
        matched = users.find((u) => u.id === matchedRow.id && u.isApproved);
      }
    }

    if (matched) {
      const user: User = { ...matched };
      save({ user });
      return true;
    }

    return false;
  };

  const logout = () => save({ user: null });

  const addProject = (p: Project) => {
    save({ projects: [...state.projects, p] });
    syncToSheet(TABS.PROJECTS, [...state.projects, p]);
  };

  const deleteProject = (id: string) => {
    const updated = state.projects.filter((p) => p.id !== id);
    save({ projects: updated });
    syncToSheet(TABS.PROJECTS, updated);
  };

  const addActivity = (a: Activity) => save({ activities: [...state.activities, a] });

  const updateActivity = (id: string, updates: Partial<Activity>) =>
    save({ activities: state.activities.map((a) => (a.id === id ? { ...a, ...updates } : a)) });

  const updateActivityWorkflow = (
    activityId: string,
    section: "fieldWork" | "processing" | "modelling" | "documentation",
    data: Partial<FieldWorkSection | ProcessingSection | ModellingSection | DocumentationSection>
  ) => {
    save({
      activities: state.activities.map((a) => {
        if (a.id !== activityId) return a;
        const updated = {
          ...a,
          [section]: { ...a[section], ...data },
        };
        return updated;
      }),
    });
  };

  const addExpense = (e: Expense) => {
    save({ expenses: [...state.expenses, e] });
    syncToSheet(TABS.EXPENSES, [...state.expenses, e]);
  };
  const deleteExpense = (id: string) => {
    const updated = state.expenses.filter((e) => e.id !== id);
    save({ expenses: updated });
    syncToSheet(TABS.EXPENSES, updated);
  };
  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const updated = state.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
    save({ expenses: updated });
    syncToSheet(TABS.EXPENSES, updated);
  };
  const submitExpensesForReview = (projectId?: string) => {
    const updated = state.expenses.map((e) =>
      (!projectId || e.projectId === projectId) && (e.reviewStatus === "pending" || e.reviewStatus === "rejected")
        ? { ...e, reviewStatus: "submitted" as const, rejectionReason: undefined }
        : e
    );
    save({ expenses: updated });
    syncToSheet(TABS.EXPENSES, updated);
  };
  const approveExpense = (id: string) => {
    const updated = state.expenses.map((e) =>
      e.id === id
        ? { ...e, reviewStatus: "approved" as const, reviewedBy: state.user?.name, reviewedAt: new Date().toISOString() }
        : e
    );
    save({ expenses: updated });
    syncToSheet(TABS.EXPENSES, updated);
  };
  const rejectExpense = (id: string, reason: string) => {
    const updated = state.expenses.map((e) =>
      e.id === id
        ? { ...e, reviewStatus: "rejected" as const, rejectionReason: reason, reviewedBy: state.user?.name, reviewedAt: new Date().toISOString() }
        : e
    );
    save({ expenses: updated });
    syncToSheet(TABS.EXPENSES, updated);
  };
  const addInvoice = (i: Invoice) => {
    save({ invoices: [...state.invoices, i] });
    syncToSheet(TABS.INVOICES, [...state.invoices, i]);
  };
  const addAdvance = (a: Advance) => {
    save({ advances: [...state.advances, a] });
    syncToSheet(TABS.ADVANCES, [...state.advances, a]);
  };
  const updateAdvance = (id: string, updates: Partial<Advance>) => {
    const updated = state.advances.map((a) => (a.id === id ? { ...a, ...updates } : a));
    save({ advances: updated });
    syncToSheet(TABS.ADVANCES, updated);
  };
  const deleteAdvance = (id: string) => {
    const updated = state.advances.filter((a) => a.id !== id);
    save({ advances: updated });
    syncToSheet(TABS.ADVANCES, updated);
  };
  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    save({ projects: updated });
    syncToSheet(TABS.PROJECTS, updated);
  };

  const addEquipment = (e: Equipment) => {
    save({ equipment: [...state.equipment, e] });
    syncToSheet(TABS.EQUIPMENT, [...state.equipment, e]);
  };
  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    const old = state.equipment.find(e => e.id === id);
    const updated = state.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e));
    save({ equipment: updated });

    // Create log entries for tracked field changes
    if (old) {
      const logEntries: EquipmentLogEntry[] = [];
      const changedBy = state.user?.name || "System";
      const ts = new Date().toISOString();
      const tracked = ["assignedTo", "status", "location"] as const;
      for (const field of tracked) {
        const oldVal = String((old as any)[field] ?? "");
        const newVal = String((updates as any)[field] ?? (old as any)[field] ?? "");
        if (oldVal !== newVal) {
          logEntries.push({
            id: crypto.randomUUID(),
            equipmentId: id,
            equipmentName: old.name,
            field,
            oldValue: oldVal,
            newValue: newVal,
            changedBy,
            timestamp: ts,
          });
        }
      }
      if (logEntries.length > 0) {
        const merged = [...logEntries, ...state.equipmentLogs];
        save({ equipmentLogs: merged });
        syncToSheet(TABS.EQUIPMENT_LOG, merged);
      }
    }

    syncToSheet(TABS.EQUIPMENT, updated);
  };
  const deleteEquipment = (id: string) => {
    const updated = state.equipment.filter((e) => e.id !== id);
    save({ equipment: updated });
    syncToSheet(TABS.EQUIPMENT, updated);
  };

  const addEquipmentLog = (entry: EquipmentLogEntry) => {
    const merged = [entry, ...state.equipmentLogs];
    save({ equipmentLogs: merged });
    syncToSheet(TABS.EQUIPMENT_LOG, merged);
  };

  const addDocument = (d: Document) => save({ documents: [...state.documents, d] });
  const updateDocument = (id: string, updates: Partial<Document>) => save({ documents: state.documents.map((d) => d.id === id ? { ...d, ...updates } : d) });
  const deleteDocument = (id: string) => save({ documents: state.documents.filter((d) => d.id !== id) });

  const togglePipelineStage = (
    projectId: string,
    pipeline: "processing" | "modelling",
    stage: ProcessingStageName,
    checked: boolean
  ) => {
    const existing = state.pipelines[projectId] ?? EMPTY_PIPELINE;
    const now = new Date();
    const today = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const nowTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    const current = existing[pipeline][stage] ?? {};
    const updated: ProjectPipeline = {
      ...existing,
      [pipeline]: {
        ...existing[pipeline],
        [stage]: checked
          ? { completed: true, date: today, time: nowTime, location: current.location, areaSqKm: current.areaSqKm, linearKm: current.linearKm }
          : { completed: false },
      },
    };
    save({ pipelines: { ...state.pipelines, [projectId]: updated } });
  };

  const setPipelineStageDetails = (
    projectId: string,
    pipeline: "processing" | "modelling",
    stage: ProcessingStageName,
    details: Partial<FieldWorkStage>
  ) => {
    const existing = state.pipelines[projectId] ?? EMPTY_PIPELINE;
    const current = existing[pipeline][stage] ?? {};
    const updated: ProjectPipeline = {
      ...existing,
      [pipeline]: {
        ...existing[pipeline],
        [stage]: { ...current, ...details },
      },
    };
    save({ pipelines: { ...state.pipelines, [projectId]: updated } });
  };

  const toggleFieldWorkStage = (projectId: string, stage: FieldWorkStageName, completed: boolean) => {
    const existing = state.pipelines[projectId] ?? EMPTY_PIPELINE;
    const now = new Date();
    const today = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const nowTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    const current = existing.fieldWork[stage] ?? {};
    const updated: ProjectPipeline = {
      ...existing,
      fieldWork: {
        ...existing.fieldWork,
        [stage]: completed
          ? { completed, date: today, time: nowTime, location: current.location, areaSqKm: current.areaSqKm, linearKm: current.linearKm }
          : { completed: false },
      },
    };
    save({ pipelines: { ...state.pipelines, [projectId]: updated } });
  };

  const setFieldWorkStageDateTime = (projectId: string, stage: FieldWorkStageName, date: string, time: string) => {
    const existing = state.pipelines[projectId] ?? EMPTY_PIPELINE;
    const current = existing.fieldWork[stage] ?? {};
    const updated: ProjectPipeline = {
      ...existing,
      fieldWork: {
        ...existing.fieldWork,
        [stage]: { ...current, date, time },
      },
    };
    save({ pipelines: { ...state.pipelines, [projectId]: updated } });
  };

  const setFieldWorkStageDetails = (projectId: string, stage: FieldWorkStageName, details: Partial<FieldWorkStage>) => {
    const existing = state.pipelines[projectId] ?? EMPTY_PIPELINE;
    const current = existing.fieldWork[stage] ?? {};
    const updated: ProjectPipeline = {
      ...existing,
      fieldWork: {
        ...existing.fieldWork,
        [stage]: { ...current, ...details },
      },
    };
    save({ pipelines: { ...state.pipelines, [projectId]: updated } });
  };

  const addModellingDailyEntry = (entry: ModellingDailyEntry) => {
    const existing = state.modellingDailyEntries[entry.projectId] ?? [];
    save({ modellingDailyEntries: { ...state.modellingDailyEntries, [entry.projectId]: [...existing, entry] } });
  };

  const updateModellingDailyEntry = (id: string, updates: Partial<ModellingDailyEntry>) => {
    const updated = { ...state.modellingDailyEntries };
    for (const key of Object.keys(updated)) {
      updated[key] = updated[key].map((e) => (e.id === id ? { ...e, ...updates } : e));
    }
    save({ modellingDailyEntries: updated });
  };

  const deleteModellingDailyEntry = (projectId: string, id: string) => {
    const existing = state.modellingDailyEntries[projectId] ?? [];
    save({ modellingDailyEntries: { ...state.modellingDailyEntries, [projectId]: existing.filter((e) => e.id !== id) } });
  };

  const getActivityProgress = (activity: Activity): number => calcActivityProgress(activity);

  const addUser = (u: User) => {
    const updated = [...state.users, u];
    save({ users: updated });
    syncToSheet(TABS.USERS, updated);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updated = state.users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    save({ users: updated });
    syncToSheet(TABS.USERS, updated);
  };

  const deleteUser = (id: string) => {
    const updated = state.users.filter((u) => u.id !== id);
    save({ users: updated });
    syncToSheet(TABS.USERS, updated);
  };

  if (!initialized) return null;

  return (
    <AppContext.Provider value={{
      ...state, login, logout, addProject, deleteProject, addActivity, updateActivity, updateActivityWorkflow,
      addExpense, deleteExpense, updateExpense, addInvoice, addAdvance, updateAdvance, deleteAdvance, submitExpensesForReview, approveExpense, rejectExpense, updateProject,
      addEquipment, updateEquipment, deleteEquipment, addEquipmentLog, addDocument, updateDocument, deleteDocument,
      setPipelineStageDetails, togglePipelineStage, toggleFieldWorkStage, setFieldWorkStageDateTime,
      setFieldWorkStageDetails, addModellingDailyEntry, updateModellingDailyEntry, deleteModellingDailyEntry,
      getActivityProgress, addUser, updateUser, deleteUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
