import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import type { Advance, Expense, Invoice } from "@/context/AppContext";
import { uploadToProjectFolder } from "@/services/sheetsDataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Receipt, FileText, ArrowDownRight, ArrowUpRight, Plus, HandCoins, Banknote, Camera, Upload, Trash2, HardDrive } from "lucide-react";

function AdvancedDialog({ open, onOpenChange, onSave, projectId }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (a: Advance) => void; projectId: string }) {
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSave = () => {
    if (!personName || !amount || !date) return;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const parts = date.split("-");
    const formattedDate = `${Number(parts[2])} ${months[Number(parts[1])-1]} ${parts[0]}`;
    onSave({
      id: crypto.randomUUID(),
      projectId,
      personName,
      amount: Number(amount),
      date: formattedDate,
      purpose,
      settled: false,
      remarks,
    });
    setPersonName("");
    setAmount("");
    setPurpose("");
    setRemarks("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Advance</DialogTitle>
          <DialogDescription>Record an advance given to a team member for field expenses.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Person Name *</Label>
              <Input value={personName} onChange={e => setPersonName(e.target.value)} placeholder="e.g. Ramesh" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Amount (₹) *</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="10000" className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Purpose</Label>
              <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Field trip advance" className="h-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Remarks</Label>
            <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional notes" className="h-9" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!personName || !amount || !date}>Save Advance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceDialog({ open, onOpenChange, projectId }: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string }) {
  const { addInvoice } = useApp();
  const [invNumber, setInvNumber] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("Pending");

  const handleSave = () => {
    if (!invNumber || !amount || !date) return;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const parts = date.split("-");
    const formattedDate = `${Number(parts[2])} ${months[Number(parts[1])-1]} ${parts[0]}`;
    addInvoice({
      id: crypto.randomUUID(),
      projectId,
      number: invNumber,
      description,
      amount: Number(amount),
      date: formattedDate,
      status: status as any,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>Raise a new invoice for this project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Invoice # *</Label>
              <Input value={invNumber} onChange={e => setInvNumber(e.target.value)} placeholder="INV-001" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Amount (₹) *</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100000" className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Not Raised">Not Raised</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Field Work Completion" className="h-9" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!invNumber || !amount || !date}>Save Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldExpenseDialog({ open, onOpenChange, onSave, projectId, addDocument, uploadToProjectFolder, allProjects }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSave: (e: Expense) => void; projectId: string;
  addDocument: (d: import("@/context/AppContext").Document) => void;
  uploadToProjectFolder: (file: File, projectName: string, category: string) => Promise<any>;
  allProjects: import("@/context/AppContext").Project[];
}) {
  const [expenseType, setExpenseType] = useState("Fuel");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [location, setLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [uploading, setUploading] = useState(false);
  const [expenseId] = useState(() => crypto.randomUUID());

  const handleFileUpload = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      addDocument({
        id: crypto.randomUUID(),
        projectId,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
        category: "expense",
        expenseId,
      });
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf,.doc,.docx,.xlsx,.xls";
    input.capture = "environment";
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) Array.from(files).forEach(f => handleFileUpload(f));
    };
    input.click();
  };

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.bmp";
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) Array.from(files).forEach(f => handleFileUpload(f));
    };
    input.click();
  };

  const handleDriveUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.multiple = true;
    input.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          const project = allProjects.find(p => p.id === projectId);
          const driveFile = await uploadToProjectFolder(file, project?.name || "General", "expense");
          addDocument({
            id: crypto.randomUUID(),
            projectId,
            name: file.name,
            mimeType: file.type,
            size: file.size,
            data: driveFile.webViewLink || "",
            uploadedAt: new Date().toISOString(),
            category: "expense",
            expenseId,
            driveFileId: driveFile.id,
            driveWebViewLink: driveFile.webViewLink,
          });
        }
      } catch (err) {
        console.error("Drive upload failed:", err);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleSave = () => {
    if (!amount || !date || !paidBy) return;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const parts = date.split("-");
    const formattedDate = `${Number(parts[2])} ${months[Number(parts[1])-1]} ${parts[0]}`;
    onSave({
      id: expenseId,
      projectId,
      expenseType,
      date: formattedDate,
      amount: Number(amount),
      paidBy,
      location,
      remarks,
      reviewStatus: "pending",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Field Expense</DialogTitle>
          <DialogDescription>Record a field expense incurred for this project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <select
                value={expenseType}
                onChange={e => setExpenseType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="Fuel">Fuel</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Vehicle">Vehicle Rental</option>
                <option value="Food">Food & Meals</option>
                <option value="Equipment Repair">Equipment Repair</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Amount (₹) *</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="2500" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Paid By *</Label>
              <Input value={paidBy} onChange={e => setPaidBy(e.target.value)} placeholder="e.g. Ramesh" className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or site" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Remarks</Label>
              <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional notes" className="h-9" />
            </div>
          </div>
          <div className="border-t pt-3">
            <Label className="text-xs font-semibold mb-2 block">Attach Documents</Label>
            <div className="flex gap-2 mb-3">
              <Button type="button" variant="outline" size="sm" onClick={handleCameraCapture} disabled={uploading} className="gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Camera
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleFileSelect} disabled={uploading} className="gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDriveUpload} disabled={uploading} className="gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> Drive
              </Button>
            </div>
            {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!amount || !date || !paidBy}>Save Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectReasonDialog({ open, onOpenChange, onReject }: { open: boolean; onOpenChange: (v: boolean) => void; onReject: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Expense</DialogTitle>
          <DialogDescription>Provide a reason for rejecting this expense. The team member will see this reason.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Rejection Reason *</Label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Bill not attached, amount mismatch..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onReject(reason); setReason(""); }} disabled={!reason.trim()}>Reject Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditExpenseDialog({
  open, onOpenChange, expense, onSave, projectId, documents, addDocument, uploadToProjectFolder, allProjects,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; expense: Expense | null;
  onSave: (e: Expense) => void; projectId: string;
  documents: import("@/context/AppContext").Document[];
  addDocument: (d: import("@/context/AppContext").Document) => void;
  uploadToProjectFolder: (file: File, projectName: string, category: string) => Promise<any>;
  allProjects: import("@/context/AppContext").Project[];
}) {
  const [expenseType, setExpenseType] = useState(expense?.expenseType || "Fuel");
  const [date, setDate] = useState(() => {
    if (!expense?.date) return new Date().toISOString().split("T")[0];
    const parts = expense.date.split(" ");
    const months: Record<string, string> = {Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"};
    return `${parts[2]}-${months[parts[1]]}-${parts[0].padStart(2,"0")}`;
  });
  const [amount, setAmount] = useState(String(expense?.amount || ""));
  const [paidBy, setPaidBy] = useState(expense?.paidBy || "");
  const [location, setLocation] = useState(expense?.location || "");
  const [remarks, setRemarks] = useState(expense?.remarks || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (expense) {
      setExpenseType(expense.expenseType);
      const parts = expense.date.split(" ");
      const months: Record<string, string> = {Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"};
      setDate(`${parts[2]}-${months[parts[1]]}-${parts[0].padStart(2,"0")}`);
      setAmount(String(expense.amount));
      setPaidBy(expense.paidBy);
      setLocation(expense.location);
      setRemarks(expense.remarks);
    }
  }, [expense]);

  const linkedDocs = documents.filter(d => d.expenseId === expense?.id);

  const handleFileUpload = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      addDocument({
        id: crypto.randomUUID(),
        projectId,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
        category: "expense",
        expenseId: expense?.id,
      });
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf,.doc,.docx,.xlsx,.xls";
    input.capture = "environment";
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) Array.from(files).forEach(f => handleFileUpload(f));
    };
    input.click();
  };

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.bmp";
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) Array.from(files).forEach(f => handleFileUpload(f));
    };
    input.click();
  };

  const handleDriveUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.multiple = true;
    input.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          const project = allProjects.find(p => p.id === projectId);
          const driveFile = await uploadToProjectFolder(file, project?.name || "General", "expense");
          addDocument({
            id: crypto.randomUUID(),
            projectId,
            name: file.name,
            mimeType: file.type,
            size: file.size,
            data: driveFile.webViewLink || "",
            uploadedAt: new Date().toISOString(),
            category: "expense",
            expenseId: expense?.id,
            driveFileId: driveFile.id,
            driveWebViewLink: driveFile.webViewLink,
          });
        }
      } catch (err) {
        console.error("Drive upload failed:", err);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleSave = () => {
    if (!amount || !date || !paidBy) return;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const parts = date.split("-");
    const formattedDate = `${Number(parts[2])} ${months[Number(parts[1])-1]} ${parts[0]}`;
    onSave({
      ...expense!,
      expenseType,
      date: formattedDate,
      amount: Number(amount),
      paidBy,
      location,
      remarks,
      reviewStatus: "submitted",
      rejectionReason: undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Expense & Resubmit</DialogTitle>
          <DialogDescription>Update the expense details and attach supporting documents before resubmitting.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <select
                value={expenseType}
                onChange={e => setExpenseType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="Fuel">Fuel</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Vehicle">Vehicle Rental</option>
                <option value="Food">Food & Meals</option>
                <option value="Equipment Repair">Equipment Repair</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Date *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Amount (₹) *</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Paid By *</Label>
              <Input value={paidBy} onChange={e => setPaidBy(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Remarks</Label>
              <Input value={remarks} onChange={e => setRemarks(e.target.value)} className="h-9" />
            </div>
          </div>

          <div className="border-t pt-3">
            <Label className="text-xs font-semibold mb-2 block">Supporting Documents</Label>
            <div className="flex gap-2 mb-3">
              <Button type="button" variant="outline" size="sm" onClick={handleCameraCapture} disabled={uploading} className="gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Camera
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleFileSelect} disabled={uploading} className="gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDriveUpload} disabled={uploading} className="gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> Drive
              </Button>
            </div>
            {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            {linkedDocs.length > 0 && (
              <div className="space-y-1.5 mt-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Attached ({linkedDocs.length})</p>
                {linkedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1.5">
                    <FileText className="w-3 h-3 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1">{doc.name}</span>
                    {doc.driveWebViewLink ? (
                      <a href={doc.driveWebViewLink} target="_blank" rel="noreferrer" className="text-primary hover:underline shrink-0">View</a>
                    ) : doc.data ? (
                      <a href={doc.data} target="_blank" rel="noreferrer" className="text-primary hover:underline shrink-0">View</a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!amount || !date || !paidBy}>Save & Resubmit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentViewerDialog({ open, onOpenChange, expense, documents }: {
  open: boolean; onOpenChange: (v: boolean) => void; expense: Expense | null;
  documents: import("@/context/AppContext").Document[];
}) {
  const [previewDoc, setPreviewDoc] = useState<import("@/context/AppContext").Document | null>(null);
  const linkedDocs = documents.filter(d => d.expenseId === expense?.id);
  const otherDocs = documents.filter(d => d.category === "expense" && d.projectId === expense?.projectId && !d.expenseId);
  const allRelevant = [...linkedDocs, ...otherDocs].filter((d, i, a) => a.findIndex(x => x.id === d.id) === i);

  const isImage = (doc: typeof previewDoc) => doc?.data?.startsWith("data:") && doc?.mimeType?.startsWith("image/");
  const isPDF = (doc: typeof previewDoc) => doc?.mimeType === "application/pdf" || doc?.name?.endsWith(".pdf");
  const isPreviewable = (doc: typeof previewDoc) => isImage(doc) || isPDF(doc) || doc?.data?.startsWith("data:");

  useEffect(() => {
    if (!open) setPreviewDoc(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Expense Documents</DialogTitle>
          <DialogDescription>{expense ? `${expense.paidBy} — ₹${expense.amount.toLocaleString("en-IN")} — ${expense.date}` : ""}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col lg:flex-row gap-4 min-h-0 max-h-[calc(80vh-8rem)]">
          <div className={`space-y-2 ${previewDoc ? "w-full lg:w-64 shrink-0" : "w-full"}`}>
            {allRelevant.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No documents attached to this expense.</p>
            ) : (
              <div className={`${previewDoc ? "" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}`}>
                {allRelevant.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setPreviewDoc(doc)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-accent ${
                      previewDoc?.id === doc.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {doc.data?.startsWith("data:") && doc.mimeType?.startsWith("image/") ? (
                        <img src={doc.data} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                      ) : (
                        <FileText className="w-10 h-10 shrink-0 text-muted-foreground p-1" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB</p>
                      </div>
                      {doc.driveWebViewLink && (
                        <a href={doc.driveWebViewLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                          <HardDrive className="w-4 h-4 text-muted-foreground hover:text-foreground shrink-0" />
                        </a>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {previewDoc && (
            <div className="flex-1 border rounded-lg overflow-hidden bg-muted/20 min-h-[300px] flex items-center justify-center">
              {isImage(previewDoc) ? (
                <img src={previewDoc.data!} alt={previewDoc.name} className="max-w-full max-h-[60vh] object-contain" />
              ) : isPDF(previewDoc) && previewDoc.data?.startsWith("data:") ? (
                <iframe src={previewDoc.data} className="w-full h-[60vh]" title={previewDoc.name} />
              ) : previewDoc.data?.startsWith("data:") ? (
                <iframe src={previewDoc.data} className="w-full h-[60vh]" title={previewDoc.name} />
              ) : previewDoc.data?.startsWith("http") ? (
                <iframe src={previewDoc.data} className="w-full h-[60vh]" title={previewDoc.name} />
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm font-medium">{previewDoc.name}</p>
                  <p className="text-xs mt-1">Preview not available inline</p>
                  {previewDoc.driveWebViewLink && (
                    <a href={previewDoc.driveWebViewLink} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="mt-3 gap-1">
                        <HardDrive className="w-3 h-3" /> Open in Drive
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Billing() {
  const { projects, invoices, expenses, advances, user, documents, addExpense, deleteExpense, updateExpense, addInvoice, addAdvance, updateAdvance, deleteAdvance, addDocument, submitExpensesForReview, approveExpense, rejectExpense } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [billingSub, setBillingSub] = useState("overview");
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [uploadingExpense, setUploadingExpense] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectExpenseId, setRejectExpenseId] = useState<string | null>(null);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [viewDocsExpenseId, setViewDocsExpenseId] = useState<string | null>(null);

  const isAdmin = user?.isAdmin ?? false;

  // Effective tab - redirect invoice to overview for non-admins
  const effectiveTab = !isAdmin && billingSub === "invoice" ? "overview" : billingSub;

  const isPerProject = selectedProjectId !== "all";
  const project = isPerProject ? projects.find(p => p.id === selectedProjectId) : null;

  const filteredInvoices = isPerProject ? invoices.filter(i => i.projectId === selectedProjectId) : invoices;
  const filteredExpenses = isPerProject ? expenses.filter(e => e.projectId === selectedProjectId) : expenses;
  const filteredAdvances = isPerProject ? advances.filter(a => a.projectId === selectedProjectId) : advances;

  const totalPoValue = projects.reduce((sum, p) => sum + p.poValue, 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0);
  const totalPending = totalInvoiced - totalPaid;
  const totalExpensesAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalFilteredExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalFilteredAdvances = filteredAdvances.reduce((s, a) => s + a.amount, 0);
  const totalFilteredInvoiced = filteredInvoices.reduce((s, i) => s + i.amount, 0);
  const totalFilteredPaid = filteredInvoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const totalFilteredPending = totalFilteredInvoiced - totalFilteredPaid;

  const handleInvoiceCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleInvoiceFileUpload(file);
    };
    input.click();
  };

  const handleInvoiceFileUpload = (file: File) => {
    setUploadingInvoice(true);
    const reader = new FileReader();
    reader.onload = () => {
      addDocument({
        id: crypto.randomUUID(),
        projectId: isPerProject && project ? project.id : projects[0]?.id ?? "",
        name: file.name,
        mimeType: file.type,
        size: file.size,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
        category: "invoice",
      });
      setUploadingInvoice(false);
    };
    reader.onerror = () => setUploadingInvoice(false);
    reader.readAsDataURL(file);
  };

  const handleInvoiceDriveUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.xlsx,.xls";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingInvoice(true);
      try {
        const targetProject = isPerProject && project ? project : projects[0];
        const driveFile = await uploadToProjectFolder(file, targetProject?.name || "General", "invoice");
        addDocument({
          id: crypto.randomUUID(),
          projectId: targetProject?.id ?? "",
          name: file.name,
          mimeType: file.type,
          size: file.size,
          data: driveFile.webViewLink || "",
          uploadedAt: new Date().toISOString(),
          category: "invoice",
          driveFileId: driveFile.id,
          driveWebViewLink: driveFile.webViewLink,
        });
      } catch (err) {
        console.error("Failed to upload to Drive:", err);
      } finally {
        setUploadingInvoice(false);
      }
    };
    input.click();
  };

  const handleExpenseCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleExpenseFileUpload(file);
    };
    input.click();
  };

  const handleExpenseFileUpload = (file: File) => {
    setUploadingExpense(true);
    const reader = new FileReader();
    reader.onload = () => {
      addDocument({
        id: crypto.randomUUID(),
        projectId: isPerProject && project ? project.id : projects[0]?.id ?? "",
        name: file.name,
        mimeType: file.type,
        size: file.size,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
        category: "expense",
      });
      setUploadingExpense(false);
    };
    reader.onerror = () => setUploadingExpense(false);
    reader.readAsDataURL(file);
  };

  const handleExpenseDriveUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingExpense(true);
      try {
        const targetProject = isPerProject && project ? project : projects[0];
        const driveFile = await uploadToProjectFolder(file, targetProject?.name || "General", "expense");
        addDocument({
          id: crypto.randomUUID(),
          projectId: targetProject?.id ?? "",
          name: file.name,
          mimeType: file.type,
          size: file.size,
          data: driveFile.webViewLink || "",
          uploadedAt: new Date().toISOString(),
          category: "expense",
          driveFileId: driveFile.id,
          driveWebViewLink: driveFile.webViewLink,
        });
      } catch (err) {
        console.error("Failed to upload to Drive:", err);
      } finally {
        setUploadingExpense(false);
      }
    };
    input.click();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing & Finance</h1>
          <p className="text-sm text-muted-foreground mt-1">Financial overview across all projects</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link href="/expenses/add">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Expense</span>
              </Link>
            </Button>
            <Button onClick={() => setInvoiceDialogOpen(true)} className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Create Invoice</span>
              <span className="sm:hidden">Invoice</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" /> {isPerProject ? "PO Value" : "Total PO Value"}
            </p>
            <p className="text-3xl font-bold tracking-tight mt-2">
              {isPerProject && project ? formatCurrency(project.poValue) : formatCurrency(totalPoValue)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {isPerProject && project ? project.name : `Across ${projects.length} projects`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-500" /> Total Invoiced
            </p>
            <p className="text-3xl font-bold tracking-tight mt-2 text-blue-600">
              {isPerProject ? formatCurrency(totalFilteredInvoiced) : formatCurrency(totalInvoiced)}
            </p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((isPerProject && project ? totalFilteredInvoiced : totalInvoiced) / (isPerProject && project ? project.poValue : totalPoValue || 1)) * 100)}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{Math.round(((isPerProject && project ? totalFilteredInvoiced : totalInvoiced) / ((isPerProject && project ? project.poValue : totalPoValue) || 1)) * 100)}% of PO</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-green-500" /> Received
            </p>
            <p className="text-3xl font-bold tracking-tight mt-2 text-green-600">
              {isPerProject ? formatCurrency(totalFilteredPaid) : formatCurrency(totalPaid)}
            </p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((isPerProject ? totalFilteredPaid : totalPaid) / ((isPerProject ? totalFilteredInvoiced : totalInvoiced) || 1)) * 100)}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{Math.round(((isPerProject ? totalFilteredPaid : totalPaid) / ((isPerProject ? totalFilteredInvoiced : totalInvoiced) || 1)) * 100)}% of invoiced</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-red-500" /> Pending (AR)
            </p>
            <p className="text-3xl font-bold tracking-tight mt-2 text-red-600">
              {isPerProject ? formatCurrency(totalFilteredPending) : formatCurrency(totalPending)}
            </p>
            <p className="text-xs text-muted-foreground mt-3 pt-1 border-t">
              {isPerProject ? "Expenses" : "Expenses to date"}: <span className="font-semibold text-foreground">₹{isPerProject ? totalFilteredExpenses.toLocaleString("en-IN") : totalExpensesAll.toLocaleString("en-IN")}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-0 sm:gap-1 border-b overflow-x-auto scrollbar-none -mx-4 sm:mx-0 px-4 sm:px-0">
        {[
          { key: "overview", label: "Overview", icon: FileText },
          { key: "advance", label: "Advance by Company", icon: HandCoins },
          ...(isAdmin ? [{ key: "invoice", label: "Invoices", icon: Receipt }] : []),
          { key: "expense", label: "Field Expenses", icon: Banknote },
          ...(isAdmin ? [{ key: "expenseReview", label: "Expense Review", icon: FileText }] : []),
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setBillingSub(tab.key)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors shrink-0 ${
              billingSub === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {effectiveTab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile card view */}
            <div className="md:hidden space-y-3">
              {invoices.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">No invoices raised yet.</p>
              ) : (
                invoices.map((invoice) => {
                  const invProject = projects.find(p => p.id === invoice.projectId);
                  return (
                    <Card key={invoice.id} className="border shadow-sm">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{invoice.number}</span>
                          <StatusBadge status={invoice.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider">Project</span>
                            <Link href={`/projects/${invProject?.id}`} className="text-primary hover:underline">
                              {invProject?.name || "Unknown"}
                            </Link>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] uppercase tracking-wider">Amount</span>
                            <span className="font-semibold text-foreground">{formatCurrency(invoice.amount)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{invoice.description || "—"}</span>
                          <span>{invoice.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No invoices raised yet.</TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => {
                      const invProject = projects.find(p => p.id === invoice.projectId);
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium whitespace-nowrap">{invoice.number}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Link href={`/projects/${invProject?.id}`} className="text-primary hover:underline">
                              {invProject?.name || "Unknown"}
                            </Link>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{invoice.description}</TableCell>
                          <TableCell className="whitespace-nowrap">{invoice.date}</TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <StatusBadge status={invoice.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {effectiveTab === "advance" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-orange-500 shrink-0" /> Advance by Company
            </h3>
            <Button onClick={() => setAdvanceDialogOpen(true)} size="sm" className="gap-2 self-start sm:self-auto">
              <Plus className="w-4 h-4" /> New Advance
            </Button>
          </div>

          {filteredAdvances.length > 0 && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-orange-700 uppercase tracking-wide">Total Advances</p>
                <p className="text-lg font-bold text-orange-800">₹{totalFilteredAdvances.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          )}

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {filteredAdvances.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground text-sm">No advances given yet.</p>
            ) : (
              filteredAdvances.map((adv) => (
                <Card key={adv.id} className="border shadow-sm">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{adv.personName}</span>
                      <Badge variant={adv.settled ? "secondary" : "outline"} className={adv.settled ? "bg-green-100 text-green-700 text-[10px]" : "text-amber-600 text-[10px]"}>
                        {adv.settled ? "Settled" : "Pending"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider">Date</span>
                        <span className="text-foreground">{adv.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-wider">Amount</span>
                        <span className="font-semibold text-foreground">₹{adv.amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="block text-[10px] uppercase tracking-wider">Purpose</span>
                      <span>{adv.purpose || "—"}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 pt-1 border-t">
                      {!adv.settled && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600"
                          onClick={() => updateAdvance(adv.id, { settled: true, settledDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) })}
                        >
                          Settle
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteAdvance(adv.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No advances given yet.</TableCell>
                  </TableRow>
                ) : (
                  filteredAdvances.map((adv) => (
                    <TableRow key={adv.id}>
                      <TableCell className="whitespace-nowrap">{adv.date}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{adv.personName}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{adv.purpose}</TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">₹{adv.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={adv.settled ? "secondary" : "outline"} className={adv.settled ? "bg-green-100 text-green-700" : "text-amber-600"}>
                          {adv.settled ? "Settled" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {!adv.settled && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600"
                              onClick={() => updateAdvance(adv.id, { settled: true, settledDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) })}
                            >
                              Settle
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteAdvance(adv.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {billingSub === "invoice" && isAdmin && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary shrink-0" /> Invoices
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleInvoiceCameraCapture} disabled={uploadingInvoice} className="gap-1.5 flex-1 sm:flex-none">
                <Camera className="w-3.5 h-3.5" />
                {uploadingInvoice ? "..." : "Camera"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleInvoiceDriveUpload} disabled={uploadingInvoice} className="gap-1.5 flex-1 sm:flex-none">
                <HardDrive className="w-3.5 h-3.5" />
                {uploadingInvoice ? "..." : "Drive"}
              </Button>
              <Button size="sm" onClick={() => setInvoiceDialogOpen(true)} className="gap-1.5 flex-1 sm:flex-none">
                <Plus className="w-3.5 h-3.5" /> New
              </Button>
            </div>
          </div>

          {filteredInvoices.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-blue-700 uppercase tracking-wide">Total Invoiced</p>
                  <p className="text-lg font-bold text-blue-800">{formatCurrency(totalFilteredInvoiced)}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-green-700 uppercase tracking-wide">Received</p>
                  <p className="text-lg font-bold text-green-800">{formatCurrency(totalFilteredPaid)}</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-amber-700 uppercase tracking-wide">Pending</p>
                  <p className="text-lg font-bold text-amber-800">{formatCurrency(totalFilteredPending)}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-slate-700 uppercase tracking-wide">Not Raised</p>
                  <p className="text-lg font-bold text-slate-800">{formatCurrency(filteredInvoices.filter(i => i.status === "Not Raised").reduce((s, i) => s + i.amount, 0))}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {filteredInvoices.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground text-sm">No invoices raised yet.</p>
            ) : (
              filteredInvoices.map((invoice) => {
                const invProject = projects.find(p => p.id === invoice.projectId);
                return (
                  <Card key={invoice.id} className="border shadow-sm">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{invoice.number}</span>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        {!isPerProject && (
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider">Project</span>
                            <Link href={`/projects/${invProject?.id}`} className="text-primary hover:underline">
                              {invProject?.name || "Unknown"}
                            </Link>
                          </div>
                        )}
                        <div className={isPerProject ? "" : "text-right"}>
                          <span className="block text-[10px] uppercase tracking-wider">Amount</span>
                          <span className="font-semibold text-foreground">{formatCurrency(invoice.amount)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{invoice.description || "—"}</span>
                        <span>{invoice.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Invoice #</TableHead>
                  {!isPerProject && <TableHead className="whitespace-nowrap">Project</TableHead>}
                  <TableHead className="whitespace-nowrap">Description</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isPerProject ? 5 : 6} className="text-center py-4 text-muted-foreground">No invoices raised yet.</TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const invProject = projects.find(p => p.id === invoice.projectId);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium whitespace-nowrap">{invoice.number}</TableCell>
                        {!isPerProject && (
                          <TableCell className="whitespace-nowrap">
                            <Link href={`/projects/${invProject?.id}`} className="text-primary hover:underline">
                              {invProject?.name || "Unknown"}
                            </Link>
                          </TableCell>
                        )}
                        <TableCell className="whitespace-nowrap">{invoice.description}</TableCell>
                        <TableCell className="whitespace-nowrap">{invoice.date}</TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell className="whitespace-nowrap"><StatusBadge status={invoice.status} /></TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {effectiveTab === "expense" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-500 shrink-0" /> Field Expenses
            </h3>
            <div className="flex gap-2">
              {filteredExpenses.some(e => e.reviewStatus === "pending") && (
                <Button size="sm" variant="outline" onClick={() => submitExpensesForReview(isPerProject ? selectedProjectId : undefined)} className="gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Submit for Review
                </Button>
              )}
              <Button size="sm" onClick={() => setExpenseDialogOpen(true)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> New Expense
              </Button>
            </div>
          </div>

          {(filteredExpenses.length > 0 || filteredAdvances.length > 0) && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-amber-700 uppercase tracking-wide">Total Expenses</p>
                  <p className="text-lg font-bold text-amber-800">₹{totalFilteredExpenses.toLocaleString("en-IN")}</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-orange-700 uppercase tracking-wide">Total Advances</p>
                  <p className="text-lg font-bold text-orange-800">₹{totalFilteredAdvances.toLocaleString("en-IN")}</p>
                </CardContent>
              </Card>
              <Card className={`border ${totalFilteredAdvances - totalFilteredExpenses >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <CardContent className="p-3">
                  <p className={`text-[10px] font-medium uppercase tracking-wide ${totalFilteredAdvances - totalFilteredExpenses >= 0 ? "text-green-700" : "text-red-700"}`}>Balance</p>
                  <p className={`text-lg font-bold ${totalFilteredAdvances - totalFilteredExpenses >= 0 ? "text-green-700" : "text-red-700"}`}>
                    ₹{(totalFilteredAdvances - totalFilteredExpenses).toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {filteredExpenses.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-slate-700 uppercase tracking-wide">Pending</p>
                  <p className="text-lg font-bold text-slate-800">{filteredExpenses.filter(e => e.reviewStatus === "pending").length}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-blue-700 uppercase tracking-wide">Submitted</p>
                  <p className="text-lg font-bold text-blue-800">{filteredExpenses.filter(e => e.reviewStatus === "submitted").length}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-green-700 uppercase tracking-wide">Approved</p>
                  <p className="text-lg font-bold text-green-800">{filteredExpenses.filter(e => e.reviewStatus === "approved").length}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-red-700 uppercase tracking-wide">Rejected</p>
                  <p className="text-lg font-bold text-red-800">{filteredExpenses.filter(e => e.reviewStatus === "rejected").length}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {filteredExpenses.length > 0 && (
            <Card>
              <CardContent className="p-3">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">By Type</h5>
                <div className="space-y-1">
                  {Object.entries(
                    filteredExpenses.reduce<Record<string, number>>((acc, e) => {
                      acc[e.expenseType] = (acc[e.expenseType] ?? 0) + e.amount;
                      return acc;
                    }, {})
                  ).map(([type, amt]) => (
                    <div key={type} className="flex justify-between text-xs">
                      <span>{type}</span>
                      <span className="font-mono font-medium">₹{amt.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {filteredExpenses.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground text-sm">No expenses logged.</p>
            ) : (
              filteredExpenses.map((expense) => (
                <Card key={expense.id} className="border shadow-sm">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{expense.paidBy}</span>
                      <div className="flex items-center gap-1">
                        {expense.reviewStatus === "rejected" && (
                          <Badge variant="destructive" className="font-normal text-[10px]">Rejected</Badge>
                        )}
                        {expense.reviewStatus === "approved" && (
                          <Badge className="bg-green-100 text-green-700 font-normal text-[10px]">Approved</Badge>
                        )}
                        {expense.reviewStatus === "submitted" && (
                          <Badge variant="secondary" className="font-normal text-[10px]">Submitted</Badge>
                        )}
                        {expense.reviewStatus === "pending" && (
                          <Badge variant="outline" className="font-normal text-[10px]">Pending</Badge>
                        )}
                        <Badge variant="secondary" className="font-normal text-[10px]">{expense.expenseType}</Badge>
                      </div>
                    </div>
                    {expense.reviewStatus === "rejected" && expense.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                        <span className="font-semibold">Rejected: </span>{expense.rejectionReason}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider">Date</span>
                        <span className="text-foreground">{expense.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-wider">Amount</span>
                        <span className="font-semibold text-foreground">₹{expense.amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="block text-[10px] uppercase tracking-wider">Purpose</span>
                      <span>{expense.remarks || "—"}</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {expense.reviewStatus === "rejected" && (
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1"
                          onClick={() => setEditExpenseId(expense.id)}
                        >
                          <Upload className="w-3 h-3" /> Edit & Resubmit
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Expense Done By</TableHead>
                  <TableHead className="whitespace-nowrap">Purpose</TableHead>
                  <TableHead className="whitespace-nowrap">Mode</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">Review Status</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">No expenses logged.</TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="whitespace-nowrap">{expense.date}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{expense.paidBy}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-normal max-w-xs break-words">
                        <div>{expense.remarks || "—"}</div>
                        {expense.reviewStatus === "rejected" && expense.rejectionReason && (
                          <div className="text-red-500 text-[10px] mt-0.5 font-medium">Reason: {expense.rejectionReason}</div>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap"><Badge variant="secondary" className="font-normal">{expense.expenseType}</Badge></TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">₹{expense.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {expense.reviewStatus === "approved" && (
                          <Badge className="bg-green-100 text-green-700 font-normal">Approved</Badge>
                        )}
                        {expense.reviewStatus === "rejected" && (
                          <Badge variant="destructive" className="font-normal">Rejected</Badge>
                        )}
                        {expense.reviewStatus === "submitted" && (
                          <Badge variant="secondary" className="font-normal">Submitted</Badge>
                        )}
                        {expense.reviewStatus === "pending" && (
                          <Badge variant="outline" className="font-normal">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {expense.reviewStatus === "rejected" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                              onClick={() => setEditExpenseId(expense.id)}
                            >
                              <Upload className="w-3 h-3" /> Edit & Resubmit
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteExpense(expense.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {effectiveTab === "expenseReview" && isAdmin && (() => {
        const submitted = filteredExpenses.filter(e => e.reviewStatus === "submitted");
        const approved = filteredExpenses.filter(e => e.reviewStatus === "approved");
        const rejected = filteredExpenses.filter(e => e.reviewStatus === "rejected");
        return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary shrink-0" /> Expense Review
            </h3>
            <p className="text-sm text-muted-foreground">Review field expenses submitted by the team for approval</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-blue-700 uppercase tracking-wide">Awaiting Review</p>
                <p className="text-lg font-bold text-blue-800">{submitted.length}</p>
                <p className="text-xs text-blue-600">₹{submitted.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-green-700 uppercase tracking-wide">Approved</p>
                <p className="text-lg font-bold text-green-800">{approved.length}</p>
                <p className="text-xs text-green-600">₹{approved.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-red-700 uppercase tracking-wide">Rejected</p>
                <p className="text-lg font-bold text-red-800">{rejected.length}</p>
                <p className="text-xs text-red-600">₹{rejected.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {filteredExpenses.filter(e => e.reviewStatus === "submitted").length === 0 ? (
              <p className="text-center py-4 text-muted-foreground text-sm">No expenses awaiting review.</p>
            ) : (
              filteredExpenses.filter(e => e.reviewStatus === "submitted").map((expense) => {
                const expProject = projects.find(p => p.id === expense.projectId);
                return (
                  <Card key={expense.id} className="border shadow-sm">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{expense.paidBy}</span>
                        <Badge variant="secondary" className="font-normal text-[10px]">{expense.expenseType}</Badge>
                      </div>
                      {!isPerProject && (
                        <div className="text-xs text-muted-foreground">
                          <span className="block text-[10px] uppercase tracking-wider">Project</span>
                          <Link href={`/projects/${expProject?.id}`} className="text-primary hover:underline">
                            {expProject?.name || "Unknown"}
                          </Link>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider">Date</span>
                          <span className="text-foreground">{expense.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] uppercase tracking-wider">Amount</span>
                          <span className="font-semibold text-foreground">₹{expense.amount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="block text-[10px] uppercase tracking-wider">Remarks</span>
                        <span>{expense.remarks || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t">
                        <Button size="sm" variant="outline" className="h-8 text-xs"
                          onClick={() => setViewDocsExpenseId(expense.id)}
                        >
                          <FileText className="w-3 h-3" />
                        </Button>
                        <Button size="sm" className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => approveExpense(expense.id)}
                        >
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => { setRejectExpenseId(expense.id); setRejectDialogOpen(true); }}
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  {!isPerProject && <TableHead className="whitespace-nowrap">Project</TableHead>}
                  <TableHead className="whitespace-nowrap">Expense Done By</TableHead>
                  <TableHead className="whitespace-nowrap">Purpose</TableHead>
                  <TableHead className="whitespace-nowrap">Mode</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.filter(e => e.reviewStatus === "submitted").length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isPerProject ? 6 : 7} className="text-center py-4 text-muted-foreground">No expenses awaiting review.</TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.filter(e => e.reviewStatus === "submitted").map((expense) => {
                    const expProject = projects.find(p => p.id === expense.projectId);
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="whitespace-nowrap">{expense.date}</TableCell>
                        {!isPerProject && (
                          <TableCell className="whitespace-nowrap">
                            <Link href={`/projects/${expProject?.id}`} className="text-primary hover:underline">
                              {expProject?.name || "Unknown"}
                            </Link>
                          </TableCell>
                        )}
                        <TableCell className="font-medium whitespace-nowrap">{expense.paidBy}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-normal max-w-xs break-words">{expense.remarks || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap"><Badge variant="secondary" className="font-normal">{expense.expenseType}</Badge></TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">₹{expense.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => setViewDocsExpenseId(expense.id)}
                            >
                              <FileText className="w-3 h-3" />
                            </Button>
                            <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700"
                              onClick={() => approveExpense(expense.id)}
                            >
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => { setRejectExpenseId(expense.id); setRejectDialogOpen(true); }}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {approved.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recently Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        {!isPerProject && <TableHead className="whitespace-nowrap">Project</TableHead>}
                        <TableHead className="whitespace-nowrap">Expense Done By</TableHead>
                        <TableHead className="whitespace-nowrap">Purpose</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                        <TableHead className="whitespace-nowrap">Reviewed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approved.slice(0, 10).map((expense) => {
                        const expProject = projects.find(p => p.id === expense.projectId);
                        return (
                          <TableRow key={expense.id}>
                            <TableCell className="whitespace-nowrap">{expense.date}</TableCell>
                            {!isPerProject && (
                              <TableCell className="whitespace-nowrap">{expProject?.name || "Unknown"}</TableCell>
                            )}
                            <TableCell className="font-medium whitespace-nowrap">{expense.paidBy}</TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">{expense.remarks || "—"}</TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">₹{expense.amount.toLocaleString("en-IN")}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{expense.reviewedBy || "—"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-2">
                  {approved.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between text-sm border-b pb-2">
                      <div>
                        <span className="font-medium">{expense.paidBy}</span>
                        <span className="text-muted-foreground ml-2">₹{expense.amount.toLocaleString("en-IN")}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 font-normal text-[10px]">Approved</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        );
      })()}

      <AdvancedDialog
        open={advanceDialogOpen}
        onOpenChange={setAdvanceDialogOpen}
        onSave={(a) => { addAdvance(a); setAdvanceDialogOpen(false); }}
        projectId={isPerProject && project ? project.id : projects[0]?.id ?? ""}
      />

      <FieldExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        onSave={(e) => { addExpense(e); setExpenseDialogOpen(false); }}
        projectId={isPerProject && project ? project.id : projects[0]?.id ?? ""}
        addDocument={addDocument}
        uploadToProjectFolder={uploadToProjectFolder}
        allProjects={projects}
      />

      <InvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        projectId={isPerProject && project ? project.id : projects[0]?.id ?? ""}
      />

      <RejectReasonDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onReject={(reason) => {
          if (rejectExpenseId) {
            rejectExpense(rejectExpenseId, reason);
            setRejectExpenseId(null);
          }
          setRejectDialogOpen(false);
        }}
      />

      <EditExpenseDialog
        open={editExpenseId !== null}
        onOpenChange={(v) => { if (!v) setEditExpenseId(null); }}
        expense={expenses.find(e => e.id === editExpenseId) || null}
        onSave={(updated) => { updateExpense(updated.id, updated); }}
        projectId={isPerProject && project ? project.id : projects[0]?.id ?? ""}
        documents={documents}
        addDocument={addDocument}
        uploadToProjectFolder={uploadToProjectFolder}
        allProjects={projects}
      />

      <DocumentViewerDialog
        open={viewDocsExpenseId !== null}
        onOpenChange={(v) => { if (!v) setViewDocsExpenseId(null); }}
        expense={expenses.find(e => e.id === viewDocsExpenseId) || null}
        documents={documents}
      />
    </div>
  );
}
