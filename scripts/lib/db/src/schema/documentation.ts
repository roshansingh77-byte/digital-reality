import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { activitiesTable } from "./activities";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documentationTable = pgTable("documentation", {
  id: text("id").primaryKey(),
  activityId: text("activity_id").notNull().references(() => activitiesTable.id),
  reportUpload: text("report_upload").default(""),
  pdfUpload: text("pdf_upload").default(""),
  documentVersion: text("document_version").default(""),
  remarks: text("remarks").default(""),
  completed: boolean("completed").notNull().default(false),
});

export const insertDocumentationSchema = createInsertSchema(documentationTable).omit({ id: true });
export type InsertDocumentation = z.infer<typeof insertDocumentationSchema>;
export type Documentation = typeof documentationTable.$inferSelect;
