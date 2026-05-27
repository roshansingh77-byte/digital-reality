import { Router, type Request, type Response, type IRouter } from "express";

interface FieldWorkRecord {
  id: string;
  activityId: string;
  date: string;
  time: string;
  location: string;
  lat: number;
  lng: number;
  areaSqKm: number;
  linearKm: number;
  equipmentUsed: string;
  remarks: string;
  completed: boolean;
}

const fieldWorkRecords: Map<string, FieldWorkRecord> = new Map();

const router: IRouter = Router();

router.get("/field-work", (req: Request, res: Response) => {
  let result = Array.from(fieldWorkRecords.values());
  const activityId = req.query.activityId as string | undefined;
  if (activityId) {
    result = result.filter((f) => f.activityId === activityId);
  }
  res.json({ success: true, data: result, count: result.length });
});

router.get("/field-work/:id", (req: Request, res: Response) => {
  const record = fieldWorkRecords.get(req.params.id);
  if (!record) {
    res.status(404).json({ success: false, error: "Field work record not found" });
    return;
  }
  res.json({ success: true, data: record });
});

router.post("/field-work", (req: Request, res: Response) => {
  const { id, activityId } = req.body;
  if (!id || !activityId) {
    res.status(400).json({ success: false, error: "Missing required fields: id, activityId" });
    return;
  }
  const record: FieldWorkRecord = { id, activityId, date: "", time: "", location: "", lat: 0, lng: 0, areaSqKm: 0, linearKm: 0, equipmentUsed: "", remarks: "", completed: false, ...req.body };
  fieldWorkRecords.set(id, record);
  res.status(201).json({ success: true, data: record });
});

router.put("/field-work/:id", (req: Request, res: Response) => {
  const existing = fieldWorkRecords.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Field work record not found" });
    return;
  }
  const updated = { ...existing, ...req.body, id: req.params.id };
  fieldWorkRecords.set(req.params.id, updated);
  res.json({ success: true, data: updated });
});

router.delete("/field-work/:id", (req: Request, res: Response) => {
  const existing = fieldWorkRecords.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Field work record not found" });
    return;
  }
  fieldWorkRecords.delete(req.params.id);
  res.json({ success: true, message: "Field work record deleted" });
});

export default router;
