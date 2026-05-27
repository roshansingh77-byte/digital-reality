import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { activitiesTable } from "./activities";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const processingTable = pgTable("processing", {
  id: text("id").primaryKey(),
  activityId: text("activity_id").notNull().references(() => activitiesTable.id),
  softwareUsed: text("software_used").default(""),
  inputFiles: text("input_files").default(""),
  outputFiles: text("output_files").default(""),
  processingStatus: text("processing_status").notNull().default("Pending"),
  remarks: text("remarks").default(""),
  completed: boolean("completed").notNull().default(false),
});

export const insertProcessingSchema = createInsertSchema(processingTable).omit({ id: true });
export type InsertProcessing = z.infer<typeof insertProcessingSchema>;
export type Processing = typeof processingTable.$inferSelect;
