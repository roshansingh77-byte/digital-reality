import { pgTable, text, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { activitiesTable } from "./activities";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fieldWorkTable = pgTable("field_work", {
  id: text("id").primaryKey(),
  activityId: text("activity_id").notNull().references(() => activitiesTable.id),
  date: text("date").notNull().default(""),
  time: text("time").notNull().default(""),
  location: text("location").notNull().default(""),
  lat: doublePrecision("lat").default(0),
  lng: doublePrecision("lng").default(0),
  areaSqKm: doublePrecision("area_sq_km").default(0),
  linearKm: doublePrecision("linear_km").default(0),
  equipmentUsed: text("equipment_used").default(""),
  remarks: text("remarks").default(""),
  completed: boolean("completed").notNull().default(false),
});

export const insertFieldWorkSchema = createInsertSchema(fieldWorkTable).omit({ id: true });
export type InsertFieldWork = z.infer<typeof insertFieldWorkSchema>;
export type FieldWork = typeof fieldWorkTable.$inferSelect;
