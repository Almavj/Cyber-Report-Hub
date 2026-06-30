import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { writeupsRouter } from "./writeups";
import { reportsRouter } from "./reports";
import { tagsRouter } from "./tags";
import { statsRouter } from "./stats";
import storageRouter from "./storage";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", service: "0x41m4-api" });
});

router.use(healthRouter);
router.use("/storage", storageRouter);
router.use("/writeups", writeupsRouter);
router.use("/reports", reportsRouter);
router.use("/tags", tagsRouter);
router.use("/stats", statsRouter);

export default router;
