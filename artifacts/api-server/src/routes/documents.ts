import { Router, type Request, type Response, type IRouter } from "express";

interface DocumentRecord {
  id: string;
  projectId: string;
  name: string;
  type: "PO" | "Site Permit" | "Report" | "Drawing" | "Photo" | "Other";
  status: "Uploaded" | "Processing" | "Archived";
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

// In-memory storage (replace with database in production)
const documents: Map<string, DocumentRecord> = new Map();

const router: IRouter = Router();

/**
 * GET /api/documents
 * List all documents or filter by project
 */
router.get("/documents", (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined;

  let result: DocumentRecord[] = Array.from(documents.values());

  if (projectId) {
    result = result.filter((doc) => doc.projectId === projectId);
  }

  res.json({
    success: true,
    data: result,
    count: result.length,
  });
});

/**
 * GET /api/documents/:id
 * Get a specific document
 */
router.get("/documents/:id", (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);

  if (!doc) {
    res.status(404).json({
      success: false,
      error: "Document not found",
    });
    return;
  }

  res.json({
    success: true,
    data: doc,
  });
});

/**
 * POST /api/documents
 * Create a new document record
 */
router.post("/documents", (req: Request, res: Response) => {
  const { id, projectId, name, type, status, fileSize, mimeType, uploadedBy, uploadedAt, description } = req.body;

  // Validation
  if (!id || !projectId || !name || !type || !uploadedBy) {
    res.status(400).json({
      success: false,
      error: "Missing required fields",
    });
    return;
  }

  const doc: DocumentRecord = {
    id,
    projectId,
    name,
    type,
    status: status || "Uploaded",
    fileSize: fileSize || 0,
    mimeType: mimeType || "application/octet-stream",
    uploadedBy,
    uploadedAt: uploadedAt || new Date().toISOString(),
    description,
  };

  documents.set(id, doc);

  res.status(201).json({
    success: true,
    data: doc,
    message: "Document created successfully",
  });
});

/**
 * PUT /api/documents/:id
 * Update a document
 */
router.put("/documents/:id", (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);

  if (!doc) {
    res.status(404).json({
      success: false,
      error: "Document not found",
    });
    return;
  }

  const updatedDoc: DocumentRecord = {
    ...doc,
    ...req.body,
    id: doc.id, // Prevent ID change
  };

  documents.set(req.params.id, updatedDoc);

  res.json({
    success: true,
    data: updatedDoc,
    message: "Document updated successfully",
  });
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
router.delete("/documents/:id", (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);

  if (!doc) {
    res.status(404).json({
      success: false,
      error: "Document not found",
    });
    return;
  }

  documents.delete(req.params.id);

  res.json({
    success: true,
    data: doc,
    message: "Document deleted successfully",
  });
});

/**
 * POST /api/documents/:id/archive
 * Archive a document
 */
router.post("/documents/:id/archive", (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);

  if (!doc) {
    res.status(404).json({
      success: false,
      error: "Document not found",
    });
    return;
  }

  doc.status = "Archived";
  documents.set(req.params.id, doc);

  res.json({
    success: true,
    data: doc,
    message: "Document archived successfully",
  });
});

/**
 * GET /api/projects/:projectId/documents
 * Get all documents for a project
 */
router.get("/projects/:projectId/documents", (req: Request, res: Response) => {
  const projectDocs = Array.from(documents.values()).filter(
    (doc) => doc.projectId === req.params.projectId,
  );

  res.json({
    success: true,
    data: projectDocs,
    count: projectDocs.length,
  });
});

/**
 * GET /api/documents/stats
 * Get document statistics
 */
router.get("/documents/stats", (_req: Request, res: Response) => {
  const allDocs = Array.from(documents.values());
  const stats = {
    total: allDocs.length,
    byType: allDocs.reduce(
      (acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    byStatus: allDocs.reduce(
      (acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    totalSize: allDocs.reduce((acc, doc) => acc + doc.fileSize, 0),
  };

  res.json({
    success: true,
    data: stats,
  });
});

export default router;
