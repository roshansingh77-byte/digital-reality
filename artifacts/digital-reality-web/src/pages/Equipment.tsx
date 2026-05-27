import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { Equipment as EquipmentType, EquipmentStatus } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Compass, MapPin, User as UserIcon, Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EQUIPMENT_STATUSES: EquipmentStatus[] = ["In Use", "Available", "Maintenance"];

const COMMON_EQUIPMENT_PRESETS: { name: string; type: string }[] = [
  { name: "Navvis VLX3", type: "Mobile LiDAR Scanner" },
  { name: "Navvis M6", type: "Mobile Mapping System" },
  { name: "Apple Ipad", type: "Tablet" },
  { name: "Matterport Pro2", type: "3D Camera" },
  { name: "Matterport", type: "3D Camera" },
  { name: "Cannon Mark 200D", type: "DSLR Camera" },
  { name: "Big Tripod", type: "Tripod" },
  { name: "Small Tripod (Camera)", type: "Tripod" },
  { name: "Garmin VIRB 360", type: "360 Camera" },
  { name: "DJI Handy Cam", type: "Action Camera" },
  { name: "Contour2+", type: "Action Camera" },
  { name: "Stereo Lab ZED 2", type: "Depth Camera" },
  { name: "Sensefly eBee", type: "Drone" },
  { name: "Quantum Trinity F90", type: "Drone" },
  { name: "DJI Phantom Pro4 V2", type: "Drone" },
  { name: "Laptop", type: "Computer" },
  { name: "Hard Disk", type: "Storage" },
  { name: "Mouse", type: "Accessory" },
  { name: "Shoes", type: "Safety Gear" },
  { name: "Safety Jacket", type: "Safety Gear" },
  { name: "Safety Helmet", type: "Safety Gear" },
  { name: "Structure Sensor", type: "3D Scanner" },
  { name: "Project Tango Dev Kit", type: "Tablet" },
  { name: "Digital Lux Meter", type: "Measurement Tool" },
  { name: "Disto D410", type: "Laser Distance Meter" },
  { name: "Walkie Talkie", type: "Communication" },
  { name: "Insta 360 X5 & Selfie Stick", type: "360 Camera" },
  { name: "Gimbal Mozo", type: "Camera Gimbal" },
  { name: "Safety Jacket #5", type: "Safety Equipment" },
  { name: "Safety Jacket #6", type: "Safety Equipment" },
  { name: "Safety Helmet #1", type: "Safety Equipment" },
];

