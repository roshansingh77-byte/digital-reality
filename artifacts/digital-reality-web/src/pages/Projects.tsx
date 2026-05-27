import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { Project, ProjectStatus } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Building2, Hash, CalendarDays, Clock, Briefcase, Trash2 } from "lucide-react";

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
    if (!form.projectManager.trim()) e.projectManager = "Project manager is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    const newId = `p${Date.now()}`;
    const autoId = form.projectId.trim() || `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    addProject({ ...form, id: newId, projectId: autoId });
    setTimeout(() => {
      setSaving(false);
      setForm({ ...EMPTY_FORM });
      setErrors({});
      onClose();
    }, 300);
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </SheetTitle>
          <SheetDescription className="text-xs">Fill in the project details. Fields marked * are required.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">

            <SectionHead icon={Briefcase} title="Core Information" />

            <FieldRow label="Project Name" required>
              <div>
                <Input
                  placeholder="e.g. SCR Bridge Survey"
                  value={str("name")}
                  onChange={e => { set("name", e.target.value); setErrors(prev => ({ ...prev, name: "" })); }}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
            </FieldRow>

            <FieldRow label="Client" required>
              <div>
                <Input
                  placeholder="e.g. South Central Railway"
                  value={str("client")}
                  onChange={e => { set("client", e.target.value); setErrors(prev => ({ ...prev, client: "" })); }}
                  className={errors.client ? "border-destructive" : ""}
                />
                {errors.client && <p className="text-xs text-destructive mt-1">{errors.client}</p>}
              </div>
            </FieldRow>

            <FieldRow label="Location" required>
              <div>
                <Input
                  placeholder="e.g. Hyderabad"
                  value={str("location")}
                  onChange={e => { set("location", e.target.value); setErrors(prev => ({ ...prev, location: "" })); }}
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
              </div>
            </FieldRow>

            <FieldRow label="State">
              <Input placeholder="e.g. TS" value={str("state")} onChange={e => set("state", e.target.value)} className="max-w-[80px]" />
            </FieldRow>

            <FieldRow label="Status">
              <Select value={str("status") || "Planning"} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldRow>

            <FieldRow label="Project Manager" required>
              <div>
                <Input
                  placeholder="e.g. Roshan Singh"
                  value={str("projectManager")}
                  onChange={e => { set("projectManager", e.target.value); setErrors(prev => ({ ...prev, projectManager: "" })); }}
                  className={errors.projectManager ? "border-destructive" : ""}
                />
                {errors.projectManager && <p className="text-xs text-destructive mt-1">{errors.projectManager}</p>}
              </div>
            </FieldRow>

            <FieldRow label="Project ID">
              <Input placeholder="Auto-generated if blank" value={str("projectId")} onChange={e => set("projectId", e.target.value)} />
            </FieldRow>

            <FieldRow label="PO Value (₹)">
              <Input type="number" placeholder="0" value={num("poValue") || ""} onChange={e => set("poValue", Number(e.target.value))} />
            </FieldRow>

            <FieldRow label="Progress (%)">
              <div className="flex items-center gap-3">
                <Input type="number" min={0} max={100} value={num("progress")} onChange={e => set("progress", Number(e.target.value))} className="max-w-[100px]" />
                <Progress value={num("progress")} className="flex-1 h-2" />
                <span className="text-sm font-bold w-10 text-right">{num("progress")}%</span>
              </div>
            </FieldRow>

            <FieldRow label="Start Date">
              <Input type="date" value={dateToInput(str("startDate"))} onChange={e => set("startDate", dateFromInput(e.target.value))} />
            </FieldRow>

            <FieldRow label="End Date">
              <Input type="date" value={dateToInput(str("endDate"))} onChange={e => set("endDate", dateFromInput(e.target.value))} />
            </FieldRow>

            <SectionHead icon={Building2} title="Client Codes" />

            <FieldRow label="Client Group Code">
              <Input value={str("clientGroupCode")} onChange={e => set("clientGroupCode", e.target.value)} />
            </FieldRow>
            <FieldRow label="Client Code">
              <Input value={str("clientCode")} onChange={e => set("clientCode", e.target.value)} />
            </FieldRow>
            <FieldRow label="Client 3 Code">
              <Input value={str("client3Code")} onChange={e => set("client3Code", e.target.value)} />
            </FieldRow>
            <FieldRow label="Bid / Quote">
              <Select value={str("bidQuote") || "Quote"} onValueChange={v => set("bidQuote", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bid">Bid</SelectItem>
                  <SelectItem value="Quote">Quote</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>

            <SectionHead icon={Hash} title="Project Codes" />

            <FieldRow label="Clove Project Code">
              <Input value={str("cloveProjectCode")} onChange={e => set("cloveProjectCode", e.target.value)} />
            </FieldRow>
            <FieldRow label="Client Project Code">
              <Input value={str("clientProjectCode")} onChange={e => set("clientProjectCode", e.target.value)} />
            </FieldRow>
            <FieldRow label="Area (Sq Km)">
              <Input type="number" step="0.1" value={num("areaSqKm") || ""} onChange={e => set("areaSqKm", Number(e.target.value))} />
            </FieldRow>
            <FieldRow label="Resolution">
              <Input placeholder="e.g. 5 cm" value={str("resolution")} onChange={e => set("resolution", e.target.value)} />
            </FieldRow>

            <SectionHead icon={CalendarDays} title="Key Dates" />

            {([
              ["enquiryDate", "Enquiry Date"],
              ["estimatedDate", "Estimated Date"],
              ["orderedDate", "Ordered Date"],
              ["inputReceivableDate", "Input Receivable Date"],
              ["proposedDate", "Proposed Date"],
              ["deliveredDate", "Delivered Date"],
            ] as [keyof Omit<Project, "id">, string][]).map(([key, label]) => (
              <FieldRow key={key} label={label}>
                <Input type="date" value={dateToInput(str(key))} onChange={e => set(key, dateFromInput(e.target.value))} />
              </FieldRow>
            ))}

            <SectionHead icon={Clock} title="Hours" />

            <FieldRow label="Quoted Hours">
              <Input type="number" value={num("quotedHours") || ""} onChange={e => set("quotedHours", Number(e.target.value))} />
            </FieldRow>
            <FieldRow label="Order Hours">
              <Input type="number" value={num("orderHours") || ""} onChange={e => set("orderHours", Number(e.target.value))} />
            </FieldRow>
            <FieldRow label="Received Hours">
              <Input type="number" value={num("receivedHours") || ""} onChange={e => set("receivedHours", Number(e.target.value))} />
            </FieldRow>

          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t bg-muted/30 flex flex-row gap-3 justify-end">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Plus className="w-4 h-4" />
            {saving ? "Creating…" : "Create Project"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function Projects() {
  const { projects, deleteProject } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const STATUS_ORDER: ProjectStatus[] = ["Active", "Completed", "On Hold", "Planning", "Quotation Sent"];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all field surveying and mapping projects</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0 gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Projects by Status</h2>
        </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {STATUS_ORDER.map((status) => {
            const items = projects.filter((p) => p.status === status);
            return (
              <Card key={status} className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{status}</CardTitle>
                  <span className="text-sm font-semibold">{items.length}</span>
                </CardHeader>
                <CardContent>
                  {items.length > 0 ? (
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {items.map((project) => (
                        <li key={project.id}>
                          <div className="flex items-center justify-between gap-2">
                            <Link href={`/projects/${project.id}`} className="font-medium hover:underline truncate block flex-1">
                              {project.name}
                            </Link>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => setConfirmDelete(project.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <span className="text-[11px] text-muted-foreground block mb-1">{project.projectManager}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="h-1.5 flex-1" />
                            <span className="text-xs font-semibold tabular-nums w-8 text-right">{project.progress}%</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No projects in this status.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AddProjectSheet open={addOpen} onClose={() => setAddOpen(false)} />

      <Dialog open={confirmDelete !== null} onOpenChange={(v) => { if (!v) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (confirmDelete) { deleteProject(confirmDelete); setConfirmDelete(null); }
            }}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
