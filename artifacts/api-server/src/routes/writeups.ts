import { Router } from "express";
import { db, writeupsTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  CreateWriteupBody,
  UpdateWriteupBody,
  ListWriteupsQueryParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

export const writeupsRouter = Router();

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function serializeWriteup(w: typeof writeupsTable.$inferSelect) {
  return {
    id: w.id,
    title: w.title,
    slug: w.slug,
    summary: w.summary ?? null,
    content: w.content,
    severity: w.severity,
    platform: w.platform,
    bountyAmount: w.bountyAmount ? Number(w.bountyAmount) : null,
    cveId: w.cveId ?? null,
    tags: (w.tags as string[]) ?? [],
    featured: w.featured,
    publishedAt: w.publishedAt ? w.publishedAt.toISOString() : null,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  };
}

writeupsRouter.get("/", async (req, res) => {
  try {
    const parse = ListWriteupsQueryParams.safeParse(req.query);
    const params = parse.success ? parse.data : {};

    let rows = await db.select().from(writeupsTable).orderBy(sql`${writeupsTable.createdAt} desc`);

    if (params.severity) {
      rows = rows.filter((r) => r.severity === params.severity);
    }
    if (params.featured !== undefined) {
      rows = rows.filter((r) => r.featured === (params.featured === true || params.featured === "true" as unknown));
    }
    if (params.tag) {
      rows = rows.filter((r) => (r.tags as string[]).includes(params.tag!));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.summary ?? "").toLowerCase().includes(q) ||
          r.platform.toLowerCase().includes(q)
      );
    }

    res.json(rows.map(serializeWriteup));
  } catch (err) {
    logger.error({ err }, "listWriteups error");
    res.status(500).json({ error: "Internal server error" });
  }
});

writeupsRouter.post("/", async (req, res) => {
  try {
    const parse = CreateWriteupBody.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.message });
      return;
    }
    const data = parse.data;
    const slug = toSlug(data.title) + "-" + Date.now();
    const [row] = await db
      .insert(writeupsTable)
      .values({
        title: data.title,
        slug,
        summary: data.summary,
        content: data.content,
        severity: data.severity ?? "medium",
        platform: data.platform,
        bountyAmount: data.bountyAmount != null ? String(data.bountyAmount) : undefined,
        cveId: data.cveId,
        tags: data.tags ?? [],
        featured: data.featured ?? false,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      })
      .returning();
    res.status(201).json(serializeWriteup(row));
  } catch (err) {
    logger.error({ err }, "createWriteup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

writeupsRouter.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [row] = await db.select().from(writeupsTable).where(eq(writeupsTable.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeWriteup(row));
  } catch (err) {
    logger.error({ err }, "getWriteup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

writeupsRouter.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const parse = UpdateWriteupBody.safeParse(req.body);
    if (!parse.success) { res.status(400).json({ error: parse.error.message }); return; }
    const data = parse.data;
    const updates: Partial<typeof writeupsTable.$inferInsert> = { updatedAt: new Date() };
    if (data.title !== undefined) { updates.title = data.title; updates.slug = toSlug(data.title) + "-" + id; }
    if (data.summary !== undefined) updates.summary = data.summary;
    if (data.content !== undefined) updates.content = data.content;
    if (data.severity !== undefined) updates.severity = data.severity;
    if (data.platform !== undefined) updates.platform = data.platform;
    if (data.bountyAmount !== undefined) updates.bountyAmount = String(data.bountyAmount);
    if (data.cveId !== undefined) updates.cveId = data.cveId;
    if (data.tags !== undefined) updates.tags = data.tags;
    if (data.featured !== undefined) updates.featured = data.featured;
    if (data.publishedAt !== undefined) updates.publishedAt = new Date(data.publishedAt);
    const [row] = await db.update(writeupsTable).set(updates).where(eq(writeupsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeWriteup(row));
  } catch (err) {
    logger.error({ err }, "updateWriteup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

writeupsRouter.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [row] = await db.delete(writeupsTable).where(eq(writeupsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "deleteWriteup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

writeupsRouter.patch("/:id/feature", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [existing] = await db.select().from(writeupsTable).where(eq(writeupsTable.id, id));
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    const [row] = await db
      .update(writeupsTable)
      .set({ featured: !existing.featured, updatedAt: new Date() })
      .where(eq(writeupsTable.id, id))
      .returning();
    res.json(serializeWriteup(row));
  } catch (err) {
    logger.error({ err }, "toggleWriteupFeature error");
    res.status(500).json({ error: "Internal server error" });
  }
});