function EquipmentDialog({
  open,
  onOpenChange,
  onSave,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (e: EquipmentType) => void;
  initial?: EquipmentType;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [serialNumber, setSerialNumber] = useState(initial?.serialNumber ?? "");
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [assignedTo, setAssignedTo] = useState(initial?.assignedTo ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [status, setStatus] = useState<EquipmentStatus>(initial?.status ?? "Available");

  const handleSave = () => {
    if (!name || !type) return;
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name,
      type,
      serialNumber,
      quantity: Number(quantity) || 1,
      assignedTo,
      location,
      status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update equipment details." : "Add a new item to the equipment inventory."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!initial && (
            <div className="space-y-2">
              <Label className="text-xs">Quick Select (preset)</Label>
              <Select onValueChange={(val) => {
                const preset = COMMON_EQUIPMENT_PRESETS.find(p => p.name === val);
                if (preset) { setName(preset.name); setType(preset.type); }
              }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Choose a common item..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_EQUIPMENT_PRESETS.map(p => (
                    <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Navvis VLX3" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Type *</Label>
              <Input value={type} onChange={e => setType(e.target.value)} placeholder="e.g. LiDAR Scanner" className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Serial / ID</Label>
              <Input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Serial number" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Assigned To</Label>
              <Input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Person name" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="City / Site" className="h-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as EquipmentStatus)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name || !type}>
            {initial ? "Save Changes" : "Add Equipment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Equipment() {
  const { equipment, equipmentLogs, addEquipment, updateEquipment, deleteEquipment } = useApp();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [filter, setFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentType | undefined>(undefined);

  const assignees = [...new Set(equipment.map(e => e.assignedTo).filter((v): v is string => !!v))].sort();
  const locations = [...new Set(equipment.map(e => e.location).filter((v): v is string => !!v))].sort();

  const filteredEquipment = equipment.filter(e => {
    const matchesFilter = filter === "All" || e.status === filter;
    const matchesAssignee = assigneeFilter === "All" || e.assignedTo === assigneeFilter;
    const matchesLocation = locationFilter === "All" || e.location === locationFilter;
    const matchesSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
      (e.serialNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.assignedTo ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesAssignee && matchesLocation && matchesSearch;
  });

  const openAdd = () => {
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  const openEdit = (item: EquipmentType) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = (item: EquipmentType) => {
    if (editingItem) {
      updateEquipment(item.id, item);
    } else {
      addEquipment(item);
    }
    setDialogOpen(false);
    setEditingItem(undefined);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from equipment inventory?`)) {
      deleteEquipment(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Equipment Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Track hardware, scanners, drones, and safety gear</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Equipment
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All</SelectItem>
                <SelectItem value="Available" className="text-xs">Available</SelectItem>
                <SelectItem value="In Use" className="text-xs">In Use</SelectItem>
                <SelectItem value="Maintenance" className="text-xs">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Assigned To</Label>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="h-8 text-xs w-[150px]">
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All</SelectItem>
                {assignees.map(a => (
                  <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Location</Label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="h-8 text-xs w-[150px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-xs">All</SelectItem>
                {locations.map(l => (
                  <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(filter !== "All" || assigneeFilter !== "All" || locationFilter !== "All") && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFilter("All"); setAssigneeFilter("All"); setLocationFilter("All"); }}>
              Clear
            </Button>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-muted/30 border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${syncing ? "bg-amber-400 animate-pulse" : syncMsg.includes("Synced") ? "bg-green-500" : "bg-muted-foreground/40"}`} />
          <span>{syncing ? "Syncing to Google Sheets..." : syncMsg || equipment.length + " items in inventory"}</span>
        </div>
        <Button variant="outline" size="sm" onClick={async () => {
          setSyncing(true);
          setSyncMsg("Syncing...");
          try {
            const { isSignedIn, getAccessToken } = await import("@/services/googleAuth");
            const { ensureSheetsExist } = await import("@/services/sheetsDataService");
            if (!isSignedIn()) { setSyncMsg("Not connected to Google. Sign in via Drive page."); return; }

            const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
            const token = await getAccessToken();

            // Read existing sheet data (to preserve extra columns)
            const readRes = await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent("Equipment!A:H")}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const existingData = await readRes.json();
            const existingRows: string[][] = existingData.values || [];
            const existingHeaders = existingRows[0] || [];

            // Build a map of id → existing row (skip header)
            const existingMap = new Map<string, string[]>();
            for (let i = 1; i < existingRows.length; i++) {
              const row = existingRows[i];
              if (row[0]) existingMap.set(row[0], row);
            }

            // Build new rows: merge app data into existing rows or create new
            const headers = ["id","name","type","status","assignedTo","serialNumber","quantity","location"];
            const newRows: string[][] = [headers];

            for (const item of equipment) {
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
            setSyncMsg("Synced to Sheet ✓ (" + equipment.length + " items)");
          } catch (e) { setSyncMsg("Sync failed: " + (e as Error).message); }
          setSyncing(false);
        }} disabled={syncing} className="gap-1.5">
          <svg className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9" /><path d="M21 3v5h-5" /></svg>
          Save to Sheet
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Mobile card view */}
          <div className="md:hidden divide-y">
            {filteredEquipment.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No equipment found matching criteria.</div>
            ) : (
              filteredEquipment.map((item, idx) => (
                <div key={item.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-primary/10 p-2 rounded-md shrink-0">
                        <Compass className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.type}</div>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Qty</span>
                      <span className="font-semibold">{item.quantity ?? 1}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Serial</span>
                      <span className="font-mono truncate block">{item.serialNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Assigned</span>
                      <span className="truncate block">{item.assignedTo || "—"}</span>
                    </div>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-1 pt-1 border-t">
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-primary p-0"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-destructive p-0"
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[60px] text-center">#</TableHead>
                  <TableHead>Equipment Name</TableHead>
                  <TableHead className="hidden md:table-cell">Serial / ID</TableHead>
                  <TableHead className="text-center w-[80px]">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Assigned To</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No equipment found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipment.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center text-muted-foreground text-xs font-mono">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-md shrink-0">
                            <Compass className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm sm:text-base">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.type}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.serialNumber ? (
                          <span className="text-sm font-mono text-muted-foreground">{item.serialNumber}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold">{item.quantity ?? 1}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {item.assignedTo ? (
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <UserIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[100px]">{item.assignedTo}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {item.location ? (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {item.location}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-primary p-0"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-destructive p-0"
                            onClick={() => handleDelete(item.id, item.name)}
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
        </CardContent>
      </Card>

      {equipmentLogs.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground select-none">
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                Assignment Log ({equipmentLogs.length} entries)
              </summary>
              <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                {equipmentLogs.slice(0, 50).map((log) => (
                  <div key={log.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-md hover:bg-muted/50 border-b border-border/40 last:border-0">
                    <span className="text-muted-foreground shrink-0 font-mono">{new Date(log.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "UTC" })}</span>
                    <span className="font-medium shrink-0">{log.equipmentName}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="capitalize text-muted-foreground">{log.field.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-muted-foreground">changed from</span>
                    <span className="line-through text-muted-foreground/60">{log.oldValue || "—"}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium text-primary">{log.newValue || "—"}</span>
                    <span className="text-muted-foreground ml-auto shrink-0">by {log.changedBy}</span>
                  </div>
                ))}
              </div>
            </details>
          </CardContent>
        </Card>
      )}

      <EquipmentDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingItem(undefined); }}
        onSave={handleSave}
        initial={editingItem}
      />
    </div>
  );
}
