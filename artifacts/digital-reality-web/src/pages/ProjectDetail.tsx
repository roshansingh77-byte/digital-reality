import { useApp } from "@/context/AppContext";
import type { StageProgress, Project, ProjectStatus, FieldWorkStage, FieldWorkStageName, ProcessingStageName, ModellingDailyEntry, Document as ProjectDocument } from "@/context/AppContext";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Briefcase, FileText, User as UserIcon, ActivitySquare, Receipt, AlertCircle, Download, Layers, Box, CheckCircle2, Circle, CalendarDays, Clock, Building2, Hash, Pencil, Save, Trash2, Camera, Upload, FileIcon, ImageIcon, Compass, Crosshair, Plane, Radar, Plus, Info, ArrowLeft, Wrench } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadToProjectFolder } from "@/services/sheetsDataService";

const ACTIVITY_TYPES = [
  "Drone LiDAR Survey",
  "GNSS Control Survey",
  "Ground Truth Verification",
  "Topographic Survey",
  "Mobile Mapping",
  "UAV Photogrammetry",
  "Data Processing",
];

async function exportProjectPDF(
  project: ReturnType<typeof useApp>["projects"][0],
  activities: ReturnType<typeof useApp>["activities"],
  invoices: ReturnType<typeof useApp>["invoices"],
  expenses: ReturnType<typeof useApp>["expenses"],
  _advances: ReturnType<typeof useApp>["advances"]
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 0;

  const PRIMARY = [21, 101, 192] as [number, number, number];
  const GREY = [100, 100, 100] as [number, number, number];
  const LIGHT = [245, 247, 250] as [number, number, number];
  const WHITE = [255, 255, 255] as [number, number, number];
  const DARK = [30, 40, 55] as [number, number, number];

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 36, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Digital Reality", margin, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Project Management — Field Operations", margin, 20);

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, pageW - margin, 14, { align: "right" });
  doc.text(`Report ID: ${project.projectId}`, pageW - margin, 20, { align: "right" });

  y = 44;
  doc.setTextColor(...DARK);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(project.name, margin, y);

  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  doc.text(`${project.client}  ·  ${project.location}, ${project.state}  ·  ${project.projectId}`, margin, y);

  y += 4;
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);

  y += 8;
  const cardW = (pageW - margin * 2 - 9) / 4;
  const cards = [
    { label: "PO VALUE", value: formatCurrency(project.poValue) },
    { label: "START DATE", value: project.startDate || "TBD" },
    { label: "END DATE", value: project.endDate || "TBD" },
    { label: "PROJECT MANAGER", value: project.projectManager },
  ];
  cards.forEach((c, i) => {
    const x = margin + i * (cardW + 3);
    doc.setFillColor(...LIGHT);
    doc.roundedRect(x, y, cardW, 18, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.text(c.label, x + 4, y + 6);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(c.value, x + 4, y + 13, { maxWidth: cardW - 8 });
  });

  y += 26;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  doc.text(`STATUS: ${project.status.toUpperCase()}`, margin, y);
  doc.text(`PROGRESS: ${project.progress}%`, margin + 50, y);

  y += 3;
  doc.setDrawColor(220, 225, 235);
  doc.setFillColor(220, 225, 235);
  doc.roundedRect(margin, y, pageW - margin * 2, 4, 2, 2, "F");
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(margin, y, (pageW - margin * 2) * project.progress / 100, 4, 2, 2, "F");

  y += 12;

  const sectionHeader = (title: string) => {
    doc.setFillColor(...PRIMARY);
    doc.rect(margin, y, 3, 6, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(title, margin + 6, y + 5);
    y += 10;
  };

  sectionHeader("Field Activities");

  if (activities.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...GREY);
    doc.text("No field activities logged for this project.", margin, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Date", "Activity Type", "Location", "Area (sqkm)", "Equipment", "Progress", "Remarks"]],
      body: activities.map(a => {
        const completedCount = [a.fieldWork, a.processing, a.modelling, a.documentation].filter(s => s.completed).length;
        const pct = Math.round((completedCount / 4) * 100);
        return [
          a.date,
          a.activityType,
          a.location,
          `${a.fieldWork.areaSqKm} sqkm`,
          a.fieldWork.equipmentUsed.join(", "),
          `${pct}%`,
          a.fieldWork.remarks,
        ];
      }),
      headStyles: { fillColor: PRIMARY, textColor: WHITE, fontSize: 8, fontStyle: "bold", cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: 3 },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 34 },
        2: { cellWidth: 24 },
        3: { cellWidth: 20 },
        4: { cellWidth: 32 },
        5: { cellWidth: 18 },
        6: { cellWidth: "auto" },
      },
      tableLineColor: [220, 225, 235],
      tableLineWidth: 0.3,
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  sectionHeader("Invoices");

  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "Pending" || i.status === "Partial").reduce((s, i) => s + i.amount, 0);

  if (invoices.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...GREY);
    doc.text("No invoices raised yet.", margin, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Invoice #", "Description", "Date", "Amount", "Status"]],
      body: [
        ...invoices.map(i => [i.number, i.description, i.date, formatCurrency(i.amount), i.status]),
        ["", "TOTAL INVOICED", "", formatCurrency(totalInvoiced), ""],
      ],
      headStyles: { fillColor: PRIMARY, textColor: WHITE, fontSize: 8, fontStyle: "bold", cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: 3 },
      alternateRowStyles: { fillColor: LIGHT },
      didParseCell: (data: any) => {
        if (data.row.index === invoices.length) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [230, 238, 255];
        }
      },
      tableLineColor: [220, 225, 235],
      tableLineWidth: 0.3,
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    const summW = (pageW - margin * 2 - 6) / 3;
    const summItems = [
      { label: "Total Invoiced", value: formatCurrency(totalInvoiced) },
      { label: "Received", value: formatCurrency(totalPaid) },
      { label: "Pending", value: formatCurrency(totalPending) },
    ];
    summItems.forEach((s, i) => {
      const x = margin + i * (summW + 3);
      if (i === 2) {
        doc.setFillColor(255, 247, 235);
      } else {
        doc.setFillColor(...LIGHT);
      }
      doc.roundedRect(x, y, summW, 14, 2, 2, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GREY);
      doc.text(s.label.toUpperCase(), x + 4, y + 5);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      if (i === 2) {
        doc.setTextColor(180, 80, 0);
      } else {
        doc.setTextColor(...DARK);
      }
      doc.text(s.value, x + 4, y + 12);
    });
    y += 20;
  }

  sectionHeader("Field Expenses");

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  if (expenses.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...GREY);
    doc.text("No field expenses logged.", margin, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Date", "Type", "Paid By", "Location", "Remarks", "Amount"]],
      body: [
        ...expenses.map(e => [e.date, e.expenseType, e.paidBy, e.location, e.remarks, `₹${e.amount.toLocaleString("en-IN")}`]),
        ["", "", "", "", "TOTAL", `₹${totalExpenses.toLocaleString("en-IN")}`],
      ],
      headStyles: { fillColor: PRIMARY, textColor: WHITE, fontSize: 8, fontStyle: "bold", cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: 3 },
      alternateRowStyles: { fillColor: LIGHT },
      didParseCell: (data: any) => {
        if (data.row.index === expenses.length) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [230, 238, 255];
        }
      },
      tableLineColor: [220, 225, 235],
      tableLineWidth: 0.3,
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, ph - 12, pageW - margin, ph - 12);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.text("Digital Reality — Confidential Project Report", margin, ph - 7);
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, ph - 7, { align: "right" });
  }

  doc.save(`${project.projectId}_${project.name.replace(/\s+/g, "_")}_Report.pdf`);
}



