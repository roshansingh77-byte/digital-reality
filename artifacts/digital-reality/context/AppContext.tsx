import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ProjectStatus = "Active" | "Completed" | "On Hold" | "Planning" | "Quotation Sent";
export type EquipmentStatus = "In Use" | "Available" | "Maintenance";
export type InvoiceStatus = "Paid" | "Partial" | "Pending" | "Not Raised";
export type DocumentType = "PO" | "Site Permit" | "Report" | "Drawing" | "Photo" | "Other";
export type DocumentStatus = "Uploaded" | "Processing" | "Archived";

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

export interface Project {
  id: string;
  name: string;
  location: string;
  state: string;
  status: ProjectStatus;
  progress: number;
  client: string;
  projectId: string;
  poValue: number;
  startDate: string;
  endDate: string;
  projectManager: string;
  lat: number;
  lng: number;
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

export interface Expense {
  id: string;
  projectId: string;
  expenseType: string;
  date: string;
  amount: number;
  paidBy: string;
  location: string;
  remarks: string;
  photo?: string;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

export interface User {
  name: string;
  role: string;
  email: string;
  isAdmin?: boolean;
}

interface AppState {
  user: User | null;
  projects: Project[];
  activities: Activity[];
  equipment: Equipment[];
  invoices: Invoice[];
  expenses: Expense[];
  advances: Advance[];
  documents: Document[];
  pipelines: Record<string, ProjectPipeline>;
  modellingDailyEntries: Record<string, ModellingDailyEntry[]>;
}

interface AppContextType extends AppState {
  login: (email: string, password: string, userName?: string) => Promise<boolean>;
  logout: () => void;
  addProject: (p: Project) => void;
  addActivity: (a: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  updateActivityWorkflow: (activityId: string, section: "fieldWork" | "processing" | "modelling" | "documentation", data: any) => void;
  addExpense: (e: Expense) => void;
  addInvoice: (i: Invoice) => void;
  addAdvance: (a: Advance) => void;
  updateAdvance: (id: string, updates: Partial<Advance>) => void;
  deleteAdvance: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addDocument: (d: Document) => void;
  deleteDocument: (id: string) => void;
  getProjectDocuments: (projectId: string) => Document[];
  togglePipelineStage: (projectId: string, pipeline: "processing" | "modelling", stage: ProcessingStageName, checked: boolean) => void;
  setPipelineStageDetails: (projectId: string, pipeline: "processing" | "modelling", stage: ProcessingStageName, details: Partial<FieldWorkStage>) => void;
  toggleFieldWorkStage: (projectId: string, stage: FieldWorkStageName, completed: boolean) => void;
  setFieldWorkStageDetails: (projectId: string, stage: FieldWorkStageName, details: Partial<FieldWorkStage>) => void;
  addModellingDailyEntry: (entry: ModellingDailyEntry) => void;
  updateModellingDailyEntry: (id: string, updates: Partial<ModellingDailyEntry>) => void;
  deleteModellingDailyEntry: (projectId: string, id: string) => void;
}

function createSeedActivity(
  id: string,
  projectId: string,
  activityType: string,
  date: string,
  location: string,
  lat: number,
  lng: number,
  equipmentUsed: string[],
  areaSqKm: number,
  remarks: string
): Activity {
  return {
    id,
    projectId,
    activityType,
    date,
    location,
    lat,
    lng,
    fieldWork: {
      id: `fw-${id}`,
      date,
      time: "",
      location,
      lat,
      lng,
      areaSqKm,
      linearKm: 0,
      equipmentUsed,
      remarks,
      completed: true,
    },
    processing: { id: `proc-${id}`, softwareUsed: "", inputFiles: "", outputFiles: "", processingStatus: "Pending", remarks: "", completed: false },
    modelling: { id: `mod-${id}`, modelType: "", softwareUsed: "", modelFile: "", remarks: "", completed: false },
    documentation: { id: `doc-${id}`, reportUpload: "", pdfUpload: [], documentVersion: "", remarks: "", completed: false },
  };
}

const SEED_MODELLING_DAILY: Record<string, ModellingDailyEntry[]> = {
  p1: [
    { id: "md1", projectId: "p1", personName: "Rahul Sharma", startDate: "19 May 2024", endDate: "19 May 2024", startTime: "09:00", endTime: "18:00", totalHours: 9, process: "production", status: "Completed", ipComp: "WS-01" },
    { id: "md2", projectId: "p1", personName: "Priya Patel", startDate: "20 May 2024", endDate: "20 May 2024", startTime: "10:00", endTime: "17:00", totalHours: 7, process: "qc", status: "In Progress", ipComp: "WS-02" },
  ],
  p5: [
    { id: "md3", projectId: "p5", personName: "Rahul Sharma", startDate: "05 Apr 2024", endDate: "05 Apr 2024", startTime: "08:00", endTime: "17:00", totalHours: 9, process: "production", status: "Completed", ipComp: "WS-01" },
  ],
};

const SEED_PROJECTS: Project[] = [
  { id: "p1", name: "SCR Bridge Survey", location: "KagaZnagar", state: "TS", status: "Active", progress: 75, client: "South Central Railway", projectId: "PRJ-2024-001", poValue: 5000000, startDate: "12 May 2024", endDate: "25 May 2024", projectManager: "Amit Kumar", lat: 16.7563, lng: 80.4356 },
  { id: "p2", name: "Rail Corridor Mapping", location: "Guntakal", state: "AP", status: "Active", progress: 60, client: "Indian Railways", projectId: "PRJ-2024-002", poValue: 3500000, startDate: "05 May 2024", endDate: "20 May 2024", projectManager: "Amit Kumar", lat: 15.1667, lng: 77.3667 },
  { id: "p3", name: "SHM Monitoring Project", location: "Vijayawada", state: "AP", status: "Planning", progress: 40, client: "NHAI", projectId: "PRJ-2024-003", poValue: 2800000, startDate: "10 May 2024", endDate: "30 Jun 2024", projectManager: "Sunil Verma", lat: 16.5062, lng: 80.6480 },
  { id: "p4", name: "Digital Twin - Station", location: "Secunderabad", state: "TS", status: "Quotation Sent", progress: 0, client: "South Central Railway", projectId: "PRJ-2024-004", poValue: 0, startDate: "", endDate: "", projectManager: "Amit Kumar", lat: 17.3850, lng: 78.4867 },
  { id: "p5", name: "Highway LiDAR Scan", location: "Hyderabad", state: "TS", status: "Completed", progress: 100, client: "NHAI", projectId: "PRJ-2024-005", poValue: 4200000, startDate: "01 Apr 2024", endDate: "30 Apr 2024", projectManager: "Ramesh Gupta", lat: 17.3850, lng: 78.4867 },
  { id: "p6", name: "Metro Corridor Survey", location: "Chennai", state: "TN", status: "On Hold", progress: 35, client: "CMRL", projectId: "PRJ-2024-006", poValue: 6000000, startDate: "15 Mar 2024", endDate: "15 Jun 2024", projectManager: "Prakash S", lat: 13.0827, lng: 80.2707 },
];

const SEED_EQUIPMENT: Equipment[] = [
  { id: "e1", name: "NavVis VLX 3", type: "Mobile LiDAR Scanner", status: "In Use", assignedTo: "Ramesh" },
  { id: "e2", name: "Trinity F90+", type: "Fixed Wing UAV", status: "In Use", assignedTo: "Sunil" },
  { id: "e3", name: "Leica GS18", type: "GNSS Receiver", status: "In Use", assignedTo: "Mahesh" },
  { id: "e4", name: "Leica TS16", type: "Total Station", status: "Maintenance", assignedTo: "Prakash" },
  { id: "e5", name: "FARO Focus S350", type: "3D Laser Scanner", status: "Available", assignedTo: "" },
  { id: "e6", name: "DJI Matrice 300", type: "Drone UAV", status: "Available", assignedTo: "" },
  { id: "e7", name: "Trimble R10", type: "GNSS Receiver", status: "In Use", assignedTo: "Vijay" },
];

const SEED_ACTIVITIES: Activity[] = [
  createSeedActivity("a1", "p1", "Drone LiDAR Survey", "16 May 2024", "Kagaznagar", 16.7563, 80.4356, ["Trinity F90+", "GS18 DGPS"], 12.5, "Weather good. Completed Area 12.50 sqkm."),
  createSeedActivity("a2", "p2", "GNSS Control Survey", "15 May 2024", "Guntakal", 15.1667, 77.3667, ["Leica GS18"], 8.0, "Set up 12 GCPs along corridor."),
  createSeedActivity("a3", "p1", "Ground Truth Verification", "14 May 2024", "Kagaznagar", 16.7563, 80.4356, ["Leica TS16"], 3.2, "Cross-checked with design data."),
];

const SEED_INVOICES: Invoice[] = [
  { id: "i1", projectId: "p1", number: "INV-001", description: "Advance", amount: 1000000, date: "01 May 2024", status: "Paid" },
  { id: "i2", projectId: "p1", number: "INV-002", description: "Field Work Completion", amount: 1500000, date: "15 May 2024", status: "Partial" },
  { id: "i3", projectId: "p1", number: "INV-003", description: "Processing Completion", amount: 1500000, date: "25 May 2024", status: "Pending" },
  { id: "i4", projectId: "p1", number: "INV-004", description: "Final Delivery", amount: 1000000, date: "05 Jun 2024", status: "Not Raised" },
  { id: "i5", projectId: "p2", number: "INV-005", description: "Advance", amount: 700000, date: "06 May 2024", status: "Paid" },
  { id: "i6", projectId: "p2", number: "INV-006", description: "Field Work Completion", amount: 1050000, date: "22 May 2024", status: "Pending" },
];

const SEED_EXPENSES: Expense[] = [
  { id: "ex1", projectId: "p1", expenseType: "Fuel", date: "16 May 2024", amount: 2500, paidBy: "Ramesh", location: "Kagaznagar", remarks: "Fuel for site visit" },
  { id: "ex2", projectId: "p2", expenseType: "Accommodation", date: "15 May 2024", amount: 3200, paidBy: "Sunil", location: "Guntakal", remarks: "Hotel for 2 nights" },
  { id: "ex3", projectId: "p1", expenseType: "Vehicle", date: "14 May 2024", amount: 4500, paidBy: "Mahesh", location: "Kagaznagar", remarks: "Vehicle rental for equipment transport" },
];

const SEED_ADVANCES: Advance[] = [
  { id: "ad1", projectId: "p1", personName: "Ramesh", amount: 15000, date: "10 May 2024", purpose: "Field trip advance", settled: false, remarks: "For SCR Bridge survey - fuel & accommodation" },
  { id: "ad2", projectId: "p2", personName: "Sunil", amount: 20000, date: "04 May 2024", purpose: "Site setup advance", settled: true, settledDate: "16 May 2024", remarks: "Guntakal corridor mapping" },
];

const EMPTY_FIELD_WORK: FieldWorkStage = { completed: false };
const EMPTY_STAGE_PROGRESS: StageProgress = {
  production: { ...EMPTY_FIELD_WORK },
  qc: { ...EMPTY_FIELD_WORK },
  qa: { ...EMPTY_FIELD_WORK },
  delivery: { ...EMPTY_FIELD_WORK },
};

const SEED_PIPELINES: Record<string, ProjectPipeline> = {
  p1: {
    processing: {
      production: { completed: true, date: "16 May 2024", time: "09:00", location: "Processing Center", areaSqKm: 45.6 },
      qc: { completed: true, date: "18 May 2024", time: "14:30", location: "QC Lab" },
      qa: { completed: true, date: "20 May 2024", time: "11:00", location: "QA Office" },
      delivery: { completed: false },
    },
    modelling: {
      production: { completed: true, date: "19 May 2024", time: "10:00", location: "Modelling Studio" },
      qc: { completed: true, date: "21 May 2024", time: "15:00", location: "QC Lab" },
      qa: { completed: false },
      delivery: { completed: false },
    },
    fieldWork: {
      recce: { completed: true, date: "12 May 2024", time: "10:30", location: "Kagaznagar", linearKm: 12.5 },
      dgps: { completed: true, date: "13 May 2024", time: "14:00", location: "Kagaznagar", areaSqKm: 8.2 },
      totalStation: { completed: true, date: "14 May 2024", time: "09:15", location: "Bridge Site - Section A", linearKm: 3.5 },
      scanning: { completed: true, date: "16 May 2024", time: "11:45", location: "SCR Corridor", areaSqKm: 45.6 },
      instrumentation: { completed: false },
      uav: { completed: false },
      gpr: { completed: false },
    },
  },
  p5: {
    processing: {
      production: { completed: true, date: "02 Apr 2024", time: "08:00", location: "Processing Hub", areaSqKm: 85.2 },
      qc: { completed: true, date: "10 Apr 2024", time: "09:30", location: "QC Lab" },
      qa: { completed: true, date: "18 Apr 2024", time: "14:00", location: "QA Office" },
      delivery: { completed: true, date: "28 Apr 2024", time: "16:00", location: "Client Portal" },
    },
    modelling: {
      production: { completed: true, date: "05 Apr 2024", time: "10:00", location: "Modelling Studio" },
      qc: { completed: true, date: "12 Apr 2024", time: "11:30", location: "QC Lab" },
      qa: { completed: true, date: "20 Apr 2024", time: "15:00", location: "QA Office" },
      delivery: { completed: true, date: "29 Apr 2024", time: "12:00", location: "Client Portal" },
    },
    fieldWork: {
      recce: { completed: true, date: "01 Apr 2024", time: "08:00", location: "Hyderabad Outer Ring Road", linearKm: 25.0 },
      dgps: { completed: true, date: "02 Apr 2024", time: "09:30", location: "ORR Junction 8-12", areaSqKm: 15.0 },
      totalStation: { completed: true, date: "03 Apr 2024", time: "07:45", location: "Junction 10", linearKm: 6.2 },
      scanning: { completed: true, date: "05 Apr 2024", time: "10:00", location: "ORR Corridor", areaSqKm: 85.2 },
      instrumentation: { completed: true, date: "08 Apr 2024", time: "13:20", location: "Bridge Structure 7", linearKm: 0.8 },
      uav: { completed: true, date: "10 Apr 2024", time: "09:00", location: "ORR Corridor", areaSqKm: 85.2 },
      gpr: { completed: true, date: "12 Apr 2024", time: "10:30", location: "Junction 8", linearKm: 2.5 },
    },
  },
};

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "dr_app_data";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    projects: SEED_PROJECTS,
    activities: SEED_ACTIVITIES,
    equipment: SEED_EQUIPMENT,
    invoices: SEED_INVOICES,
    expenses: SEED_EXPENSES,
    advances: SEED_ADVANCES,
    documents: [],
    pipelines: SEED_PIPELINES,
    modellingDailyEntries: SEED_MODELLING_DAILY,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setState((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
    });
  }, []);

