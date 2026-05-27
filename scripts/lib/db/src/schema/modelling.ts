import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { activitiesTable } from "./activities";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const modellingTable = pgTable("modelling", {
  id: text("id").primaryKey(),
  activityId: text("activity_id").notNull().references(() => activitiesTable.id),
  modelType: text("model_type").default(""),
  softwareUsed: text("software_used").default(""),
  modelFile: text("model_file").default(""),
  remarks: text("remarks").default(""),
  completed: boolean("completed").notNull().default(false),
});

export const insertModellingSchema = createInsertSchema(modellingTable).omit({ id: true });
export type InsertModelling = z.infer<typeof insertModellingSchema>;
export type Modelling = typeof modellingTable.$inferSelect;
