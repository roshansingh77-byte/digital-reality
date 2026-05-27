import { Router, type IRouter } from "express";
import healthRouter from "./health";
import documentsRouter from "./documents";
import projectsRouter from "./projects";
import activitiesRouter from "./activities";
import fieldWorkRouter from "./fieldWork";
import processingRouter from "./processing";
import modellingRouter from "./modelling";
import documentationRouter from "./documentation";

const router: IRouter = Router();

router.use(healthRouter);
router.use(documentsRouter);
router.use(projectsRouter);
router.use(activitiesRouter);
router.use(fieldWorkRouter);
router.use(processingRouter);
router.use(modellingRouter);
router.use(documentationRouter);

export default router;
