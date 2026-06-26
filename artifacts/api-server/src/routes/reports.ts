import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateReportBody,
  UpdateReportBody,
  ListReportsQueryParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

export const reportsRouter = Router();

function serializeReport(r: typeof reportsTable.$inferSelect) {
  return {
    id: r.id,
    title: r.title,
    target: r.target,
    vulnerability: r.vulnerability,
    severity: r.severity,
    status: r.status,
    reward: r.reward ? Number(r.reward) : null,
    description: r.description ?? null,
    stepsToReproduce: r.stepsToReproduce ?? null,
    impact: r.impact ?? null,
    attachments: (r.attachments as string[]) ?? [],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

reportsRouter.get("/", async (req, res) => {
  try {
    const parse = ListReportsQueryParams.safeParse(req.query);
    const params = parse.success ? parse.data : {};

    let rows = await db.select().from(reportsTable).orderBy(sql`${reportsTable.createdAt} desc`);

    if (params.severity) {
      rows = rows.filter((r) => r.severity === params.severity);
    }
    if (params.status) {
      rows = rows.filter((r) => r.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.target.toLowerCase().includes(q) ||
          r.vulnerability.toLowerCase().includes(q)
      );
    }

    res.json(rows.map(serializeReport));
  } catch (err) {
    logger.error({ err }, "listReports error");
    res.status(500).json({ error: "Internal server error" });
  }
});

reportsRouter.post("/", async (req, res) => {
  try {
    const parse = CreateReportBody.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.message });
      return;
    }
    const data = parse.data;
    const [row] = await db
      .insert(reportsTable)
      .values({
        title: data.title,
        target: data.target,
        vulnerability: data.vulnerability,
        severity: data.severity ?? "medium",
        status: data.status ?? "draft",
        reward: data.reward != null ? String(data.reward) : undefined,
        description: data.description,
        stepsToReproduce: data.stepsToReproduce,
        impact: data.impact,
        attachments: data.attachments ?? [],
      })
      .returning();
    res.status(201).json(serializeReport(row));
  } catch (err) {
    logger.error({ err }, "createReport error");
    res.status(500).json({ error: "Internal server error" });
  }
});

reportsRouter.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [row] = await db.select().from(reportsTable).where(eq(reportsTable.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeReport(row));
  } catch (err) {
    logger.error({ err }, "getReport error");
    res.status(500).json({ error: "Internal server error" });
  }
});

reportsRouter.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const parse = UpdateReportBody.safeParse(req.body);
    if (!parse.success) { res.status(400).json({ error: parse.error.message }); return; }
    const data = parse.data;
    const updates: Partial<typeof reportsTable.$inferInsert> = { updatedAt: new Date() };
    if (data.title !== undefined) updates.title = data.title;
    if (data.target !== undefined) updates.target = data.target;
    if (data.vulnerability !== undefined) updates.vulnerability = data.vulnerability;
    if (data.severity !== undefined) updates.severity = data.severity;
    if (data.status !== undefined) updates.status = data.status;
    if (data.reward !== undefined) updates.reward = String(data.reward);
    if (data.description !== undefined) updates.description = data.description;
    if (data.stepsToReproduce !== undefined) updates.stepsToReproduce = data.stepsToReproduce;
    if (data.impact !== undefined) updates.impact = data.impact;
    if (data.attachments !== undefined) updates.attachments = data.attachments;
    const [row] = await db.update(reportsTable).set(updates).where(eq(reportsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeReport(row));
  } catch (err) {
    logger.error({ err }, "updateReport error");
    res.status(500).json({ error: "Internal server error" });
  }
});

reportsRouter.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [row] = await db.delete(reportsTable).where(eq(reportsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "deleteReport error");
    res.status(500).json({ error: "Internal server error" });
  }
});