  const save = (newState: Partial<AppState>) => {
    const merged = { ...state, ...newState };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setState(merged);
  };

  const login = async (email: string, _password: string, userName?: string): Promise<boolean> => {
    if (!email) return false;
    const name = userName || email.split("@")[0] || "User";
    const isAdmin = name.toLowerCase().includes("roshan") || email.toLowerCase().includes("roshan") || email.includes("@clovetech.com") || email.includes("admin");
    const user: User = { name, role: isAdmin ? "Admin" : "Project Manager", email, isAdmin };
    save({ user });
    return true;
  };

  const logout = () => save({ user: null });

  const addProject = (p: Project) => save({ projects: [...state.projects, p] });
  const addActivity = (a: Activity) => save({ activities: [...state.activities, a] });

  const updateActivity = (id: string, updates: Partial<Activity>) =>
    save({ activities: state.activities.map((a) => (a.id === id ? { ...a, ...updates } : a)) });

  const updateActivityWorkflow = (
    activityId: string,
    section: "fieldWork" | "processing" | "modelling" | "documentation",
    data: any
  ) => {
    save({
      activities: state.activities.map((a) => {
        if (a.id !== activityId) return a;
        return { ...a, [section]: { ...a[section], ...data } };
      }),
    });
  };

  const addExpense = (e: Expense) => save({ expenses: [...state.expenses, e] });
  const addInvoice = (i: Invoice) => save({ invoices: [...state.invoices, i] });
  const addAdvance = (a: Advance) => save({ advances: [...state.advances, a] });
  const updateAdvance = (id: string, updates: Partial<Advance>) =>
    save({ advances: state.advances.map((a) => (a.id === id ? { ...a, ...updates } : a)) });
  const deleteAdvance = (id: string) =>
    save({ advances: state.advances.filter((a) => a.id !== id) });
  const updateProject = (id: string, updates: Partial<Project>) =>
    save({ projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) });

  const addDocument = (d: Document) => save({ documents: [...state.documents, d] });
  const deleteDocument = (id: string) => save({ documents: state.documents.filter((d) => d.id !== id) });
  const getProjectDocuments = (projectId: string) => state.documents.filter((d) => d.projectId === projectId);

  const togglePipelineStage = (projectId: string, pipeline: "processing" | "modelling", stage: ProcessingStageName, checked: boolean) => {
    const existing = state.pipelines[projectId] ?? {
      processing: { ...EMPTY_STAGE_PROGRESS },
      modelling: { ...EMPTY_STAGE_PROGRESS },
      fieldWork: {} as Record<FieldWorkStageName, FieldWorkStage>,
    };
    const now = new Date();
    const today = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const nowTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    const current = existing[pipeline][stage] ?? {};
    const updated = {
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

  const setPipelineStageDetails = (projectId: string, pipeline: "processing" | "modelling", stage: ProcessingStageName, details: Partial<FieldWorkStage>) => {
    const existing = state.pipelines[projectId] ?? {
      processing: { ...EMPTY_STAGE_PROGRESS },
      modelling: { ...EMPTY_STAGE_PROGRESS },
      fieldWork: {} as Record<FieldWorkStageName, FieldWorkStage>,
    };
    const current = existing[pipeline][stage] ?? {};
    const updated = {
      ...existing,
      [pipeline]: {
        ...existing[pipeline],
        [stage]: { ...current, ...details },
      },
    };
    save({ pipelines: { ...state.pipelines, [projectId]: updated } });
  };

  const toggleFieldWorkStage = (projectId: string, stage: FieldWorkStageName, completed: boolean) => {
    const existing = state.pipelines[projectId] ?? {
      processing: { ...EMPTY_STAGE_PROGRESS },
      modelling: { ...EMPTY_STAGE_PROGRESS },
      fieldWork: {} as Record<FieldWorkStageName, FieldWorkStage>,
    };
    const now = new Date();
    const today = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const nowTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    const current = existing.fieldWork[stage] ?? {};
    const updated = {
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

  const setFieldWorkStageDetails = (projectId: string, stage: FieldWorkStageName, details: Partial<FieldWorkStage>) => {
    const existing = state.pipelines[projectId] ?? {
      processing: { ...EMPTY_STAGE_PROGRESS },
      modelling: { ...EMPTY_STAGE_PROGRESS },
      fieldWork: {} as Record<FieldWorkStageName, FieldWorkStage>,
    };
    const current = existing.fieldWork[stage] ?? {};
    const updated = {
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

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout,
      addProject, addActivity, updateActivity, updateActivityWorkflow,
      addExpense, addInvoice, addAdvance,
      updateAdvance, deleteAdvance,
      updateProject,
      addDocument, deleteDocument, getProjectDocuments,
      togglePipelineStage, setPipelineStageDetails,
      toggleFieldWorkStage, setFieldWorkStageDetails,
      addModellingDailyEntry, updateModellingDailyEntry, deleteModellingDailyEntry,
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
