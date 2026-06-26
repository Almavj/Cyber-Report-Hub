import { Router } from "express";
import { db, tagsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTagBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

export const tagsRouter = Router();

tagsRouter.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(tagsTable).orderBy(tagsTable.name);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "listTags error");
    res.status(500).json({ error: "Internal server error" });
  }
});

tagsRouter.post("/", async (req, res) => {
  try {
    const parse = CreateTagBody.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.message });
      return;
    }
    const data = parse.data;
    const [row] = await db
      .insert(tagsTable)
      .values({ name: data.name, color: data.color ?? "#00ff88" })
      .onConflictDoNothing()
      .returning();
    if (!row) {
      const [existing] = await db.select().from(tagsTable).where(eq(tagsTable.name, data.name));
      res.status(201).json(existing);
      return;
    }
    res.status(201).json(row);
  } catch (err) {
    logger.error({ err }, "createTag error");
    res.status(500).json({ error: "Internal server error" });
  }
});

tagsRouter.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.delete(tagsTable).where(eq(tagsTable.id, id));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "deleteTag error");
    res.status(500).json({ error: "Internal server error" });
  }
});
