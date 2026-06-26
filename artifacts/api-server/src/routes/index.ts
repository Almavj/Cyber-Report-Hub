import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { writeupsRouter } from "./writeups";
import { reportsRouter } from "./reports";
import { tagsRouter } from "./tags";
import { statsRouter } from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/writeups", writeupsRouter);
router.use("/reports", reportsRouter);
router.use("/tags", tagsRouter);
router.use("/stats", statsRouter);

export default router;
