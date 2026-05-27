import { Router, type Request, type Response, type IRouter } from "express";

interface ProcessingRecord {
  id: string;
  activityId: string;
  softwareUsed: string;
  inputFiles: string;
  outputFiles: string;
  processingStatus: string;
  remarks: string;
  completed: boolean;
}

const processingRecords: Map<string, ProcessingRecord> = new Map();

const router: IRouter = Router();

router.get("/processing", (req: Request, res: Response) => {
  let result = Array.from(processingRecords.values());
  const activityId = req.query.activityId as string | undefined;
  if (activityId) {
    result = result.filter((p) => p.activityId === activityId);
  }
  res.json({ success: true, data: result, count: result.length });
});

router.get("/processing/:id", (req: Request, res: Response) => {
  const record = processingRecords.get(req.params.id);
  if (!record) {
    res.status(404).json({ success: false, error: "Processing record not found" });
    return;
  }
  res.json({ success: true, data: record });
});

router.post("/processing", (req: Request, res: Response) => {
  const { id, activityId } = req.body;
  if (!id || !activityId) {
    res.status(400).json({ success: false, error: "Missing required fields: id, activityId" });
    return;
  }
  const record: ProcessingRecord = { id, activityId, softwareUsed: "", inputFiles: "", outputFiles: "", processingStatus: "Pending", remarks: "", completed: false, ...req.body };
  processingRecords.set(id, record);
  res.status(201).json({ success: true, data: record });
});

router.put("/processing/:id", (req: Request, res: Response) => {
  const existing = processingRecords.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Processing record not found" });
    return;
  }
  const updated = { ...existing, ...req.body, id: req.params.id };
  processingRecords.set(req.params.id, updated);
  res.json({ success: true, data: updated });
});

router.delete("/processing/:id", (req: Request, res: Response) => {
  const existing = processingRecords.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Processing record not found" });
    return;
  }
  processingRecords.delete(req.params.id);
  res.json({ success: true, message: "Processing record deleted" });
});

export default router;
