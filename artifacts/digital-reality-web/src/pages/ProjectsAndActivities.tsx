import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { Project, ProjectStatus, Activity, FieldWorkSection, ProcessingSection, ModellingSection, DocumentationSection } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { Plus, Building2, Hash, CalendarDays, Clock, Briefcase, Search, Filter, MapPin, Wrench, Navigation, CheckCircle2, Compass, Layers, ActivitySquare, Crosshair, FileText, Save, Box, Cpu } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";

const PROJECT_STATUSES: ProjectStatus[] = ["Active", "Completed", "On Hold", "Planning", "Quotation Sent"];

const MONTHS: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
const REV_MONTHS = Object.fromEntries(Object.entries(MONTHS).map(([k, v]) => [v, k]));

function dateToInput(v: string) {
  const p = v.split(" ");
  if (p.length === 3 && MONTHS[p[1]]) return `${p[2]}-${MONTHS[p[1]]}-${p[0].padStart(2, "0")}`;
  return v;
}

function dateFromInput(v: string) {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  return `${parseInt(d)} ${REV_MONTHS[m]} ${y}`;
}

function SectionHead({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      <Separator className="flex-1" />
    </div>
  );
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-center gap-3">
      <Label className="text-xs text-muted-foreground text-right leading-tight">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

const EMPTY_FORM: Omit<Project, "id"> = {
  name: "",
  client: "",
  location: "",
  state: "",
  lat: 0,
  lng: 0,
  status: "Planning",
  progress: 0,
  projectId: "",
  poValue: 0,
  startDate: "",
  endDate: "",
  projectManager: "",
  clientGroupCode: "",
  clientCode: "",
  client3Code: "",
  cloveProjectCode: "",
  clientProjectCode: "",
  bidQuote: "Quote",
  enquiryDate: "",
  estimatedDate: "",
  orderedDate: "",
  inputReceivableDate: "",
  proposedDate: "",
  deliveredDate: "",
  quotedHours: 0,
  orderHours: 0,
  receivedHours: 0,
  areaSqKm: 0,
  resolution: "",
};

function AddProjectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addProject } = useApp();
  const [form, setForm] = useState<Omit<Project, "id">>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof Omit<Project, "id">, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const str = (key: keyof Omit<Project, "id">) => (form[key] as string | undefined) ?? "";
  const num = (key: keyof Omit<Project, "id">) => (form[key] as number | undefined) ?? 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Project name is required";
    if (!form.client.trim()) e.client = "Client is required";
    if (!form.location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addProject({ ...form, id: `p${Date.now()}` });
      setForm({ ...EMPTY_FORM });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Project</SheetTitle>
          <SheetDescription>Enter project details to create a new project</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <div className="space-y-5">
            <SectionHead icon={Building2} title="Basic Information" />
            <FieldRow label="Project Name" required>
              <Input placeholder="Enter project name" value={str("name")} onChange={(e) => set("name", e.target.value)} className={errors.name ? "border-destructive" : ""} />
              {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
            </FieldRow>
            <FieldRow label="Client" required>
              <Input placeholder="Enter client name" value={str("client")} onChange={(e) => set("client", e.target.value)} className={errors.client ? "border-destructive" : ""} />
              {errors.client && <span className="text-xs text-destructive">{errors.client}</span>}
            </FieldRow>
            <FieldRow label="Location" required>
              <Input placeholder="Enter project location" value={str("location")} onChange={(e) => set("location", e.target.value)} className={errors.location ? "border-destructive" : ""} />
              {errors.location && <span className="text-xs text-destructive">{errors.location}</span>}
            </FieldRow>
            <FieldRow label="State">
              <Input placeholder="Enter state" value={str("state")} onChange={(e) => set("state", e.target.value)} />
            </FieldRow>
            <FieldRow label="Project ID">
              <Input placeholder="Enter project ID" value={str("projectId")} onChange={(e) => set("projectId", e.target.value)} />
            </FieldRow>

            <SectionHead icon={Hash} title="Codes" />
            <FieldRow label="Client Group Code">
              <Input value={str("clientGroupCode")} onChange={(e) => set("clientGroupCode", e.target.value)} />
            </FieldRow>
            <FieldRow label="Client Code">
              <Input value={str("clientCode")} onChange={(e) => set("clientCode", e.target.value)} />
            </FieldRow>
            <FieldRow label="Client 3 Code">
              <Input value={str("client3Code")} onChange={(e) => set("client3Code", e.target.value)} />
            </FieldRow>
            <FieldRow label="Clove Project Code">
              <Input value={str("cloveProjectCode")} onChange={(e) => set("cloveProjectCode", e.target.value)} />
            </FieldRow>
            <FieldRow label="Client Project Code">
              <Input value={str("clientProjectCode")} onChange={(e) => set("clientProjectCode", e.target.value)} />
            </FieldRow>

            <SectionHead icon={CalendarDays} title="Dates" />
            <FieldRow label="Start Date">
              <Input type="date" value={dateToInput(str("startDate"))} onChange={(e) => set("startDate", dateFromInput(e.target.value))} />
            </FieldRow>
            <FieldRow label="End Date">
              <Input type="date" value={dateToInput(str("endDate"))} onChange={(e) => set("endDate", dateFromInput(e.target.value))} />
            </FieldRow>
            <FieldRow label="Enquiry Date">
              <Input type="date" value={dateToInput(str("enquiryDate"))} onChange={(e) => set("enquiryDate", dateFromInput(e.target.value))} />
            </FieldRow>
            <FieldRow label="Estimated Date">
              <Input type="date" value={dateToInput(str("estimatedDate"))} onChange={(e) => set("estimatedDate", dateFromInput(e.target.value))} />
            </FieldRow>
            <FieldRow label="Ordered Date">
              <Input type="date" value={dateToInput(str("orderedDate"))} onChange={(e) => set("orderedDate", dateFromInput(e.target.value))} />
            </FieldRow>
            <FieldRow label="Input Receivable Date">
              <Input type="date" value={dateToInput(str("inputReceivableDate"))} onChange={(e) => set("inputReceivableDate", dateFromInput(e.target.value))} />
            </FieldRow>
            <FieldRow label="Proposed Date">
              <Input type="date" value={dateToInput(str("proposedDate"))} onChange={(e) => set("proposedDate", dateFromInput(e.target.value))} />
            </FieldRow>
            <FieldRow label="Delivered Date">
              <Input type="date" value={dateToInput(str("deliveredDate"))} onChange={(e) => set("deliveredDate", dateFromInput(e.target.value))} />
            </FieldRow>

            <SectionHead icon={Briefcase} title="Details" />
            <FieldRow label="Status">
              <Select value={str("status")} onValueChange={(v) => set("status", v as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Progress %">
              <Input type="number" min="0" max="100" value={num("progress")} onChange={(e) => set("progress", parseInt(e.target.value) || 0)} />
            </FieldRow>
            <FieldRow label="PO Value">
              <Input type="number" value={num("poValue")} onChange={(e) => set("poValue", parseFloat(e.target.value) || 0)} />
            </FieldRow>
            <FieldRow label="Project Manager">
              <Input value={str("projectManager")} onChange={(e) => set("projectManager", e.target.value)} />
            </FieldRow>
            <FieldRow label="Bid/Quote">
              <Select value={str("bidQuote")} onValueChange={(v) => set("bidQuote", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quote">Quote</SelectItem>
                  <SelectItem value="Bid">Bid</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Quoted Hours">
              <Input type="number" value={num("quotedHours")} onChange={(e) => set("quotedHours", parseFloat(e.target.value) || 0)} />
            </FieldRow>
            <FieldRow label="Order Hours">
              <Input type="number" value={num("orderHours")} onChange={(e) => set("orderHours", parseFloat(e.target.value) || 0)} />
            </FieldRow>
            <FieldRow label="Received Hours">
              <Input type="number" value={num("receivedHours")} onChange={(e) => set("receivedHours", parseFloat(e.target.value) || 0)} />
            </FieldRow>
            <FieldRow label="Area (Sq Km)">
              <Input type="number" value={num("areaSqKm")} onChange={(e) => set("areaSqKm", parseFloat(e.target.value) || 0)} />
            </FieldRow>
            <FieldRow label="Resolution">
              <Input placeholder="Enter resolution" value={str("resolution")} onChange={(e) => set("resolution", e.target.value)} />
            </FieldRow>
          </div>
        </ScrollArea>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Create Project"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type WorkflowKey = "fieldWork" | "processing" | "modelling" | "documentation";

const WORKFLOW_TABS: { key: WorkflowKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: "fieldWork", label: "Field Work", icon: MapPin, color: "text-emerald-600" },
  { key: "processing", label: "Processing", icon: Cpu, color: "text-blue-600" },
  { key: "modelling", label: "Modelling", icon: Box, color: "text-violet-600" },
  { key: "documentation", label: "Documentation", icon: FileText, color: "text-orange-600" },
];

function LocationPickerField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapSrc, setMapSrc] = useState("https://www.openstreetmap.org/export/embed.html?bbox=68.0%2C6.0%2C98.0%2C38.0&layer=mapnik&marker=20.0%2C80.0");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        onChange(display_name.split(",")[0].trim());
        setMapSrc(`https://www.openstreetmap.org/export/embed.html?bbox=${Number(lon)-0.01}%2C${Number(lat)-0.01}%2C${Number(lon)+0.01}%2C${Number(lat)+0.01}&layer=mapnik&marker=${lat}%2C${lon}`);
        setShowMap(true);
      }
    } catch {}
    setSearching(false);
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data?.display_name) onChange(data.display_name.split(",")[0].trim());
      } catch {}
      setMapSrc(`https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01}%2C${lat-0.01}%2C${lon+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lon}`);
      setShowMap(true);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input type="text" placeholder="Location" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 h-8 text-xs" />
        <Button variant="outline" size="sm" className="h-8 text-xs shrink-0 gap-1" onClick={handleSearch} disabled={searching}>{searching ? "…" : <Search className="w-3 h-3" />}Search</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs shrink-0 gap-1" onClick={handleAutoDetect} title="Auto-detect location"><Crosshair className="w-3 h-3" />Detect</Button>
        <Button variant="ghost" size="sm" className="h-8 text-xs shrink-0" onClick={() => setShowMap(v => !v)}>Map</Button>
      </div>
      <div className="flex items-center gap-2">
        <Input type="text" placeholder="Search location…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 h-8 text-xs" />
      </div>
      {showMap && (
        <div className="rounded-lg overflow-hidden border">
          <iframe title="OpenStreetMap" src={mapSrc} width="100%" height="250" style={{ border: 0, display: "block" }} loading="lazy" />
        </div>
      )}
    </div>
  );
}

