import { Router, type Request, type Response, type IRouter } from "express";

interface DocumentationRecord {
  id: string;
  activityId: string;
  reportUpload: string;
  pdfUpload: string;
  documentVersion: string;
  remarks: string;
  completed: boolean;
}

const documentationRecords: Map<string, DocumentationRecord> = new Map();

const router: IRouter = Router();

router.get("/documentation", (req: Request, res: Response) => {
  let result = Array.from(documentationRecords.values());
  const activityId = req.query.activityId as string | undefined;
  if (activityId) {
    result = result.filter((d) => d.activityId === activityId);
  }
  res.json({ success: true, data: result, count: result.length });
});

router.get("/documentation/:id", (req: Request, res: Response) => {
  const record = documentationRecords.get(req.params.id);
  if (!record) {
    res.status(404).json({ success: false, error: "Documentation record not found" });
    return;
  }
  res.json({ success: true, data: record });
});

router.post("/documentation", (req: Request, res: Response) => {
  const { id, activityId } = req.body;
  if (!id || !activityId) {
    res.status(400).json({ success: false, error: "Missing required fields: id, activityId" });
    return;
  }
  const record: DocumentationRecord = { id, activityId, reportUpload: "", pdfUpload: "", documentVersion: "", remarks: "", completed: false, ...req.body };
  documentationRecords.set(id, record);
  res.status(201).json({ success: true, data: record });
});

router.put("/documentation/:id", (req: Request, res: Response) => {
  const existing = documentationRecords.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Documentation record not found" });
    return;
  }
  const updated = { ...existing, ...req.body, id: req.params.id };
  documentationRecords.set(req.params.id, updated);
  res.json({ success: true, data: updated });
});

router.delete("/documentation/:id", (req: Request, res: Response) => {
  const existing = documentationRecords.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Documentation record not found" });
    return;
  }
  documentationRecords.delete(req.params.id);
  res.json({ success: true, message: "Documentation record deleted" });
});

export default router;
