import { Router, type Request, type Response, type IRouter } from "express";

interface ProjectRecord {
  id: string;
  name: string;
  location: string;
  state: string;
  lat: number;
  lng: number;
  status: string;
  progress: number;
  client: string;
  projectId: string;
  poValue: number;
  startDate: string;
  endDate: string;
  projectManager: string;
  clientGroupCode?: string;
  clientCode?: string;
  client3Code?: string;
  cloveProjectCode?: string;
  clientProjectCode?: string;
  bidQuote?: string;
  enquiryDate?: string;
  estimatedDate?: string;
  orderedDate?: string;
  inputReceivableDate?: string;
  proposedDate?: string;
  deliveredDate?: string;
  quotedHours?: number;
  orderHours?: number;
  receivedHours?: number;
  areaSqKm?: number;
  resolution?: string;
}

const projects: Map<string, ProjectRecord> = new Map();

const router: IRouter = Router();

router.get("/projects", (_req: Request, res: Response) => {
  res.json({ success: true, data: Array.from(projects.values()) });
});

router.get("/projects/:id", (req: Request, res: Response) => {
  const project = projects.get(req.params.id);
  if (!project) {
    res.status(404).json({ success: false, error: "Project not found" });
    return;
  }
  res.json({ success: true, data: project });
});

router.post("/projects", (req: Request, res: Response) => {
  const { id, name, client, location } = req.body;
  if (!id || !name || !client || !location) {
    res.status(400).json({ success: false, error: "Missing required fields: id, name, client, location" });
    return;
  }
  const project: ProjectRecord = { ...req.body };
  projects.set(id, project);
  res.status(201).json({ success: true, data: project });
});

router.put("/projects/:id", (req: Request, res: Response) => {
  const existing = projects.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Project not found" });
    return;
  }
  const updated = { ...existing, ...req.body, id: req.params.id };
  projects.set(req.params.id, updated);
  res.json({ success: true, data: updated });
});

router.delete("/projects/:id", (req: Request, res: Response) => {
  const existing = projects.get(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Project not found" });
    return;
  }
  projects.delete(req.params.id);
  res.json({ success: true, message: "Project deleted" });
});

export default router;