// ── Inline Edit Name ────────────────────────────────────────────────────────

function InlineEditName({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className="text-2xl sm:text-3xl font-bold tracking-tight bg-transparent border-b-2 border-primary outline-none w-full min-w-[160px] max-w-[500px] leading-tight"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-2 text-left"
      title="Click to edit project name"
    >
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight group-hover:text-primary transition-colors">
        {value}
      </h1>
      <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

// ── Edit Project Sheet ──────────────────────────────────────────────────────

const PROJECT_STATUSES: ProjectStatus[] = ["Active", "Completed", "On Hold", "Planning", "Quotation Sent"];

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-center gap-3">
      <Label className="text-xs text-muted-foreground text-right leading-tight">{label}</Label>
      {children}
    </div>
  );
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

function EditProjectSheet({
  project,
  open,
  onClose,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
}) {
  const { updateProject } = useApp();
  const [form, setForm] = useState<Project>(project);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(project); }, [project]);

  const set = (key: keyof Project, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const num = (key: keyof Project) => (form[key] as number | undefined) ?? 0;
  const str = (key: keyof Project) => (form[key] as string | undefined) ?? "";

  const handleSave = () => {
    setSaving(true);
    updateProject(project.id, form);
    setTimeout(() => { setSaving(false); onClose(); }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Edit Project
          </SheetTitle>
          <SheetDescription className="text-xs">{project.projectId} — {project.name}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* Core Info */}
            <SectionHead icon={Briefcase} title="Core Information" />
            <FieldRow label="Project Name">
              <Input value={str("name")} onChange={e => set("name", e.target.value)} />
            </FieldRow>
            <FieldRow label="Client">
              <Input value={str("client")} onChange={e => set("client", e.target.value)} />
            </FieldRow>
            <FieldRow label="Location">
              <Input value={str("location")} onChange={e => set("location", e.target.value)} />
            </FieldRow>
            <FieldRow label="State">
              <Input value={str("state")} onChange={e => set("state", e.target.value)} className="max-w-[80px]" />
            </FieldRow>
            <FieldRow label="Status">
              <Select value={str("status")} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Project Manager">
              <Input value={str("projectManager")} onChange={e => set("projectManager", e.target.value)} />
            </FieldRow>
            <FieldRow label="PO Value (₹)">
              <Input type="number" value={num("poValue")} onChange={e => set("poValue", Number(e.target.value))} />
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

            {/* Client Codes */}
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

            {/* Project Codes */}
            <SectionHead icon={Hash} title="Project Codes" />
            <FieldRow label="Clove Project Code">
              <Input value={str("cloveProjectCode")} onChange={e => set("cloveProjectCode", e.target.value)} />
            </FieldRow>
            <FieldRow label="Client Project Code">
              <Input value={str("clientProjectCode")} onChange={e => set("clientProjectCode", e.target.value)} />
            </FieldRow>
            <FieldRow label="Area (Sq Km)">
              <Input type="number" step="0.1" value={num("areaSqKm")} onChange={e => set("areaSqKm", Number(e.target.value))} />
            </FieldRow>
            <FieldRow label="Resolution">
              <Input placeholder="e.g. 5 cm" value={str("resolution")} onChange={e => set("resolution", e.target.value)} />
            </FieldRow>

            {/* Key Dates */}
            <SectionHead icon={CalendarDays} title="Key Dates" />
            {([
              ["enquiryDate", "Enquiry Date"],
              ["estimatedDate", "Estimated Date"],
              ["orderedDate", "Ordered Date"],
              ["inputReceivableDate", "Input Receivable Date"],
              ["proposedDate", "Proposed Date"],
              ["deliveredDate", "Delivered Date"],
            ] as [keyof Project, string][]).map(([key, label]) => (
              <FieldRow key={key} label={label}>
                <Input type="date" value={dateToInput(str(key))} onChange={e => set(key, dateFromInput(e.target.value))} />
              </FieldRow>
            ))}

            {/* Hours */}
            <SectionHead icon={Clock} title="Hours" />
            <FieldRow label="Quoted Hours">
              <Input type="number" value={num("quotedHours")} onChange={e => set("quotedHours", Number(e.target.value))} />
            </FieldRow>
            <FieldRow label="Order Hours">
              <Input type="number" value={num("orderHours")} onChange={e => set("orderHours", Number(e.target.value))} />
            </FieldRow>
            <FieldRow label="Received Hours">
              <Input type="number" value={num("receivedHours")} onChange={e => set("receivedHours", Number(e.target.value))} />
            </FieldRow>

          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t bg-muted/30 flex flex-row gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ── Pipeline Tracker ────────────────────────────────────────────────────────

const PROCESSING_STAGES: { key: ProcessingStageName; shortLabel: string; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { key: "production", shortLabel: "Production", label: "Production", desc: "Initial data processing and output generation", icon: Layers, color: "text-blue-600" },
  { key: "qc", shortLabel: "QC", label: "QC — Quality Control", desc: "Verify outputs meet accuracy and completeness standards.", icon: CheckCircle2, color: "text-indigo-600" },
  { key: "qa", shortLabel: "QA", label: "QA — Quality Assurance", desc: "Independent audit against project specifications.", icon: Crosshair, color: "text-violet-600" },
  { key: "delivery", shortLabel: "Delivery", label: "Delivery", desc: "Final packaged outputs handed over to client.", icon: FileText, color: "text-green-600" },
];

function PipelineTracker({
  pipeline,
  stages,
  onToggle,
  onDetailsChange,
  accentClass,
  icon: Icon,
}: {
  pipeline: "processing" | "modelling";
  stages: StageProgress;
  onToggle: (stage: ProcessingStageName, checked: boolean) => void;
  onDetailsChange: (stage: ProcessingStageName, details: Partial<FieldWorkStage>) => void;
  accentClass: string;
  icon: React.ElementType;
}) {
  const keys: ProcessingStageName[] = ["production", "qc", "qa", "delivery"];
  const done = keys.filter((k) => stages[k]?.completed).length;
  const pct = Math.round((done / 4) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${accentClass}`} />
          <span className="text-sm font-semibold">{done}/4 stages complete</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <Progress value={pct} className="h-2 flex-1" />
          <span className={`text-sm font-bold tabular-nums ${accentClass}`}>{pct}%</span>
        </div>
      </div>

      <div className="grid gap-3">
        {keys.map((stage, i) => {
          const meta = PROCESSING_STAGES.find((s) => s.key === stage)!;
          const st = stages[stage] ?? { completed: false };
          const prevDone = i === 0 || (stages[keys[i - 1]]?.completed ?? false);

          return (
            <div
              key={stage}
              className={`rounded-lg border p-4 space-y-3 ${
                st.completed ? "bg-green-50 border-green-200" : prevDone ? "bg-muted/20" : "bg-muted/10 border-muted opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  id={`${pipeline}-${stage}`}
                  checked={st.completed}
                  disabled={!prevDone && !st.completed}
                  onCheckedChange={(v) => onToggle(stage, !!v)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`${pipeline}-${stage}`}
                    className={`text-sm font-semibold cursor-pointer select-none flex items-center gap-2 ${st.completed ? meta.color : "text-foreground"}`}
                  >
                    {st.completed ? <CheckCircle2 className={`w-4 h-4 ${meta.color}`} /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                    {meta.label}
                    {!prevDone && !st.completed && <Badge variant="outline" className="text-[10px] font-normal ml-1">Locked</Badge>}
                  </label>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <meta.icon className={`w-3.5 h-3.5 ${st.completed ? meta.color : "text-muted-foreground"}`} />
                    <p className="text-xs text-muted-foreground">{meta.desc}</p>
                  </div>
                </div>
                {st.completed && (
                  <Badge className={`shrink-0 ${meta.color} bg-transparent border border-green-300`}>Done</Badge>
                )}
              </div>

              {st.completed && (
                <div className="ml-9 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100/50 px-3 py-2 rounded-md">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {pipeline === "processing" ? "Processing" : "Modelling"} — {stage === "production" ? "Production" : stage === "qc" ? "QC" : stage === "qa" ? "QA" : "Delivery"} is completed on {st.date ? formatDDMMYYYY(st.date) : "—"} at {st.time ?? "—"}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <Input
                        type="date"
                        value={st.date ? st.date.split(" ").reverse().join("-") : ""}
                        onChange={(e) => {
                          const d = e.target.value;
                          if (d) {
                            const parts = d.split("-");
                            const formatted = `${parts[2]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(parts[1])-1]} ${parts[0]}`;
                            onDetailsChange(stage, { date: formatted, time: st.time });
                          }
                        }}
                        className="w-full h-8 text-xs"
                      />
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        ({st.date ? formatDDMMYYYY(st.date) : "dd/mm/yyyy"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <Input
                        type="time"
                        value={st.time ?? ""}
                        onChange={(e) => onDetailsChange(stage, { time: e.target.value })}
                        className="w-full h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <LocationPicker
                      value={st.location ?? ""}
                      onChange={(v) => onDetailsChange(stage, { location: v })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Area (sq km)"
                      value={st.areaSqKm ?? ""}
                      onChange={(e) => onDetailsChange(stage, { areaSqKm: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full h-8 text-xs max-w-[140px]"
                    />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">sq km</span>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Linear km"
                      value={st.linearKm ?? ""}
                      onChange={(e) => onDetailsChange(stage, { linearKm: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full h-8 text-xs max-w-[140px]"
                    />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">km</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

const FIELD_WORK_STAGES: { key: FieldWorkStageName; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { key: "recce", label: "Recce", desc: "Site reconnaissance and pre-survey inspection", icon: MapPin, color: "text-blue-600" },
  { key: "dgps", label: "DGPS", desc: "Differential GPS control survey and ground control points", icon: Compass, color: "text-emerald-600" },
  { key: "totalStation", label: "Total Station", desc: "Total station traversing, detailing, and verification", icon: Crosshair, color: "text-orange-600" },
  { key: "scanning", label: "Scanning", desc: "LiDAR, drone, and 3D laser scan operations", icon: Layers, color: "text-violet-600" },
  { key: "instrumentation", label: "Instrumentation", desc: "Sensor deployment, GNSS monitoring, and instrumentation on railway project", icon: ActivitySquare, color: "text-rose-600" },
  { key: "uav", label: "UAV", desc: "Drone aerial survey and photogrammetry", icon: Plane, color: "text-cyan-600" },
  { key: "gpr", label: "GPR", desc: "Ground penetrating radar survey for subsurface utility detection", icon: Radar, color: "text-yellow-600" },
];

function formatDDMMYYYY(dateStr: string) {
  const months: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
  const parts = dateStr.split(" ");
  if (parts.length === 3 && months[parts[1]]) {
    return `${parts[0]}/${months[parts[1]]}/${parts[2]}`;
  }
  return dateStr;
}

function formatActivityDateForInput(dateStr: string) {
  const months: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
  const parts = dateStr.split(" ");
  if (parts.length === 3 && months[parts[1]]) {
    return `${parts[2]}-${months[parts[1]]}-${parts[0].padStart(2, "0")}`;
  }
  return dateStr;
}

function formatActivityDateFromInput(value: string) {
  const months: Record<string, string> = { "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec" };
  const parts = value.split("-");
  if (parts.length === 3 && months[parts[1]]) {
    return `${parts[2]} ${months[parts[1]]} ${parts[0]}`;
  }
  return value;
}

function LocationPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
        if (data?.display_name) {
          onChange(data.display_name.split(",")[0].trim());
        }
      } catch {}
      setMapSrc(`https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01}%2C${lat-0.01}%2C${lon+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lon}`);
      setShowMap(true);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Location"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 text-xs"
        />
        <Button variant="outline" size="sm" className="h-8 text-xs shrink-0 gap-1" onClick={handleSearch} disabled={searching}>
          {searching ? "…" : "Search"}
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs shrink-0 gap-1" onClick={handleAutoDetect} title="Auto-detect location">
          <Crosshair className="w-3 h-3" />
          Detect
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-xs shrink-0" onClick={() => setShowMap(v => !v)}>
          {showMap ? "Hide Map" : "Map"}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search location…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-8 text-xs"
        />
      </div>
      {showMap && (
        <div className="rounded-lg overflow-hidden border">
          <iframe
            title="OpenStreetMap"
            src={mapSrc}
            width="100%"
            height="300"
            style={{ border: 0, display: "block" }}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}



function ProjectDocumentCard({ doc, onUpdate, onDelete, formatFileSize }: { doc: ProjectDocument; onUpdate: (id: string, updates: Partial<ProjectDocument>) => void; onDelete: (id: string) => void; formatFileSize: (b: number) => string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(doc.name);

  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="p-0">
        {doc.mimeType.startsWith("image/") ? (
          <div className="relative aspect-video bg-muted">
            <img src={doc.data} alt={doc.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex items-center justify-center aspect-video bg-muted/50">
            <FileIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="flex items-center gap-1">
                  <Input value={draft} onChange={e => setDraft(e.target.value)} className="h-7 text-sm" />
                  <Button size="sm" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => { onUpdate(doc.id, { name: draft }); setEditing(false); }}>
                    <Save className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm font-medium truncate">{doc.name}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(doc.size)}</p>
            </div>
            <div className="flex items-center shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setEditing(true); setDraft(doc.name); }}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(doc.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {doc.mimeType.startsWith("image/") && (
            <div className="mt-2">
              <Button variant="secondary" size="sm" className="w-full gap-2" onClick={() => window.open(doc.data, "_blank")}>
                <ImageIcon className="w-3.5 h-3.5" />
                Preview
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const id = params?.id;
  const { projects, activities, invoices, expenses, advances, documents, pipelines, modellingDailyEntries, equipment, updateProject, updateActivity, addActivity, addDocument, updateDocument, deleteDocument, setPipelineStageDetails, togglePipelineStage, toggleFieldWorkStage, setFieldWorkStageDateTime, setFieldWorkStageDetails, addExpense, addInvoice, addAdvance, updateAdvance, deleteAdvance, addModellingDailyEntry, updateModellingDailyEntry, deleteModellingDailyEntry } = useApp();
  const [exporting, setExporting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [fieldWorkSub, setFieldWorkSub] = useState("recce");
  const [processingSub, setProcessingSub] = useState("production");
  const [modellingSub, setModellingSub] = useState("production");
  const [modellingDailyOpen, setModellingDailyOpen] = useState(false);
  const [editingDailyId, setEditingDailyId] = useState<string | null>(null);
  const [dailyForm, setDailyForm] = useState({ personName: "", startDate: "", endDate: "", startTime: "", endTime: "", process: "production" as ModellingDailyEntry["process"], status: "In Progress", ipComp: "" });
  const [billingSub, setBillingSub] = useState("advance");
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [activityEditOpen, setActivityEditOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState({ activityType: "", date: "", location: "", areaCovered: "", progress: "", remarks: "", equipmentUsed: "" });
  const [enquirySaving, setEnquirySaving] = useState(false);
  const [logActivityType, setLogActivityType] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logLocation, setLogLocation] = useState("");
  const [logLat, setLogLat] = useState("");
  const [logLng, setLogLng] = useState("");
  const [logArea, setLogArea] = useState("");
  const [logSelectedEq, setLogSelectedEq] = useState<string[]>([]);
  const [logRemarks, setLogRemarks] = useState("");
  const { toast } = useToast();

  const project = projects.find(p => p.id === id);
  const projectActivities = activities.filter(a => a.projectId === id);
  const editingActivity = projectActivities.find((activity) => activity.id === editingActivityId);
  const projectModellingDaily = modellingDailyEntries[id ?? ""] ?? [];

  const calcHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
  };

  const resetActivityForm = () => {
    setActivityForm({ activityType: "", date: "", location: "", areaCovered: "", progress: "", remarks: "", equipmentUsed: "" });
    setEditingActivityId(null);
  };

  const openActivityEditor = (activity: typeof projectActivities[number]) => {
    setEditingActivityId(activity.id);
    setActivityForm({
      activityType: activity.activityType,
      date: activity.date,
      location: activity.location,
      areaCovered: String(activity.fieldWork.areaSqKm),
      progress: String(calcActivityProgress(activity)),
      remarks: activity.fieldWork.remarks,
      equipmentUsed: activity.fieldWork.equipmentUsed.join(", "),
    });
    setActivityEditOpen(true);
  };

  const calcActivityProgress = (activity: typeof projectActivities[number]): number => {
    const sections = [activity.fieldWork, activity.processing, activity.modelling, activity.documentation];
    const completed = sections.filter(s => s.completed).length;
    return Math.round((completed / 4) * 100);
  };

  const saveActivityEdits = () => {
    if (!editingActivityId) return;
    updateActivity(editingActivityId, {
      activityType: activityForm.activityType,
      date: activityForm.date,
      location: activityForm.location,
      fieldWork: {
        ...editingActivity!.fieldWork,
        areaSqKm: Number(activityForm.areaCovered) || 0,
        remarks: activityForm.remarks,
        equipmentUsed: activityForm.equipmentUsed.split(",").map((item) => item.trim()).filter(Boolean),
      },
    });
    setActivityEditOpen(false);
    resetActivityForm();
  };

  const handleLogActivity = () => {
    if (!id || !logActivityType || !logDate || !logLocation) return;
    const eqNames = equipment.filter(eq => logSelectedEq.includes(eq.id)).map(eq => eq.name);
    const aid = `a${Date.now()}`;
    addActivity({
      id: aid,
      projectId: id,
      activityType: logActivityType,
      date: logDate,
      location: logLocation,
      lat: parseFloat(logLat) || 0,
      lng: parseFloat(logLng) || 0,
      fieldWork: {
        id: `fw-${aid}`,
        date: logDate,
        time: "",
        location: logLocation,
        lat: parseFloat(logLat) || 0,
        lng: parseFloat(logLng) || 0,
        areaSqKm: parseFloat(logArea) || 0,
        linearKm: 0,
        equipmentUsed: eqNames,
        remarks: logRemarks,
        completed: true,
      },
      processing: { id: `proc-${aid}`, softwareUsed: "", inputFiles: "", outputFiles: "", processingStatus: "Pending", remarks: "", completed: false },
      modelling: { id: `mod-${aid}`, modelType: "", softwareUsed: "", modelFile: "", remarks: "", completed: false },
      documentation: { id: `doc-${aid}`, reportUpload: "", pdfUpload: [], documentVersion: "", remarks: "", completed: false },
    });
    toast({ title: "Activity logged", description: "Field activity has been successfully recorded." });
    setLogActivityType(""); setLogDate(new Date().toISOString().split('T')[0]); setLogLocation(""); setLogLat(""); setLogLng(""); setLogArea(""); setLogSelectedEq([]); setLogRemarks("");
  };

  const resetDailyForm = () => setDailyForm({ personName: "", startDate: "", endDate: "", startTime: "", endTime: "", process: "production", status: "In Progress", ipComp: "" });

  const handleSaveDaily = () => {
    if (!dailyForm.personName || !dailyForm.startDate || !dailyForm.endDate || !dailyForm.startTime || !dailyForm.endTime) return;
    const totalHours = calcHours(dailyForm.startTime, dailyForm.endTime);
    if (editingDailyId) {
      updateModellingDailyEntry(editingDailyId, { ...dailyForm, totalHours });
      setEditingDailyId(null);
    } else {
      addModellingDailyEntry({ id: crypto.randomUUID(), projectId: id ?? "", ...dailyForm, totalHours });
    }
    resetDailyForm();
    setModellingDailyOpen(false);
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      addDocument({
        id: crypto.randomUUID(),
        projectId: id ?? "",
        name: file.name,
        mimeType: file.type,
        size: file.size,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
        category: "document",
      });
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(file);
    };
    input.click();
  };

  const handleDriveUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          const driveFile = await uploadToProjectFolder(file, project?.name || "General", "document");
          addDocument({
            id: crypto.randomUUID(),
            projectId: id ?? "",
            name: file.name,
            mimeType: file.type,
            size: file.size,
            data: driveFile.webViewLink || "",
            uploadedAt: new Date().toISOString(),
            category: "document",
            driveFileId: driveFile.id,
            driveWebViewLink: driveFile.webViewLink,
          });
        }
      } catch (err) {
        console.error("Failed to upload to Drive:", err);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (!project) {
    return <div className="p-8 text-center text-muted-foreground">Project not found</div>;
  }

  const projectDocuments = documents.filter((d) => d.projectId === id && (!d.category || d.category === "document"));

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportProjectPDF(project, projectActivities, invoices.filter(i => i.projectId === id), expenses.filter(e => e.projectId === id), advances.filter(a => a.projectId === id));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
            <InlineEditName
              value={project.name}
              onSave={(name) => updateProject(project.id, { name })}
            />
            <StatusBadge status={project.status} className="text-sm" />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium bg-muted px-2 py-0.5 rounded text-foreground">{project.projectId}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 shrink-0" /> {project.client}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" /> {project.location}, {project.state}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-52 space-y-1.5">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="font-medium">Progress</span>
              <span className="font-bold">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2 sm:h-2.5" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="flex-1 sm:flex-none gap-2">
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
            <Button size="sm" onClick={handleExport} disabled={exporting} className="flex-1 sm:flex-none gap-2">
              <Download className="w-4 h-4" />
              {exporting ? "..." : "PDF"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">PO Value</p>
              <p className="font-bold text-lg">{formatCurrency(project.poValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-full">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Timeline</p>
              <p className="font-bold text-sm">{project.startDate || 'TBD'} <br/><span className="text-xs font-normal text-muted-foreground">to {project.endDate || 'TBD'}</span></p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-full">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Project Manager</p>
              <p className="font-bold">{project.projectManager}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-600">
              <ActivitySquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Field Activities</p>
              <p className="font-bold text-lg">{projectActivities.length} Logged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditProjectSheet project={project} open={editOpen} onClose={() => setEditOpen(false)} />

      <Dialog open={activityEditOpen} onOpenChange={(open) => {
        if (!open) {
          setActivityEditOpen(false);
          resetActivityForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Field Activity</DialogTitle>
            <DialogDescription>Update details for this logged field activity.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="activity-type">Activity Type</Label>
              <Input
                id="activity-type"
                value={activityForm.activityType}
                onChange={(e) => setActivityForm((prev) => ({ ...prev, activityType: e.target.value }))}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="activity-date">Date</Label>
                <Input
                  id="activity-date"
                  type="date"
                  value={formatActivityDateForInput(activityForm.date)}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, date: formatActivityDateFromInput(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="activity-location">Location</Label>
                <Input
                  id="activity-location"
                  value={activityForm.location}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="activity-area">Area Covered</Label>
                <Input
                  id="activity-area"
                  type="number"
                  step="0.1"
                  value={activityForm.areaCovered}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, areaCovered: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="activity-progress">Progress</Label>
                <Input
                  id="activity-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={activityForm.progress}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, progress: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="activity-equipment">Equipment</Label>
                <Input
                  id="activity-equipment"
                  value={activityForm.equipmentUsed}
                  onChange={(e) => setActivityForm((prev) => ({ ...prev, equipmentUsed: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activity-remarks">Remarks</Label>
              <Input
                id="activity-remarks"
                value={activityForm.remarks}
                onChange={(e) => setActivityForm((prev) => ({ ...prev, remarks: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setActivityEditOpen(false); resetActivityForm(); }}>
              Cancel
            </Button>
            <Button onClick={saveActivityEdits}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="log-activity" className="mt-8">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6 overflow-x-auto">
          <TabsTrigger value="enquiry" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 whitespace-nowrap">Enquiry</TabsTrigger>
          <TabsTrigger value="log-activity" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 whitespace-nowrap">Log Activity</TabsTrigger>
          <TabsTrigger value="field-work" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 whitespace-nowrap">Field Work</TabsTrigger>
          <TabsTrigger value="processing" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 whitespace-nowrap">Processing</TabsTrigger>
          <TabsTrigger value="modelling" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 whitespace-nowrap">Modelling</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 whitespace-nowrap">Documents</TabsTrigger>
        </TabsList>

        {/* ── ENQUIRY ── */}
        <TabsContent value="enquiry" className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Enquiry Information</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Client codes, project codes, hours summary, and key dates.</p>
            </div>
            <Button size="sm" onClick={() => { updateProject(project.id, {}); setEnquirySaving(true); setTimeout(() => setEnquirySaving(false), 300); }} disabled={enquirySaving} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              {enquirySaving ? "Saving..." : "Save"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Client Codes */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client Codes</span>
                </div>
                <div className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Client Group Code</Label>
                    <Input className="h-8 text-xs" value={project.clientGroupCode ?? ""} onChange={(e) => updateProject(project.id, { clientGroupCode: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Client Code</Label>
                    <Input className="h-8 text-xs" value={project.clientCode ?? ""} onChange={(e) => updateProject(project.id, { clientCode: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Client 3 Code</Label>
                    <Input className="h-8 text-xs" value={project.client3Code ?? ""} onChange={(e) => updateProject(project.id, { client3Code: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Bid / Quote</Label>
                    <Select value={project.bidQuote ?? "Quote"} onValueChange={(v) => updateProject(project.id, { bidQuote: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bid">Bid</SelectItem>
                        <SelectItem value="Quote">Quote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Codes */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Codes</span>
                </div>
                <div className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Clove Project Code</Label>
                    <Input className="h-8 text-xs" value={project.cloveProjectCode ?? ""} onChange={(e) => updateProject(project.id, { cloveProjectCode: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Client Project Code</Label>
                    <Input className="h-8 text-xs" value={project.clientProjectCode ?? ""} onChange={(e) => updateProject(project.id, { clientProjectCode: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Area (Sq Km)</Label>
                    <Input className="h-8 text-xs" type="number" step="0.1" value={project.areaSqKm ?? ""} onChange={(e) => updateProject(project.id, { areaSqKm: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Resolution</Label>
                    <Input className="h-8 text-xs" value={project.resolution ?? ""} onChange={(e) => updateProject(project.id, { resolution: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hours Summary */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hours Summary</span>
                </div>
                <div className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Quoted Hours</Label>
                    <Input className="h-8 text-xs" type="number" value={project.quotedHours ?? ""} onChange={(e) => updateProject(project.id, { quotedHours: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Order Hours</Label>
                    <Input className="h-8 text-xs" type="number" value={project.orderHours ?? ""} onChange={(e) => updateProject(project.id, { orderHours: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Received Hours</Label>
                    <Input className="h-8 text-xs" type="number" value={project.receivedHours ?? ""} onChange={(e) => updateProject(project.id, { receivedHours: Number(e.target.value) || 0 })} />
                  </div>
                  {project.quotedHours != null && project.quotedHours > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Hours utilisation</span>
                        <span className="font-medium">{Math.round(((project.receivedHours ?? 0) / project.quotedHours) * 100)}%</span>
                      </div>
                      <Progress value={Math.round(((project.receivedHours ?? 0) / project.quotedHours) * 100)} className="h-1.5" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Dates */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Dates</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {([
                  ["enquiryDate", "Enquiry"],
                  ["estimatedDate", "Estimated"],
                  ["orderedDate", "Ordered"],
                  ["inputReceivableDate", "Input Receivable"],
                  ["proposedDate", "Proposed"],
                  ["deliveredDate", "Delivered"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground">{label}</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={dateToInput(project[key] ?? "")}
                      onChange={(e) => updateProject(project.id, { [key]: dateFromInput(e.target.value) } as Partial<Project>)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LOG ACTIVITY ── */}
        <TabsContent value="log-activity" className="pt-6 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div>
              <h3 className="text-lg font-semibold">Log Field Activity</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Record a new activity with workflow sections for {project.name}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardContent className="p-5 space-y-6">
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b mb-4">
                    <ActivitySquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity Details</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Project *</Label>
                      <Select value={id ?? ""} disabled>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={id ?? ""}>{project.name}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Activity Type *</Label>
                      <Select value={logActivityType} onValueChange={setLogActivityType}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select activity type" /></SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_TYPES.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Date *</Label>
                      <Input className="h-8 text-xs" type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Location Name *</Label>
                      <Input className="h-8 text-xs" placeholder="e.g., Kagaznagar" value={logLocation} onChange={e => setLogLocation(e.target.value)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coordinates & Area</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Latitude</Label>
                    <Input className="h-8 text-xs" type="number" step="any" placeholder="16.7563" value={logLat} onChange={e => setLogLat(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Longitude</Label>
                    <Input className="h-8 text-xs" type="number" step="any" placeholder="80.4356" value={logLng} onChange={e => setLogLng(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Area Covered (sqkm)</Label>
                  <Input className="h-8 text-xs" type="number" step="any" placeholder="12.5" value={logArea} onChange={e => setLogArea(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equipment & Remarks</span>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Equipment Used</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-3 bg-muted/20 max-h-[200px] overflow-y-auto">
                    {equipment.map(eq => (
                      <div key={eq.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`log-eq-${eq.id}`}
                          checked={logSelectedEq.includes(eq.id)}
                          onCheckedChange={() => {
                            if (logSelectedEq.includes(eq.id)) {
                              setLogSelectedEq(logSelectedEq.filter(e => e !== eq.id));
                            } else {
                              setLogSelectedEq([...logSelectedEq, eq.id]);
                            }
                          }}
                        />
                        <label htmlFor={`log-eq-${eq.id}`} className="text-xs leading-tight truncate cursor-pointer" title={`${eq.name} (${eq.type})`}>
                          {eq.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Field Remarks</Label>
                  <Textarea className="text-xs min-h-[80px]" placeholder="Weather conditions, issues faced, next steps..." value={logRemarks} onChange={e => setLogRemarks(e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setLogActivityType(""); setLogDate(new Date().toISOString().split('T')[0]); setLogLocation(""); setLogLat(""); setLogLng(""); setLogArea(""); setLogSelectedEq([]); setLogRemarks(""); }}>
              Cancel
            </Button>
            <Button size="sm" className="gap-1.5" onClick={handleLogActivity}>
              <Save className="w-3.5 h-3.5" />
              Save Activity
            </Button>
          </div>
        </TabsContent>

        {/* ── FIELD WORK ── */}
        <TabsContent value="field-work" className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Field Work</h3>
            <Select value={fieldWorkSub} onValueChange={setFieldWorkSub}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_WORK_STAGES.map(s => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {FIELD_WORK_STAGES.map((meta) => {
            if (meta.key !== fieldWorkSub) return null;
            const fw = (pipelines[id ?? ""]?.fieldWork ?? {})[meta.key] ?? { completed: false };
            const stageIndex = FIELD_WORK_STAGES.findIndex(s => s.key === meta.key);
            const prevDone = stageIndex === 0 || (FIELD_WORK_STAGES[stageIndex - 1] && (pipelines[id ?? ""]?.fieldWork?.[FIELD_WORK_STAGES[stageIndex - 1].key]?.completed ?? false));

            return (
              <div key={meta.key} className="space-y-4">
                <div className={`rounded-lg border p-5 space-y-4 ${
                  fw.completed ? "bg-green-50 border-green-200" : prevDone ? "bg-muted/20" : "bg-muted/10 border-muted opacity-60"
                }`}>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      id={`fw-${meta.key}`}
                      checked={fw.completed}
                      disabled={!prevDone && !fw.completed}
                      onCheckedChange={(v) => toggleFieldWorkStage(id ?? "", meta.key, !!v)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`fw-${meta.key}`}
                        className={`text-sm font-semibold cursor-pointer select-none flex items-center gap-2 ${fw.completed ? meta.color : "text-foreground"}`}
                      >
                        {fw.completed ? <CheckCircle2 className={`w-4 h-4 ${meta.color}`} /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                        {meta.label}
                        {!prevDone && !fw.completed && <Badge variant="outline" className="text-[10px] font-normal ml-1">Locked</Badge>}
                      </label>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <meta.icon className={`w-3.5 h-3.5 ${fw.completed ? meta.color : "text-muted-foreground"}`} />
                        <p className="text-xs text-muted-foreground">{meta.desc}</p>
                      </div>
                    </div>
                    {fw.completed && (
                      <Badge className={`shrink-0 ${meta.color} bg-transparent border ${fw.completed ? "border-green-300" : ""}`}>Done</Badge>
                    )}
                  </div>

                  {fw.completed && (
                    <div className="ml-9 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100/50 px-3 py-2 rounded-md">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {project.name} — {meta.label} is completed on {fw.date ? formatDDMMYYYY(fw.date) : "—"} at {fw.time ?? "—"}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <Input
                            type="date"
                            value={fw.date ? fw.date.split(" ").reverse().join("-") : ""}
                            onChange={(e) => {
                              const d = e.target.value;
                              if (d) {
                                const parts = d.split("-");
                                const formatted = `${parts[2]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(parts[1])-1]} ${parts[0]}`;
                                setFieldWorkStageDateTime(id ?? "", meta.key, formatted, fw.time ?? "");
                              }
                            }}
                            className="w-full h-8 text-xs"
                          />
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            ({fw.date ? formatDDMMYYYY(fw.date) : "dd/mm/yyyy"})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <Input
                            type="time"
                            value={fw.time ?? ""}
                            onChange={(e) => setFieldWorkStageDateTime(id ?? "", meta.key, fw.date ?? "", e.target.value)}
                            className="w-full h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <LocationPicker
                          value={fw.location ?? ""}
                          onChange={(v) => setFieldWorkStageDetails(id ?? "", meta.key, { location: v })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Area (sq km)"
                          value={fw.areaSqKm ?? ""}
                          onChange={(e) => setFieldWorkStageDetails(id ?? "", meta.key, { areaSqKm: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full h-8 text-xs max-w-[140px]"
                        />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">sq km</span>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Linear km"
                          value={fw.linearKm ?? ""}
                          onChange={(e) => setFieldWorkStageDetails(id ?? "", meta.key, { linearKm: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full h-8 text-xs max-w-[140px]"
                        />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">km</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}


        </TabsContent>

        {/* ── PROCESSING ── */}
        <TabsContent value="processing" className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Processing</h3>
            <Select value={processingSub} onValueChange={setProcessingSub}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {PROCESSING_STAGES.map(s => (
                  <SelectItem key={s.key} value={s.key}>{s.shortLabel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {PROCESSING_STAGES.map((meta) => {
            if (meta.key !== processingSub) return null;
            const st = (pipelines[id ?? ""]?.processing ?? {})[meta.key] ?? { completed: false };
            const stageIndex = PROCESSING_STAGES.findIndex(s => s.key === meta.key);
            const prevDone = stageIndex === 0 || (PROCESSING_STAGES[stageIndex - 1] && (pipelines[id ?? ""]?.processing?.[PROCESSING_STAGES[stageIndex - 1].key]?.completed ?? false));

            return (
              <div key={meta.key} className="space-y-4">
                <div className={`rounded-lg border p-5 space-y-4 ${
                  st.completed ? "bg-green-50 border-green-200" : prevDone ? "bg-muted/20" : "bg-muted/10 border-muted opacity-60"
                }`}>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      id={`proc-${meta.key}`}
                      checked={st.completed}
                      disabled={!prevDone && !st.completed}
                      onCheckedChange={(v) => togglePipelineStage(id ?? "", "processing", meta.key, !!v)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`proc-${meta.key}`}
                        className={`text-sm font-semibold cursor-pointer select-none flex items-center gap-2 ${st.completed ? meta.color : "text-foreground"}`}
                      >
                        {st.completed ? <CheckCircle2 className={`w-4 h-4 ${meta.color}`} /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                        {meta.label}
                        {!prevDone && !st.completed && <Badge variant="outline" className="text-[10px] font-normal ml-1">Locked</Badge>}
                      </label>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <meta.icon className={`w-3.5 h-3.5 ${st.completed ? meta.color : "text-muted-foreground"}`} />
                        <p className="text-xs text-muted-foreground">{meta.desc}</p>
                      </div>
                    </div>
                    {st.completed && (
                      <Badge className={`shrink-0 ${meta.color} bg-transparent border border-green-300`}>Done</Badge>
                    )}
                  </div>

                  {st.completed && (
                    <div className="ml-9 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-100/50 px-3 py-2 rounded-md">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Processing — {meta.shortLabel} is completed on {st.date ? formatDDMMYYYY(st.date) : "—"} at {st.time ?? "—"}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <Input
                            type="date"
                            value={st.date ? st.date.split(" ").reverse().join("-") : ""}
                            onChange={(e) => {
                              const d = e.target.value;
                              if (d) {
                                const parts = d.split("-");
                                const formatted = `${parts[2]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(parts[1])-1]} ${parts[0]}`;
                                setPipelineStageDetails(id ?? "", "processing", meta.key, { date: formatted, time: st.time });
                              }
                            }}
                            className="w-full h-8 text-xs"
                          />
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            ({st.date ? formatDDMMYYYY(st.date) : "dd/mm/yyyy"})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <Input
                            type="time"
                            value={st.time ?? ""}
                            onChange={(e) => setPipelineStageDetails(id ?? "", "processing", meta.key, { time: e.target.value })}
                            className="w-full h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <LocationPicker
                          value={st.location ?? ""}
                          onChange={(v) => setPipelineStageDetails(id ?? "", "processing", meta.key, { location: v })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Area (sq km)"
                          value={st.areaSqKm ?? ""}
                          onChange={(e) => setPipelineStageDetails(id ?? "", "processing", meta.key, { areaSqKm: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full h-8 text-xs max-w-[140px]"
                        />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">sq km</span>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Linear km"
                          value={st.linearKm ?? ""}
                          onChange={(e) => setPipelineStageDetails(id ?? "", "processing", meta.key, { linearKm: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full h-8 text-xs max-w-[140px]"
                        />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">km</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* ── MODELLING ── */}
        <TabsContent value="modelling" className="pt-6 space-y-6">
          {/* ── MODELLING DAILY TRACKING ── */}
          <div className="border-t pt-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" /> Daily Tracking
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">Log daily work entries for each process stage.</p>
              </div>
              <Button
                size="sm"
                onClick={() => { resetDailyForm(); setEditingDailyId(null); setModellingDailyOpen(true); }}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Entry
              </Button>
            </div>

            {projectModellingDaily.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                No daily entries logged yet. Click "Add Entry" to start tracking.
              </div>
            ) : (
              <>
                {/* ── SUMMARY REPORT ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* By Person */}
                  <Card>
                    <CardContent className="p-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <UserIcon className="w-3 h-3" /> By Person
                      </h5>
                      <div className="space-y-1">
                        {Object.entries(
                          projectModellingDaily.reduce<Record<string, number>>((acc, e) => {
                            acc[e.personName] = (acc[e.personName] ?? 0) + e.totalHours;
                            return acc;
                          }, {})
                        ).map(([name, hrs]) => (
                          <div key={name} className="flex justify-between text-xs">
                            <span>{name}</span>
                            <span className="font-mono font-medium">{hrs}h</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* By Process */}
                  <Card>
                    <CardContent className="p-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Layers className="w-3 h-3" /> By Process
                      </h5>
                      <div className="space-y-1">
                        {(["production", "qc", "qa", "delivery"] as const).map((proc) => {
                          const hrs = projectModellingDaily.filter((e) => e.process === proc).reduce((s, e) => s + e.totalHours, 0);
                          return (
                            <div key={proc} className="flex justify-between text-xs">
                              <span className={hrs === 0 ? "text-muted-foreground/50" : ""}>
                                {proc === "production" ? "Production" : proc === "qc" ? "QC" : proc === "qa" ? "QA" : "Delivery"}
                              </span>
                              <span className={`font-mono font-medium ${hrs === 0 ? "text-muted-foreground/50" : ""}`}>{hrs}h</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Grand Total */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3 flex flex-col justify-center h-full">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Grand Total</h5>
                      <p className="text-2xl font-bold font-mono text-primary">{projectModellingDaily.reduce((s, e) => s + e.totalHours, 0)}h</p>
                      <p className="text-[10px] text-muted-foreground">{projectModellingDaily.length} entries</p>
                    </CardContent>
                  </Card>
                </div>

                {/* ── DETAILED ENTRIES ── */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Person</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectModellingDaily.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.personName}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{entry.startDate}<br /><span className="text-muted-foreground">{entry.startTime}</span></TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{entry.endDate}<br /><span className="text-muted-foreground">{entry.endTime}</span></TableCell>
                          <TableCell className="text-right font-mono text-sm">{entry.totalHours}h</TableCell>
                          <TableCell>
                            <Select value={entry.status} onValueChange={(v) => updateModellingDailyEntry(entry.id, { status: v })}>
                              <SelectTrigger className="h-7 text-xs w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["In Progress", "Completed", "Pending", "On Hold"].map((s) => (
                                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                                onClick={() => {
                                  setEditingDailyId(entry.id);
                                  setDailyForm({ personName: entry.personName, startDate: entry.startDate, endDate: entry.endDate, startTime: entry.startTime, endTime: entry.endTime, process: entry.process, status: entry.status, ipComp: entry.ipComp });
                                  setModellingDailyOpen(true);
                                }}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteModellingDailyEntry(id ?? "", entry.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>

          {/* ── DAILY ENTRY DIALOG ── */}
          <Dialog open={modellingDailyOpen} onOpenChange={setModellingDailyOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingDailyId ? "Edit" : "Add"} Daily Entry</DialogTitle>
                <DialogDescription>Log modelling work for a person on a process stage.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Person Name</Label>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={dailyForm.personName}
                    onChange={(e) => setDailyForm({ ...dailyForm, personName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Process Stage</Label>
                  <Select value={dailyForm.process} onValueChange={(v) => setDailyForm({ ...dailyForm, process: v as ModellingDailyEntry["process"] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCESSING_STAGES.map(s => (
                        <SelectItem key={s.key} value={s.key}>{s.shortLabel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={dailyForm.startDate ? dailyForm.startDate.split(" ").reverse().join("-") : ""}
                      onChange={(e) => {
                        const d = e.target.value;
                        if (d) {
                          const parts = d.split("-");
                          setDailyForm({ ...dailyForm, startDate: `${parts[2]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(parts[1])-1]} ${parts[0]}` });
                        }
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={dailyForm.endDate ? dailyForm.endDate.split(" ").reverse().join("-") : ""}
                      onChange={(e) => {
                        const d = e.target.value;
                        if (d) {
                          const parts = d.split("-");
                          setDailyForm({ ...dailyForm, endDate: `${parts[2]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(parts[1])-1]} ${parts[0]}` });
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={dailyForm.startTime}
                      onChange={(e) => setDailyForm({ ...dailyForm, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={dailyForm.endTime}
                      onChange={(e) => setDailyForm({ ...dailyForm, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={dailyForm.status} onValueChange={(v) => setDailyForm({ ...dailyForm, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["In Progress", "Completed", "Pending", "On Hold"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {dailyForm.startTime && dailyForm.endTime && (
                  <div className="text-sm text-muted-foreground text-center">
                    Total Hours: <span className="font-mono font-bold text-foreground">{calcHours(dailyForm.startTime, dailyForm.endTime)}h</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setModellingDailyOpen(false); resetDailyForm(); }}>Cancel</Button>
                <Button onClick={handleSaveDaily} disabled={!dailyForm.personName || !dailyForm.startDate || !dailyForm.endDate || !dailyForm.startTime || !dailyForm.endTime}>
                  {editingDailyId ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── DOCUMENTS ── */}
        <TabsContent value="documents" className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Project Documents</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload scanned project documents such as PO, LOA, blueprint, or any hard-copy input received for this project.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleCameraCapture} className="gap-2">
                <Camera className="w-4 h-4" />
                Camera
              </Button>
              <Button onClick={handleDriveUpload} className="gap-2" disabled={uploading}>
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading…" : "Upload from Drive"}
              </Button>
            </div>
          </div>

          {projectDocuments.length === 0 ? (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground mt-2">
                  No documents uploaded yet. Use <strong>Camera</strong> to capture or <strong>Upload from Drive</strong> to attach files.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projectDocuments.map((doc) => (
                <ProjectDocumentCard key={doc.id} doc={doc} onUpdate={updateDocument} onDelete={deleteDocument} formatFileSize={formatFileSize} />
              ))}
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
