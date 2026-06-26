import { pgTable, serial, text, numeric, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  target: text("target").notNull(),
  vulnerability: text("vulnerability").notNull(),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("draft"),
  reward: numeric("reward"),
  description: text("description"),
  stepsToReproduce: text("steps_to_reproduce"),
  impact: text("impact"),
  attachments: json("attachments").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
