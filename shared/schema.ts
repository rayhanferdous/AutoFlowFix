import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for local authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("client"), // admin (shop manager), user (technician), client
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 10 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  year: integer("year").notNull(),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 50 }).notNull(),
  vin: varchar("vin", { length: 17 }).unique(),
  licensePlate: varchar("license_plate", { length: 20 }),
  color: varchar("color", { length: 30 }),
  mileage: integer("mileage"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").default(60), // minutes
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, confirmed, in_progress, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Repair Orders table
export const repairOrders = pgTable("repair_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  technicianId: varchar("technician_id").references(() => users.id),
  status: varchar("status", { length: 20 }).default("created"), // created, in_progress, awaiting_parts, completed, delivered
  priority: varchar("priority", { length: 10 }).default("normal"), // low, normal, high, urgent
  description: text("description").notNull(),
  diagnosis: text("diagnosis"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  laborHours: decimal("labor_hours", { precision: 5, scale: 2 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  repairOrderId: uuid("repair_order_id").references(() => repairOrders.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, paid, overdue, cancelled
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Digital Inspections table
export const inspections = pgTable("inspections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  repairOrderId: uuid("repair_order_id").references(() => repairOrders.id), // nullable - links inspection to specific repair order
  vehicleInfo: text("vehicle_info").notNull(), // e.g., "2020 Honda Civic - ABC123"
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, in-progress, completed
  checklistItems: integer("checklist_items").default(12),
  completedItems: integer("completed_items").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Log table for tracking all operations
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  operation: varchar("operation", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  status: varchar("status", { length: 20 }).default("success"), // success, error
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Health table for monitoring
export const systemHealth = pgTable("system_health", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  component: varchar("component", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // healthy, warning, error
  responseTime: integer("response_time"), // in milliseconds
  details: jsonb("details"),
  checkedAt: timestamp("checked_at").defaultNow(),
});

// Relations
export const customerRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
  appointments: many(appointments),
  repairOrders: many(repairOrders),
  invoices: many(invoices),
  inspections: many(inspections),
}));

export const vehicleRelations = relations(vehicles, ({ one, many }) => ({
  customer: one(customers, {
    fields: [vehicles.customerId],
    references: [customers.id],
  }),
  appointments: many(appointments),
  repairOrders: many(repairOrders),
  inspections: many(inspections),
}));

export const appointmentRelations = relations(appointments, ({ one, many }) => ({
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [appointments.vehicleId],
    references: [vehicles.id],
  }),
  repairOrders: many(repairOrders),
}));

export const repairOrderRelations = relations(repairOrders, ({ one }) => ({
  customer: one(customers, {
    fields: [repairOrders.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [repairOrders.vehicleId],
    references: [vehicles.id],
  }),
  appointment: one(appointments, {
    fields: [repairOrders.appointmentId],
    references: [appointments.id],
  }),
  technician: one(users, {
    fields: [repairOrders.technicianId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [repairOrders.id],
    references: [invoices.repairOrderId],
  }),
}));

export const invoiceRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  repairOrder: one(repairOrders, {
    fields: [invoices.repairOrderId],
    references: [repairOrders.id],
  }),
}));

export const inspectionRelations = relations(inspections, ({ one }) => ({
  customer: one(customers, {
    fields: [inspections.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [inspections.vehicleId],
    references: [vehicles.id],
  }),
}));

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    scheduledDate: z.coerce.date(),
  });

export const insertRepairOrderSchema = createInsertSchema(repairOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  createdAt: true,
});

// User registration schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User login schema
export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type RepairOrder = typeof repairOrders.$inferSelect;
export type InsertRepairOrder = z.infer<typeof insertRepairOrderSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SystemHealth = typeof systemHealth.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
