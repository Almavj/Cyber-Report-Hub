import { pgTable, serial, text, numeric, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const writeupsTable = pgTable("writeups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary"),
  content: text("content").notNull(),
  severity: text("severity").notNull().default("medium"),
  platform: text("platform").notNull(),
  bountyAmount: numeric("bounty_amount"),
  cveId: text("cve_id"),
  tags: json("tags").$type<string[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWriteupSchema = createInsertSchema(writeupsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWriteup = z.infer<typeof insertWriteupSchema>;
export type Writeup = typeof writeupsTable.$inferSelect;
