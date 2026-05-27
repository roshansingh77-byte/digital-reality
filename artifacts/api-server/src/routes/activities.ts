import { Router, type Request, type Response, type IRouter } from "express";

interface ActivityRecord {
  id: string;
  projectId: string;
  activityType: string;
  date: string;
  location: string;
  lat: number;
  lng: number;
}

const activities: Map<string, ActivityRecord> = new Map();

const router: IRouter = Router();

router.get("/activities", (req: Request, res: Response) => {
  let result = Array.from(activities.values());
  const projectId = req.query.projectId as string | undefined;
  if (projectId) {
    result = result.filter((a) => a.projectId === projectId);
  }
  res.json({ success: true, data: result, count: result.length });
});

router.get("/activities/:id", (req: Request, res: Response) => {
  const activity = activities.get(req.params.id);
  if (!activity) {
    res.status(404).json({ success: false, error: "Activity not found" });
    return;
  }
  res.json({ success: true, data: activity });
});

router.post("/activities", (req: Request, res: Response) => {
  const { id, projectId, activityType } = req.body;
  if (!id || !projectId || !activityType) {
    res.status(400).json({ success: false, error: "Missing required fields: id, projectId, activityType" });
    return;
  }
  const activity: ActivityRecord = { ...req.body };
  activities.set(id, activity);
  res.status(201).json({ success: true, data: activity });
});

router.put("/activities/:id", (req: Request, res: Response) => {
  const existing = activities.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Activity not found" });
    return;
  }
  const updated = { ...existing, ...req.body, id: req.params.id };
  activities.set(req.params.id, updated);
  res.json({ success: true, data: updated });
});

router.delete("/activities/:id", (req: Request, res: Response) => {
  const existing = activities.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Activity not found" });
    return;
  }
  activities.delete(req.params.id);
  res.json({ success: true, message: "Activity deleted" });
});

export default router;
