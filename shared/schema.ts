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

// Inventory table for parts and supplies
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  partNumber: varchar("part_number", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  quantity: integer("quantity").default(0).notNull(),
  minStock: integer("min_stock").default(0).notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
  supplier: varchar("supplier", { length: 200 }),
  supplierPartNumber: varchar("supplier_part_number", { length: 100 }),
  location: varchar("location", { length: 100 }),
  lastOrdered: timestamp("last_ordered"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business Settings table
export const businessSettings = pgTable("business_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: varchar("business_name", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 100 }),
  website: varchar("website", { length: 200 }),
  address: text("address"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Operating Hours table
export const operatingHours = pgTable("operating_hours", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  isOpen: boolean("is_open").default(true).notNull(),
  openTime: varchar("open_time", { length: 10 }), // HH:MM format
  closeTime: varchar("close_time", { length: 10 }), // HH:MM format
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification Settings table
export const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  smsNotifications: boolean("sms_notifications").default(false).notNull(),
  appointmentReminders: boolean("appointment_reminders").default(true).notNull(),
  paymentNotifications: boolean("payment_notifications").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing Settings table
export const billingSettings = pgTable("billing_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  planName: varchar("plan_name", { length: 100 }),
  planPrice: varchar("plan_price", { length: 20 }),
  billingCycle: varchar("billing_cycle", { length: 20 }), // monthly, yearly
  paymentMethod: varchar("payment_method", { length: 50 }),
  cardLast4: varchar("card_last4", { length: 4 }),
  cardExpiry: varchar("card_expiry", { length: 10 }),
  nextBillingDate: timestamp("next_billing_date"),
  autoRenew: boolean("auto_renew").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integration Settings table
export const integrationSettings = pgTable("integration_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  googleReviewsEnabled: boolean("google_reviews_enabled").default(false).notNull(),
  googleReviewsApiKey: text("google_reviews_api_key"),
  stripeEnabled: boolean("stripe_enabled").default(false).notNull(),
  stripeApiKey: text("stripe_api_key"),
  stripePublishableKey: text("stripe_publishable_key"),
  twilioEnabled: boolean("twilio_enabled").default(false).notNull(),
  twilioAccountSid: text("twilio_account_sid"),
  twilioAuthToken: text("twilio_auth_token"),
  twilioPhoneNumber: varchar("twilio_phone_number", { length: 20 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security Settings table
export const securitySettings = pgTable("security_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  sessionTimeout: integer("session_timeout").default(30).notNull(), // minutes
  passwordMinLength: integer("password_min_length").default(8).notNull(),
  requireSpecialChar: boolean("require_special_char").default(true).notNull(),
  requireNumbers: boolean("require_numbers").default(true).notNull(),
  requireUppercase: boolean("require_uppercase").default(true).notNull(),
  ipWhitelist: text("ip_whitelist").array(),
  loginAttemptsLimit: integer("login_attempts_limit").default(5).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Review Campaigns table
export const reviewCampaigns = pgTable("review_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, paused, inactive
  trigger: varchar("trigger", { length: 50 }).notNull(), // post_service, monthly, manual
  delayDays: integer("delay_days").default(1).notNull(), // days after trigger
  emailTemplate: text("email_template"),
  smsTemplate: text("sms_template"),
  sentCount: integer("sent_count").default(0).notNull(),
  responseCount: integer("response_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id),
  campaignId: uuid("campaign_id").references(() => reviewCampaigns.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  platform: varchar("platform", { length: 50 }), // Google, Yelp, Facebook, etc.
  isPublic: boolean("is_public").default(true).notNull(),
  responseText: text("response_text"), // Business response to review
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertInventorySchema = createInsertSchema(inventory)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    unitCost: z.coerce.number().min(0, "Unit cost must be positive"),
    sellingPrice: z.coerce.number().min(0, "Selling price must be positive").optional(),
    quantity: z.coerce.number().int().min(0, "Quantity must be 0 or greater"),
    minStock: z.coerce.number().int().min(0, "Min stock must be 0 or greater"),
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
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventorySchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

// Settings schemas
export const insertBusinessSettingsSchema = createInsertSchema(businessSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertOperatingHoursSchema = createInsertSchema(operatingHours).omit({
  id: true,
  updatedAt: true,
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertBillingSettingsSchema = createInsertSchema(billingSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertIntegrationSettingsSchema = createInsertSchema(integrationSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertSecuritySettingsSchema = createInsertSchema(securitySettings).omit({
  id: true,
  updatedAt: true,
});

// Settings types
export type BusinessSettings = typeof businessSettings.$inferSelect;
export type InsertBusinessSettings = z.infer<typeof insertBusinessSettingsSchema>;
export type OperatingHours = typeof operatingHours.$inferSelect;
export type InsertOperatingHours = z.infer<typeof insertOperatingHoursSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type BillingSettings = typeof billingSettings.$inferSelect;
export type InsertBillingSettings = z.infer<typeof insertBillingSettingsSchema>;
export type IntegrationSettings = typeof integrationSettings.$inferSelect;
export type InsertIntegrationSettings = z.infer<typeof insertIntegrationSettingsSchema>;
export type SecuritySettings = typeof securitySettings.$inferSelect;
export type InsertSecuritySettings = z.infer<typeof insertSecuritySettingsSchema>;

// Review Campaign schemas
export const insertReviewCampaignSchema = createInsertSchema(reviewCampaigns).omit({
  id: true,
  sentCount: true,
  responseCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Review types
export type ReviewCampaign = typeof reviewCampaigns.$inferSelect;
export type InsertReviewCampaign = z.infer<typeof insertReviewCampaignSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Conversations table for two-way texting
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, archived
  unreadCount: integer("unread_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table for SMS messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").references(() => conversations.id).notNull(),
  direction: varchar("direction", { length: 20 }).notNull(), // inbound, outbound
  content: text("content").notNull(),
  phoneFrom: varchar("phone_from", { length: 20 }).notNull(),
  phoneTo: varchar("phone_to", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("sent").notNull(), // sent, delivered, failed, received
  isRead: boolean("is_read").default(false).notNull(),
  twilioSid: varchar("twilio_sid", { length: 100 }), // Twilio message SID if sent via Twilio
  sentBy: uuid("sent_by").references(() => users.id), // User who sent the message (for outbound)
  createdAt: timestamp("created_at").defaultNow(),
});

// Messaging schemas
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Messaging types
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