function WorkflowFieldWorkCard({ activity, onSave }: { activity: Activity; onSave: (data: Partial<FieldWorkSection>) => void }) {
  const fw = activity.fieldWork;
  const [form, setForm] = useState({ ...fw });
  const [saving, setSaving] = useState(false);

  const handleSave = () => { setSaving(true); onSave(form); setTimeout(() => setSaving(false), 300); };

  return (
    <div className={`rounded-lg border p-5 space-y-4 ${form.completed ? "bg-green-50 border-green-200" : "bg-muted/20"}`}>
      <div className="flex items-start gap-4">
        <Checkbox id="fw-inline" checked={form.completed} onCheckedChange={(v) => setForm({ ...form, completed: !!v })} className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <label htmlFor="fw-inline" className={`text-sm font-semibold cursor-pointer select-none flex items-center gap-2 ${form.completed ? "text-green-700" : "text-foreground"}`}>
            {form.completed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <MapPin className="w-4 h-4 text-muted-foreground" />}
            Field Work
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">Site survey operations and data collection</p>
        </div>
        {form.completed && <Badge className="shrink-0 bg-green-100 text-green-700 border border-green-300">Done</Badge>}
      </div>

      {form.completed && (
        <div className="ml-9 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100/50 px-3 py-2 rounded-md">
            <CheckCircle2 className="w-4 h-4 shrink-0" />Field Work — {activity.activityType} is completed
          </div>
        </div>
      )}

      <div className="ml-9 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full h-8 text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full h-8 text-xs" />
          </div>
        </div>
        <div><LocationPickerField value={form.location} onChange={(v) => setForm({ ...form, location: v })} /></div>
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <Input type="number" step="0.1" min="0" placeholder="Area (sq km)" value={form.areaSqKm || ""} onChange={(e) => setForm({ ...form, areaSqKm: Number(e.target.value) || 0 })} className="w-full h-8 text-xs max-w-[140px]" />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">sq km</span>
          <Input type="number" step="0.1" min="0" placeholder="Linear km" value={form.linearKm || ""} onChange={(e) => setForm({ ...form, linearKm: Number(e.target.value) || 0 })} className="w-full h-8 text-xs max-w-[140px]" />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">km</span>
        </div>
      </div>

      <div className="ml-9 flex items-center justify-between pt-1">
        <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setForm({ ...form, equipmentUsed: [...form.equipmentUsed] })}>
          <Wrench className="w-3 h-3" />Equipment: {form.equipmentUsed.length > 0 ? form.equipmentUsed.join(", ") : "None"}
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 h-8 text-xs"><Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save"}</Button>
      </div>

      <div className="ml-9">
        <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="text-xs min-h-[60px]" placeholder="Field work remarks..." />
      </div>
    </div>
  );
}

