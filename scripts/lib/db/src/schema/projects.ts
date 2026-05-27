import { pgTable, text, integer, numeric, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projectsTable = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
  state: text("state").notNull().default(""),
  lat: doublePrecision("lat").notNull().default(0),
  lng: doublePrecision("lng").notNull().default(0),
  status: text("status").notNull().default("Planning"),
  progress: integer("progress").notNull().default(0),
  client: text("client").notNull().default(""),
  projectId: text("project_id").notNull().default(""),
  poValue: numeric("po_value").notNull().default("0"),
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  projectManager: text("project_manager").notNull().default(""),
  clientGroupCode: text("client_group_code"),
  clientCode: text("client_code"),
  client3Code: text("client_3_code"),
  cloveProjectCode: text("clove_project_code"),
  clientProjectCode: text("client_project_code"),
  bidQuote: text("bid_quote"),
  enquiryDate: text("enquiry_date"),
  estimatedDate: text("estimated_date"),
  orderedDate: text("ordered_date"),
  inputReceivableDate: text("input_receivable_date"),
  proposedDate: text("proposed_date"),
  deliveredDate: text("delivered_date"),
  quotedHours: integer("quoted_hours").default(0),
  orderHours: integer("order_hours").default(0),
  receivedHours: integer("received_hours").default(0),
  areaSqKm: doublePrecision("area_sq_km").default(0),
  resolution: text("resolution"),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
