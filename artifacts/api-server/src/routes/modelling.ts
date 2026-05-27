import { Router, type Request, type Response, type IRouter } from "express";

interface ModellingRecord {
  id: string;
  activityId: string;
  modelType: string;
  softwareUsed: string;
  modelFile: string;
  remarks: string;
  completed: boolean;
}

const modellingRecords: Map<string, ModellingRecord> = new Map();

const router: IRouter = Router();

router.get("/modelling", (req: Request, res: Response) => {
  let result = Array.from(modellingRecords.values());
  const activityId = req.query.activityId as string | undefined;
  if (activityId) {
    result = result.filter((m) => m.activityId === activityId);
  }
  res.json({ success: true, data: result, count: result.length });
});

router.get("/modelling/:id", (req: Request, res: Response) => {
  const record = modellingRecords.get(req.params.id);
  if (!record) {
    res.status(404).json({ success: false, error: "Modelling record not found" });
    return;
  }
  res.json({ success: true, data: record });
});

router.post("/modelling", (req: Request, res: Response) => {
  const { id, activityId } = req.body;
  if (!id || !activityId) {
    res.status(400).json({ success: false, error: "Missing required fields: id, activityId" });
    return;
  }
  const record: ModellingRecord = { id, activityId, modelType: "", softwareUsed: "", modelFile: "", remarks: "", completed: false, ...req.body };
  modellingRecords.set(id, record);
  res.status(201).json({ success: true, data: record });
});

router.put("/modelling/:id", (req: Request, res: Response) => {
  const existing = modellingRecords.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Modelling record not found" });
    return;
  }
  const updated = { ...existing, ...req.body, id: req.params.id };
  modellingRecords.set(req.params.id, updated);
  res.json({ success: true, data: updated });
});

router.delete("/modelling/:id", (req: Request, res: Response) => {
  const existing = modellingRecords.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Modelling record not found" });
    return;
  }
  modellingRecords.delete(req.params.id);
  res.json({ success: true, message: "Modelling record deleted" });
});

export default router;