function WorkflowProcessingCard({ activity, onSave }: { activity: Activity; onSave: (data: Partial<ProcessingSection>) => void }) {
  const proc = activity.processing;
  const [form, setForm] = useState({ ...proc });
  const [saving, setSaving] = useState(false);

  const handleSave = () => { setSaving(true); const completed = form.processingStatus === "Completed" || form.completed; onSave({ ...form, completed }); setTimeout(() => setSaving(false), 300); };

  return (
    <div className={`rounded-lg border p-5 space-y-4 ${form.completed ? "bg-green-50 border-green-200" : "bg-muted/20"}`}>
      <div className="flex items-start gap-4">
        <Checkbox id="proc-inline" checked={form.completed} onCheckedChange={(v) => setForm({ ...form, completed: !!v, processingStatus: v ? "Completed" : form.processingStatus })} className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <label htmlFor="proc-inline" className={`text-sm font-semibold cursor-pointer select-none flex items-center gap-2 ${form.completed ? "text-green-700" : "text-foreground"}`}>
            {form.completed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Cpu className="w-4 h-4 text-muted-foreground" />}
            Processing
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">Data processing and output generation</p>
        </div>
        {form.completed && <Badge className="shrink-0 bg-green-100 text-green-700 border border-green-300">Done</Badge>}
      </div>
      <div className="ml-9 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs">Software Used</Label><Input type="text" value={form.softwareUsed} onChange={(e) => setForm({ ...form, softwareUsed: e.target.value })} className="h-8 text-xs" placeholder="e.g. Pix4D" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Status</Label>
            <Select value={form.processingStatus} onValueChange={(v) => setForm({ ...form, processingStatus: v, completed: v === "Completed" || form.completed })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs">Input Files</Label><Input type="text" value={form.inputFiles} onChange={(e) => setForm({ ...form, inputFiles: e.target.value })} className="h-8 text-xs" placeholder="e.g. Raw point cloud" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Output Files</Label><Input type="text" value={form.outputFiles} onChange={(e) => setForm({ ...form, outputFiles: e.target.value })} className="h-8 text-xs" placeholder="e.g. Classified LAS" /></div>
        </div>
        <div className="flex items-center justify-end pt-1">
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 h-8 text-xs"><Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}

function WorkflowModellingCard({ activity, onSave }: { activity: Activity; onSave: (data: Partial<ModellingSection>) => void }) {
  const mod = activity.modelling;
  const [form, setForm] = useState({ ...mod });
  const [saving, setSaving] = useState(false);

  const handleSave = () => { setSaving(true); onSave(form); setTimeout(() => setSaving(false), 300); };

  return (
    <div className={`rounded-lg border p-5 space-y-4 ${form.completed ? "bg-green-50 border-green-200" : "bg-muted/20"}`}>
      <div className="flex items-start gap-4">
        <Checkbox id="mod-inline" checked={form.completed} onCheckedChange={(v) => setForm({ ...form, completed: !!v })} className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <label htmlFor="mod-inline" className={`text-sm font-semibold cursor-pointer select-none flex items-center gap-2 ${form.completed ? "text-green-700" : "text-foreground"}`}>
            {form.completed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Box className="w-4 h-4 text-muted-foreground" />}
            Modelling
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">3D model creation and digital twin generation</p>
        </div>
        {form.completed && <Badge className="shrink-0 bg-green-100 text-green-700 border border-green-300">Done</Badge>}
      </div>
      <div className="ml-9 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs">Model Type</Label><Input type="text" value={form.modelType} onChange={(e) => setForm({ ...form, modelType: e.target.value })} className="h-8 text-xs" placeholder="e.g. 3D Mesh, BIM" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Software Used</Label><Input type="text" value={form.softwareUsed} onChange={(e) => setForm({ ...form, softwareUsed: e.target.value })} className="h-8 text-xs" placeholder="e.g. Revit, Blender" /></div>
        </div>
        <div className="space-y-1.5"><Label className="text-xs">Model File</Label><Input type="text" value={form.modelFile} onChange={(e) => setForm({ ...form, modelFile: e.target.value })} className="h-8 text-xs" placeholder="e.g. bridge_model.rvt" /></div>
        <div className="flex items-center justify-end pt-1">
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 h-8 text-xs"><Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}

function WorkflowDocumentationCard({ activity, onSave }: { activity: Activity; onSave: (data: Partial<DocumentationSection>) => void }) {
  const doc = activity.documentation;
  const [form, setForm] = useState({ ...doc });
  const [saving, setSaving] = useState(false);

  const handleSave = () => { setSaving(true); onSave(form); setTimeout(() => setSaving(false), 300); };

  return (
    <div className={`rounded-lg border p-5 space-y-4 ${form.completed ? "bg-green-50 border-green-200" : "bg-muted/20"}`}>
      <div className="flex items-start gap-4">
        <Checkbox id="doc-inline" checked={form.completed} onCheckedChange={(v) => setForm({ ...form, completed: !!v })} className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <label htmlFor="doc-inline" className={`text-sm font-semibold cursor-pointer select-none flex items-center gap-2 ${form.completed ? "text-green-700" : "text-foreground"}`}>
            {form.completed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
            Documentation
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">Reports, PDFs and document versioning</p>
        </div>
        {form.completed && <Badge className="shrink-0 bg-green-100 text-green-700 border border-green-300">Done</Badge>}
      </div>
      <div className="ml-9 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs">Report Upload</Label><Input type="text" value={form.reportUpload} onChange={(e) => setForm({ ...form, reportUpload: e.target.value })} className="h-8 text-xs" placeholder="Report URL or path" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Document Version</Label><Input type="text" value={form.documentVersion} onChange={(e) => setForm({ ...form, documentVersion: e.target.value })} className="h-8 text-xs" placeholder="e.g. v1.0" /></div>
        </div>
        <div className="space-y-1.5"><Label className="text-xs">PDF Uploads</Label><Input type="text" value={form.pdfUpload.join(", ")} onChange={(e) => setForm({ ...form, pdfUpload: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="h-8 text-xs" placeholder="Comma-separated PDF files" /></div>
        <div className="flex items-center justify-end pt-1">
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 h-8 text-xs"><Save className="w-3.5 h-3.5" />{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsAndActivities() {
  const { projects, activities, updateActivityWorkflow, getActivityProgress } = useApp();
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [workflowTab, setWorkflowTab] = useState<WorkflowKey>("fieldWork");

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.client.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.location.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredActivities = activities.filter(a =>
    !selectedProjectId || a.projectId === selectedProjectId
  );

  const defaultActivities = activities;
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectActivities = activities.filter(a => a.projectId === selectedProjectId);
  const selectedActivity = activities.find(a => a.id === selectedActivityId);

  const handleSectionSave = (
    section: WorkflowKey,
    data: Partial<FieldWorkSection | ProcessingSection | ModellingSection | DocumentationSection>
  ) => {
    if (!selectedActivityId) return;
    updateActivityWorkflow(selectedActivityId, section, data);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects & Activities</h1>
          <p className="text-muted-foreground mt-1">Manage projects and track field operations</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/activities/add">
              <Plus className="w-4 h-4 mr-2" />
              Log Activity
            </Link>
          </Button>
          <Button onClick={() => setAddProjectOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Projects ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Activities ({defaultActivities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name, client, or location..."
                className="pl-9 bg-card"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="shrink-0 bg-card">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredProjects.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No projects found</p>
              </Card>
            ) : (
              filteredProjects.map(project => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{project.client} • {project.location}</p>
                          <div className="flex gap-2 mt-2">
                            <StatusBadge status={project.status} />
                            <Badge variant="secondary">{project.projectId}</Badge>
                          </div>
                        </div>
                        <div className="w-full md:w-32 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="w-full sm:w-72">
              <Select value={selectedProjectId} onValueChange={(v) => { setSelectedProjectId(v); setSelectedActivityId(""); }}>
                <SelectTrigger><SelectValue placeholder="All projects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search activities..." className="pl-9 bg-card" value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} />
            </div>
          </div>

          {projectActivities.length === 0 ? (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ActivitySquare className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground mb-2">No activities for this project yet.</p>
                <Button asChild><Link href="/activities/add"><Plus className="w-4 h-4 mr-2" />Log Activity</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {projectActivities.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedActivityId(a.id); setWorkflowTab("fieldWork"); }}
                    className={`shrink-0 text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                      a.id === selectedActivityId
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold truncate max-w-[140px]">{a.activityType}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {[a.fieldWork, a.processing, a.modelling, a.documentation].map((s, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${s.completed ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {selectedActivity && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedActivity.activityType}</h3>
                      <p className="text-sm text-muted-foreground">{selectedActivity.location} &middot; {selectedActivity.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <Progress value={getActivityProgress(selectedActivity)} className="w-20 h-2" />
                      <span className="text-xs font-bold tabular-nums">{getActivityProgress(selectedActivity)}%</span>
                    </div>
                  </div>

                  <Tabs value={workflowTab} onValueChange={(v) => setWorkflowTab(v as WorkflowKey)}>
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-0 overflow-x-auto">
                      {WORKFLOW_TABS.map(tab => {
                        const section = selectedActivity[tab.key];
                        const completed = section.completed;
                        return (
                          <TabsTrigger
                            key={tab.key}
                            value={tab.key}
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 whitespace-nowrap text-xs gap-1.5"
                          >
                            <tab.icon className={`w-3.5 h-3.5 ${completed ? tab.color : "text-muted-foreground"}`} />
                            {tab.label}
                            {completed && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    <TabsContent value="fieldWork" className="pt-5">
                      <WorkflowFieldWorkCard activity={selectedActivity} onSave={(data) => handleSectionSave("fieldWork", data)} />
                    </TabsContent>
                    <TabsContent value="processing" className="pt-5">
                      <WorkflowProcessingCard activity={selectedActivity} onSave={(data) => handleSectionSave("processing", data)} />
                    </TabsContent>
                    <TabsContent value="modelling" className="pt-5">
                      <WorkflowModellingCard activity={selectedActivity} onSave={(data) => handleSectionSave("modelling", data)} />
                    </TabsContent>
                    <TabsContent value="documentation" className="pt-5">
                      <WorkflowDocumentationCard activity={selectedActivity} onSave={(data) => handleSectionSave("documentation", data)} />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddProjectSheet open={addProjectOpen} onClose={() => setAddProjectOpen(false)} />
    </div>
  );
}
