import { Router } from "express";
import { db, writeupsTable, reportsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

export const statsRouter = Router();

statsRouter.get("/dashboard", async (_req, res) => {
  try {
    const writeups = await db.select().from(writeupsTable);
    const reports = await db.select().from(reportsTable);

    const totalWriteups = writeups.length;
    const totalReports = reports.length;
    const totalBounty = [
      ...writeups.map((w) => Number(w.bountyAmount ?? 0)),
      ...reports.map((r) => Number(r.reward ?? 0)),
    ].reduce((a, b) => a + b, 0);

    const countBySeverity = (items: { severity: string }[], sev: string) =>
      items.filter((i) => i.severity === sev).length;

    const allItems = [...writeups, ...reports];
    const criticalCount = countBySeverity(allItems, "critical");
    const highCount = countBySeverity(allItems, "high");
    const mediumCount = countBySeverity(allItems, "medium");
    const lowCount = countBySeverity(allItems, "low");

    const resolvedReports = reports.filter((r) => r.status === "resolved").length;
    const activeReports = reports.filter((r) =>
      ["submitted", "triaged"].includes(r.status)
    ).length;
    const featuredWriteups = writeups.filter((w) => w.featured).length;

    res.json({
      totalWriteups,
      totalReports,
      totalBounty,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      resolvedReports,
      activeReports,
      featuredWriteups,
    });
  } catch (err) {
    logger.error({ err }, "getDashboardStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

statsRouter.get("/recent", async (_req, res) => {
  try {
    const writeups = await db.select().from(writeupsTable).orderBy(sql`${writeupsTable.createdAt} desc`).limit(5);
    const reports = await db.select().from(reportsTable).orderBy(sql`${reportsTable.createdAt} desc`).limit(5);

    const activity = [
      ...writeups.map((w) => ({
        id: w.id,
        type: "writeup" as const,
        title: w.title,
        severity: w.severity,
        status: null as string | null,
        createdAt: w.createdAt.toISOString(),
      })),
      ...reports.map((r) => ({
        id: r.id,
        type: "report" as const,
        title: r.title,
        severity: r.severity,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    res.json(activity);
  } catch (err) {
    logger.error({ err }, "getRecentActivity error");
    res.status(500).json({ error: "Internal server error" });
  }
});
