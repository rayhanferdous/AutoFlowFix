import {
  users,
  customers,
  vehicles,
  appointments,
  repairOrders,
  invoices,
  inspections,
  auditLog,
  systemHealth,
  inventory,
  businessSettings,
  operatingHours,
  notificationSettings,
  billingSettings,
  integrationSettings,
  securitySettings,
  reviewCampaigns,
  reviews,
  conversations,
  messages,
  type User,
  type InsertUser,
  type UpsertUser,
  type Customer,
  type InsertCustomer,
  type Vehicle,
  type InsertVehicle,
  type Appointment,
  type InsertAppointment,
  type RepairOrder,
  type InsertRepairOrder,
  type Invoice,
  type InsertInvoice,
  type Inspection,
  type InsertInspection,
  type AuditLog,
  type InsertAuditLog,
  type SystemHealth,
  type InventoryItem,
  type InsertInventoryItem,
  type BusinessSettings,
  type InsertBusinessSettings,
  type OperatingHours,
  type InsertOperatingHours,
  type NotificationSettings,
  type InsertNotificationSettings,
  type BillingSettings,
  type InsertBillingSettings,
  type IntegrationSettings,
  type InsertIntegrationSettings,
  type SecuritySettings,
  type InsertSecuritySettings,
  type ReviewCampaign,
  type InsertReviewCampaign,
  type Review,
  type InsertReview,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for authentication)
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerByUserId(userId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Vehicle operations
  getAllVehicles(): Promise<Vehicle[]>;
  getVehiclesByCustomer(customerId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;

  // Appointment operations
  getAppointments(startDate?: Date, endDate?: Date): Promise<Appointment[]>;
  getAppointmentsByCustomer(customerId: string, startDate?: Date, endDate?: Date): Promise<Appointment[]>;
  getAppointmentsByTechnician(technicianId: string, startDate?: Date, endDate?: Date): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;

  // Repair Order operations
  getRepairOrders(): Promise<RepairOrder[]>;
  getRepairOrdersByTechnician(technicianId: string): Promise<RepairOrder[]>;
  getRepairOrdersByCustomer(customerId: string): Promise<RepairOrder[]>;
  getRepairOrder(id: string): Promise<RepairOrder | undefined>;
  createRepairOrder(repairOrder: InsertRepairOrder): Promise<RepairOrder>;
  updateRepairOrder(id: string, repairOrder: Partial<InsertRepairOrder>): Promise<RepairOrder>;

  // Invoice operations
  getInvoices(): Promise<Invoice[]>;
  getInvoicesByCustomer(customerId: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;

  // Inspection operations
  getInspections(): Promise<Inspection[]>;
  getInspectionsByCustomer(customerId: string): Promise<Inspection[]>;
  getInspectionsByTechnician(technicianId: string): Promise<Inspection[]>;
  getInspection(id: string): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: string, inspection: Partial<InsertInspection>): Promise<Inspection>;
  deleteInspection(id: string): Promise<void>;

  // Audit Log operations
  createAuditLog(auditEntry: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  // System Health operations
  recordSystemHealth(component: string, status: string, responseTime?: number, details?: any): Promise<SystemHealth>;
  getSystemHealth(): Promise<SystemHealth[]>;

  // Inventory operations
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  getInventoryItemByPartNumber(partNumber: string): Promise<InventoryItem | undefined>;
  getLowStockItems(): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<void>;
  updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItem>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalCustomers: number;
    totalVehicles: number;
    todayAppointments: number;
    activeRepairOrders: number;
    pendingInvoices: number;
    todayRevenue: number;
  }>;

  // Analytics methods
  getRevenueAnalytics(startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    paidInvoices: number;
    averageInvoiceAmount: number;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  }>;

  getCustomerAnalytics(): Promise<{
    totalCustomers: number;
    newCustomersThisMonth: number;
    totalVehicles: number;
    activeCustomers: number;
    customersByMonth: Array<{ month: string; count: number }>;
  }>;

  getTechnicianAnalytics(): Promise<Array<{
    technicianId: string;
    technicianName: string;
    completedJobs: number;
    activeJobs: number;
    totalRevenue: number;
    averageCompletionTime: number;
  }>>;

  getInventoryAnalytics(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    categoriesCount: number;
    valueByCategory: Array<{ category: string; value: number }>;
  }>;

  // Settings operations
  getBusinessSettings(): Promise<BusinessSettings | null>;
  updateBusinessSettings(settings: Partial<InsertBusinessSettings>): Promise<BusinessSettings>;
  getOperatingHours(): Promise<OperatingHours[]>;
  updateOperatingHours(hours: InsertOperatingHours[]): Promise<OperatingHours[]>;
  getNotificationSettings(): Promise<NotificationSettings | null>;
  updateNotificationSettings(settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings>;
  getBillingSettings(): Promise<BillingSettings | null>;
  updateBillingSettings(settings: Partial<InsertBillingSettings>): Promise<BillingSettings>;
  getIntegrationSettings(): Promise<IntegrationSettings | null>;
  updateIntegrationSettings(settings: Partial<InsertIntegrationSettings>): Promise<IntegrationSettings>;
  getSecuritySettings(): Promise<SecuritySettings | null>;
  updateSecuritySettings(settings: Partial<InsertSecuritySettings>): Promise<SecuritySettings>;

  // Review Campaign operations
  getReviewCampaigns(): Promise<ReviewCampaign[]>;
  getReviewCampaign(id: string): Promise<ReviewCampaign | undefined>;
  createReviewCampaign(campaign: InsertReviewCampaign): Promise<ReviewCampaign>;
  updateReviewCampaign(id: string, campaign: Partial<InsertReviewCampaign>): Promise<ReviewCampaign>;
  deleteReviewCampaign(id: string): Promise<void>;
  updateCampaignStatus(id: string, status: string): Promise<ReviewCampaign>;

  // Review operations
  getReviews(): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByCampaign(campaignId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: string): Promise<void>;

  // Conversation operations (two-way texting)
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;

  // Message operations (SMS)
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message>;
  markConversationMessagesAsRead(conversationId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Helper method for audit logging
  private async logAudit(operation: string, entityType: string, entityId: string, details?: string): Promise<void> {
    await this.createAuditLog({
      userId: 'system',
      operation,
      entityType,
      entityId,
      status: 'success',
      details,
    });
  }

  // User operations (mandatory for authentication)
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  // Get customer by user email (for client user to customer mapping)
  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async getCustomerByUserId(userId: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.userId, userId));
    return customer;
  }

  // Vehicle operations
  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }

  async getVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.customerId, customerId));
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle> {
    const [updatedVehicle] = await db
      .update(vehicles)
      .set({ ...vehicle, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Appointment operations
  async getAppointments(startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    if (startDate && endDate) {
      return await db.select().from(appointments)
        .where(
          and(
            gte(appointments.scheduledDate, startDate),
            lte(appointments.scheduledDate, endDate)
          )
        )
        .orderBy(appointments.scheduledDate);
    }
    
    return await db.select().from(appointments).orderBy(appointments.scheduledDate);
  }

  // Get appointments filtered by customer (for client users)
  async getAppointmentsByCustomer(customerId: string, startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    if (startDate && endDate) {
      return await db.select().from(appointments)
        .where(
          and(
            eq(appointments.customerId, customerId),
            gte(appointments.scheduledDate, startDate),
            lte(appointments.scheduledDate, endDate)
          )
        )
        .orderBy(appointments.scheduledDate);
    }
    
    return await db.select().from(appointments)
      .where(eq(appointments.customerId, customerId))
      .orderBy(appointments.scheduledDate);
  }

  // Get appointments filtered by technician assignment (for technician users)
  async getAppointmentsByTechnician(technicianId: string, startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    const query = db.selectDistinct().from(appointments)
      .innerJoin(repairOrders, eq(repairOrders.appointmentId, appointments.id))
      .where(eq(repairOrders.technicianId, technicianId));

    if (startDate && endDate) {
      return await query
        .where(
          and(
            eq(repairOrders.technicianId, technicianId),
            gte(appointments.scheduledDate, startDate),
            lte(appointments.scheduledDate, endDate)
          )
        )
        .orderBy(desc(appointments.scheduledDate))
        .then(results => results.map(result => result.appointments));
    }
    
    return await query
      .orderBy(desc(appointments.scheduledDate))
      .then(results => results.map(result => result.appointments));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Repair Order operations
  async getRepairOrders(): Promise<RepairOrder[]> {
    const results = await db.select({
      repairOrder: repairOrders,
      customer: customers,
      vehicle: vehicles,
      technician: users,
    })
      .from(repairOrders)
      .leftJoin(customers, eq(repairOrders.customerId, customers.id))
      .leftJoin(vehicles, eq(repairOrders.vehicleId, vehicles.id))
      .leftJoin(users, eq(repairOrders.technicianId, users.id))
      .orderBy(desc(repairOrders.createdAt));
    
    return results.map(r => ({ ...r.repairOrder, customer: r.customer, vehicle: r.vehicle, technician: r.technician }));
  }

  async getRepairOrdersByTechnician(technicianId: string): Promise<RepairOrder[]> {
    const results = await db.select({
      repairOrder: repairOrders,
      customer: customers,
      vehicle: vehicles,
      technician: users,
    })
      .from(repairOrders)
      .leftJoin(customers, eq(repairOrders.customerId, customers.id))
      .leftJoin(vehicles, eq(repairOrders.vehicleId, vehicles.id))
      .leftJoin(users, eq(repairOrders.technicianId, users.id))
      .where(eq(repairOrders.technicianId, technicianId))
      .orderBy(desc(repairOrders.createdAt));
    
    return results.map(r => ({ ...r.repairOrder, customer: r.customer, vehicle: r.vehicle, technician: r.technician }));
  }

  // Get repair orders filtered by customer (for client users)
  async getRepairOrdersByCustomer(customerId: string): Promise<RepairOrder[]> {
    const results = await db.select({
      repairOrder: repairOrders,
      customer: customers,
      vehicle: vehicles,
      technician: users,
    })
      .from(repairOrders)
      .leftJoin(customers, eq(repairOrders.customerId, customers.id))
      .leftJoin(vehicles, eq(repairOrders.vehicleId, vehicles.id))
      .leftJoin(users, eq(repairOrders.technicianId, users.id))
      .where(eq(repairOrders.customerId, customerId))
      .orderBy(desc(repairOrders.createdAt));
    
    return results.map(r => ({ ...r.repairOrder, customer: r.customer, vehicle: r.vehicle, technician: r.technician }));
  }

  async getRepairOrder(id: string): Promise<RepairOrder | undefined> {
    const [repairOrder] = await db.select().from(repairOrders).where(eq(repairOrders.id, id));
    return repairOrder;
  }

  async createRepairOrder(repairOrder: InsertRepairOrder): Promise<RepairOrder> {
    const [newRepairOrder] = await db.insert(repairOrders).values(repairOrder).returning();
    return newRepairOrder;
  }

  async updateRepairOrder(id: string, repairOrder: Partial<InsertRepairOrder>): Promise<RepairOrder> {
    const [updatedRepairOrder] = await db
      .update(repairOrders)
      .set({ ...repairOrder, updatedAt: new Date() })
      .where(eq(repairOrders.id, id))
      .returning();
    return updatedRepairOrder;
  }

  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  // Get invoices filtered by customer (for client users)
  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    return await db.select().from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  // Inspection operations
  async getInspections(): Promise<Inspection[]> {
    return await db.select().from(inspections).orderBy(desc(inspections.createdAt));
  }

  // Get inspections filtered by customer (for client users)
  async getInspectionsByCustomer(customerId: string): Promise<Inspection[]> {
    return await db.select().from(inspections)
      .where(eq(inspections.customerId, customerId))
      .orderBy(desc(inspections.createdAt));
  }

  // Get inspections filtered by technician assignment (for technician users)
  async getInspectionsByTechnician(technicianId: string): Promise<Inspection[]> {
    return await db.select().from(inspections)
      .innerJoin(repairOrders, eq(inspections.repairOrderId, repairOrders.id))
      .where(eq(repairOrders.technicianId, technicianId))
      .orderBy(desc(inspections.createdAt))
      .then(results => results.map(result => result.inspections));
  }

  async getInspection(id: string): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
    return inspection;
  }

  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const [newInspection] = await db.insert(inspections).values(inspection).returning();
    return newInspection;
  }

  async updateInspection(id: string, inspection: Partial<InsertInspection>): Promise<Inspection> {
    const [updatedInspection] = await db
      .update(inspections)
      .set({ ...inspection, updatedAt: new Date() })
      .where(eq(inspections.id, id))
      .returning();
    return updatedInspection;
  }

  async deleteInspection(id: string): Promise<void> {
    await db.delete(inspections).where(eq(inspections.id, id));
  }

  // Audit Log operations
  async createAuditLog(auditEntry: InsertAuditLog): Promise<AuditLog> {
    const [newAuditLog] = await db.insert(auditLog).values(auditEntry).returning();
    return newAuditLog;
  }

  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    return await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
  }

  // System Health operations
  async recordSystemHealth(component: string, status: string, responseTime?: number, details?: any): Promise<SystemHealth> {
    const [healthRecord] = await db
      .insert(systemHealth)
      .values({
        component,
        status,
        responseTime,
        details,
      })
      .returning();
    return healthRecord;
  }

  async getSystemHealth(): Promise<SystemHealth[]> {
    return await db
      .select()
      .from(systemHealth)
      .orderBy(desc(systemHealth.checkedAt))
      .limit(20);
  }

  // Inventory operations
  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventory).orderBy(inventory.name);
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async getInventoryItemByPartNumber(partNumber: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.partNumber, partNumber));
    return item;
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventory)
      .where(sql`${inventory.quantity} <= ${inventory.minStock}`)
      .orderBy(inventory.name);
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const [updated] = await db
      .update(inventory)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return updated;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  async updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItem> {
    const [updated] = await db
      .update(inventory)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return updated;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalCustomers: number;
    totalVehicles: number;
    todayAppointments: number;
    activeRepairOrders: number;
    pendingInvoices: number;
    todayRevenue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalCustomersResult,
      totalVehiclesResult,
      todayAppointmentsResult,
      activeRepairOrdersResult,
      pendingInvoicesResult,
      todayRevenueResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(customers),
      db.select({ count: count() }).from(vehicles),
      db.select({ count: count() }).from(appointments).where(
        and(
          gte(appointments.scheduledDate, today),
          lte(appointments.scheduledDate, tomorrow)
        )
      ),
      db.select({ count: count() }).from(repairOrders).where(
        eq(repairOrders.status, "in_progress")
      ),
      db.select({ count: count() }).from(invoices).where(
        eq(invoices.status, "pending")
      ),
      db.select({ 
        total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` 
      }).from(invoices).where(
        and(
          gte(invoices.createdAt, today),
          lte(invoices.createdAt, tomorrow),
          eq(invoices.status, "paid")
        )
      ),
    ]);

    return {
      totalCustomers: totalCustomersResult[0]?.count ?? 0,
      totalVehicles: totalVehiclesResult[0]?.count ?? 0,
      todayAppointments: todayAppointmentsResult[0]?.count ?? 0,
      activeRepairOrders: activeRepairOrdersResult[0]?.count ?? 0,
      pendingInvoices: pendingInvoicesResult[0]?.count ?? 0,
      todayRevenue: Number(todayRevenueResult[0]?.total ?? 0),
    };
  }

  // Analytics methods
  async getRevenueAnalytics(startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    paidInvoices: number;
    averageInvoiceAmount: number;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  }> {
    const whereClause = startDate && endDate 
      ? and(
          gte(invoices.paidAt, startDate),
          lte(invoices.paidAt, endDate),
          eq(invoices.status, "paid")
        )
      : eq(invoices.status, "paid");

    const paidInvoicesData = await db
      .select()
      .from(invoices)
      .where(whereClause);

    const totalRevenue = paidInvoicesData.reduce((sum, inv) => sum + Number(inv.total), 0);
    const paidInvoices = paidInvoicesData.length;
    const averageInvoiceAmount = paidInvoices > 0 ? totalRevenue / paidInvoices : 0;

    // Group by month
    const revenueByMonth: { [key: string]: number } = {};
    paidInvoicesData.forEach((inv) => {
      if (inv.paidAt) {
        const monthKey = new Date(inv.paidAt).toISOString().slice(0, 7); // YYYY-MM
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + Number(inv.total);
      }
    });

    const revenueByMonthArray = Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue,
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalRevenue,
      paidInvoices,
      averageInvoiceAmount,
      revenueByMonth: revenueByMonthArray,
    };
  }

  async getCustomerAnalytics(): Promise<{
    totalCustomers: number;
    newCustomersThisMonth: number;
    totalVehicles: number;
    activeCustomers: number;
    customersByMonth: Array<{ month: string; count: number }>;
  }> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      allCustomers,
      totalVehiclesResult,
      newCustomersResult,
      activeAppointments,
    ] = await Promise.all([
      db.select().from(customers),
      db.select({ count: count() }).from(vehicles),
      db.select({ count: count() }).from(customers).where(gte(customers.createdAt, firstDayOfMonth)),
      db.select({ customerId: appointments.customerId }).from(appointments)
        .where(gte(appointments.scheduledDate, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)))
        .groupBy(appointments.customerId),
    ]);

    // Group customers by month
    const customersByMonth: { [key: string]: number } = {};
    allCustomers.forEach((customer) => {
      const monthKey = new Date(customer.createdAt).toISOString().slice(0, 7);
      customersByMonth[monthKey] = (customersByMonth[monthKey] || 0) + 1;
    });

    const customersByMonthArray = Object.entries(customersByMonth).map(([month, count]) => ({
      month,
      count,
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalCustomers: allCustomers.length,
      newCustomersThisMonth: newCustomersResult[0]?.count ?? 0,
      totalVehicles: totalVehiclesResult[0]?.count ?? 0,
      activeCustomers: activeAppointments.length,
      customersByMonth: customersByMonthArray,
    };
  }

  async getTechnicianAnalytics(): Promise<Array<{
    technicianId: string;
    technicianName: string;
    completedJobs: number;
    activeJobs: number;
    totalRevenue: number;
    averageCompletionTime: number;
  }>> {
    const technicians = await db.select().from(users).where(eq(users.role, "user"));
    
    const analyticsPromises = technicians.map(async (tech) => {
      const [completedOrders, activeOrders, techInvoices] = await Promise.all([
        db.select().from(repairOrders)
          .where(and(
            eq(repairOrders.technicianId, tech.id),
            eq(repairOrders.status, "completed")
          )),
        db.select({ count: count() }).from(repairOrders)
          .where(and(
            eq(repairOrders.technicianId, tech.id),
            eq(repairOrders.status, "in_progress")
          )),
        db.select().from(invoices)
          .innerJoin(repairOrders, eq(invoices.repairOrderId, repairOrders.id))
          .where(and(
            eq(repairOrders.technicianId, tech.id),
            eq(invoices.status, "paid")
          )),
      ]);

      const totalRevenue = techInvoices.reduce((sum, item) => sum + Number(item.invoices.total), 0);
      
      const completionTimes = completedOrders
        .filter(order => order.startedAt && order.completedAt)
        .map(order => {
          const start = new Date(order.startedAt!).getTime();
          const end = new Date(order.completedAt!).getTime();
          return (end - start) / (1000 * 60 * 60); // hours
        });

      const averageCompletionTime = completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

      return {
        technicianId: tech.id,
        technicianName: `${tech.firstName || ''} ${tech.lastName || ''}`.trim() || tech.username,
        completedJobs: completedOrders.length,
        activeJobs: activeOrders[0]?.count ?? 0,
        totalRevenue,
        averageCompletionTime,
      };
    });

    return await Promise.all(analyticsPromises);
  }

  async getInventoryAnalytics(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    categoriesCount: number;
    valueByCategory: Array<{ category: string; value: number }>;
  }> {
    const [allItems, lowStock] = await Promise.all([
      db.select().from(inventory),
      db.select({ count: count() }).from(inventory)
        .where(sql`${inventory.quantity} <= ${inventory.minStock}`),
    ]);

    const totalValue = allItems.reduce((sum, item) => 
      sum + (Number(item.unitCost) * item.quantity), 0
    );

    const categories = new Set(allItems.map(item => item.category));
    
    const valueByCategory: { [key: string]: number } = {};
    allItems.forEach((item) => {
      const value = Number(item.unitCost) * item.quantity;
      valueByCategory[item.category] = (valueByCategory[item.category] || 0) + value;
    });

    const valueByCategoryArray = Object.entries(valueByCategory).map(([category, value]) => ({
      category,
      value,
    })).sort((a, b) => b.value - a.value);

    return {
      totalItems: allItems.length,
      totalValue,
      lowStockItems: lowStock[0]?.count ?? 0,
      categoriesCount: categories.size,
      valueByCategory: valueByCategoryArray,
    };
  }

  // Settings operations
  async getBusinessSettings(): Promise<BusinessSettings | null> {
    const settings = await db.select().from(businessSettings).limit(1);
    return settings[0] || null;
  }

  async updateBusinessSettings(settings: Partial<InsertBusinessSettings>): Promise<BusinessSettings> {
    const existing = await this.getBusinessSettings();
    
    if (existing) {
      const updated = await db
        .update(businessSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(businessSettings.id, existing.id))
        .returning();
      
      await this.logAudit("UPDATE", "business_settings", existing.id, `Updated business settings`);
      return updated[0];
    } else {
      const created = await db.insert(businessSettings).values(settings).returning();
      await this.logAudit("CREATE", "business_settings", created[0].id, `Created business settings`);
      return created[0];
    }
  }

  async getOperatingHours(): Promise<OperatingHours[]> {
    const hours = await db.select().from(operatingHours).orderBy(operatingHours.dayOfWeek);
    
    // Ensure all days are present (0-6 for Sunday-Saturday)
    const allDays = Array.from({ length: 7 }, (_, i) => i);
    const existingDays = new Set(hours.map(h => h.dayOfWeek));
    
    const missingDays = allDays.filter(day => !existingDays.has(day));
    if (missingDays.length > 0) {
      const defaultHours = missingDays.map(day => ({
        dayOfWeek: day,
        isOpen: day !== 0, // Sunday closed by default
        openTime: "08:00",
        closeTime: "18:00",
      }));
      
      const created = await db.insert(operatingHours).values(defaultHours).returning();
      return [...hours, ...created].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    }
    
    return hours;
  }

  async updateOperatingHours(hoursArray: InsertOperatingHours[]): Promise<OperatingHours[]> {
    // Delete all existing hours
    await db.delete(operatingHours);
    
    // Insert new hours
    const created = await db.insert(operatingHours).values(hoursArray).returning();
    
    await this.logAudit("UPDATE", "operating_hours", "all", `Updated operating hours for all days`);
    return created.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }

  async getNotificationSettings(): Promise<NotificationSettings | null> {
    const settings = await db.select().from(notificationSettings).limit(1);
    return settings[0] || null;
  }

  async updateNotificationSettings(settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings> {
    const existing = await this.getNotificationSettings();
    
    if (existing) {
      const updated = await db
        .update(notificationSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(notificationSettings.id, existing.id))
        .returning();
      
      await this.logAudit("UPDATE", "notification_settings", existing.id, `Updated notification settings`);
      return updated[0];
    } else {
      const created = await db.insert(notificationSettings).values(settings).returning();
      await this.logAudit("CREATE", "notification_settings", created[0].id, `Created notification settings`);
      return created[0];
    }
  }

  async getBillingSettings(): Promise<BillingSettings | null> {
    const settings = await db.select().from(billingSettings).limit(1);
    return settings[0] || null;
  }

  async updateBillingSettings(settings: Partial<InsertBillingSettings>): Promise<BillingSettings> {
    const existing = await this.getBillingSettings();
    
    if (existing) {
      const updated = await db
        .update(billingSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(billingSettings.id, existing.id))
        .returning();
      
      await this.logAudit("UPDATE", "billing_settings", existing.id, `Updated billing settings`);
      return updated[0];
    } else {
      const created = await db.insert(billingSettings).values(settings).returning();
      await this.logAudit("CREATE", "billing_settings", created[0].id, `Created billing settings`);
      return created[0];
    }
  }

  async getIntegrationSettings(): Promise<IntegrationSettings | null> {
    const settings = await db.select().from(integrationSettings).limit(1);
    return settings[0] || null;
  }

  async updateIntegrationSettings(settings: Partial<InsertIntegrationSettings>): Promise<IntegrationSettings> {
    const existing = await this.getIntegrationSettings();
    
    if (existing) {
      const updated = await db
        .update(integrationSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(integrationSettings.id, existing.id))
        .returning();
      
      await this.logAudit("UPDATE", "integration_settings", existing.id, `Updated integration settings`);
      return updated[0];
    } else {
      const created = await db.insert(integrationSettings).values(settings).returning();
      await this.logAudit("CREATE", "integration_settings", created[0].id, `Created integration settings`);
      return created[0];
    }
  }

  async getSecuritySettings(): Promise<SecuritySettings | null> {
    const settings = await db.select().from(securitySettings).limit(1);
    return settings[0] || null;
  }

  async updateSecuritySettings(settings: Partial<InsertSecuritySettings>): Promise<SecuritySettings> {
    const existing = await this.getSecuritySettings();
    
    if (existing) {
      const updated = await db
        .update(securitySettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(securitySettings.id, existing.id))
        .returning();
      
      await this.logAudit("UPDATE", "security_settings", existing.id, `Updated security settings`);
      return updated[0];
    } else {
      const created = await db.insert(securitySettings).values(settings).returning();
      await this.logAudit("CREATE", "security_settings", created[0].id, `Created security settings`);
      return created[0];
    }
  }

  // Review Campaign operations
  async getReviewCampaigns(): Promise<ReviewCampaign[]> {
    return await db.select().from(reviewCampaigns).orderBy(desc(reviewCampaigns.createdAt));
  }

  async getReviewCampaign(id: string): Promise<ReviewCampaign | undefined> {
    const campaign = await db.select().from(reviewCampaigns).where(eq(reviewCampaigns.id, id)).limit(1);
    return campaign[0];
  }

  async createReviewCampaign(campaign: InsertReviewCampaign): Promise<ReviewCampaign> {
    const created = await db.insert(reviewCampaigns).values(campaign).returning();
    await this.logAudit("CREATE", "review_campaigns", created[0].id, `Created review campaign: ${created[0].name}`);
    return created[0];
  }

  async updateReviewCampaign(id: string, campaign: Partial<InsertReviewCampaign>): Promise<ReviewCampaign> {
    const updated = await db
      .update(reviewCampaigns)
      .set({ ...campaign, updatedAt: new Date() })
      .where(eq(reviewCampaigns.id, id))
      .returning();
    
    if (!updated[0]) {
      throw new Error("Campaign not found");
    }
    
    await this.logAudit("UPDATE", "review_campaigns", id, `Updated review campaign: ${updated[0].name}`);
    return updated[0];
  }

  async deleteReviewCampaign(id: string): Promise<void> {
    await db.delete(reviewCampaigns).where(eq(reviewCampaigns.id, id));
    await this.logAudit("DELETE", "review_campaigns", id, `Deleted review campaign`);
  }

  async updateCampaignStatus(id: string, status: string): Promise<ReviewCampaign> {
    const updated = await db
      .update(reviewCampaigns)
      .set({ status, updatedAt: new Date() })
      .where(eq(reviewCampaigns.id, id))
      .returning();
    
    if (!updated[0]) {
      throw new Error("Campaign not found");
    }
    
    await this.logAudit("UPDATE", "review_campaigns", id, `Updated campaign status to: ${status}`);
    return updated[0];
  }

  // Review operations
  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getReview(id: string): Promise<Review | undefined> {
    const review = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return review[0];
  }

  async getReviewsByCampaign(campaignId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.campaignId, campaignId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const created = await db.insert(reviews).values(review).returning();
    
    // Update campaign response count if linked to a campaign
    if (created[0].campaignId) {
      await db
        .update(reviewCampaigns)
        .set({ 
          responseCount: sql`${reviewCampaigns.responseCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(reviewCampaigns.id, created[0].campaignId));
    }
    
    await this.logAudit("CREATE", "reviews", created[0].id, `New review received (${created[0].rating} stars)`);
    return created[0];
  }

  async updateReview(id: string, review: Partial<InsertReview>): Promise<Review> {
    const updated = await db
      .update(reviews)
      .set(review)
      .where(eq(reviews.id, id))
      .returning();
    
    if (!updated[0]) {
      throw new Error("Review not found");
    }
    
    await this.logAudit("UPDATE", "reviews", id, `Updated review`);
    return updated[0];
  }

  async deleteReview(id: string): Promise<void> {
    // Get the review to check if it's linked to a campaign
    const review = await this.getReview(id);
    
    await db.delete(reviews).where(eq(reviews.id, id));
    
    // Update campaign response count if it was linked
    if (review?.campaignId) {
      await db
        .update(reviewCampaigns)
        .set({ 
          responseCount: sql`${reviewCampaigns.responseCount} - 1`,
          updatedAt: new Date()
        })
        .where(eq(reviewCampaigns.id, review.campaignId));
    }
    
    await this.logAudit("DELETE", "reviews", id, `Deleted review`);
  }

  // Conversation operations (two-way texting)
  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.lastMessageAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    // Convert ISO string timestamps to Date objects
    const conversationData = {
      ...conversation,
      lastMessageAt: conversation.lastMessageAt 
        ? (typeof conversation.lastMessageAt === 'string' ? new Date(conversation.lastMessageAt) : conversation.lastMessageAt)
        : undefined
    };
    
    const created = await db.insert(conversations).values(conversationData).returning();
    await this.logAudit("CREATE", "conversations", created[0].id, `Created conversation with ${created[0].customerName}`);
    return created[0];
  }

  async updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation> {
    // Convert ISO string timestamps to Date objects
    const conversationData = {
      ...conversation,
      lastMessageAt: conversation.lastMessageAt 
        ? (typeof conversation.lastMessageAt === 'string' ? new Date(conversation.lastMessageAt) : conversation.lastMessageAt)
        : undefined,
      updatedAt: new Date()
    };
    
    const updated = await db
      .update(conversations)
      .set(conversationData)
      .where(eq(conversations.id, id))
      .returning();
    
    if (!updated[0]) {
      throw new Error("Conversation not found");
    }
    
    return updated[0];
  }

  async deleteConversation(id: string): Promise<void> {
    // Delete all messages in the conversation first
    await db.delete(messages).where(eq(messages.conversationId, id));
    // Then delete the conversation
    await db.delete(conversations).where(eq(conversations.id, id));
    await this.logAudit("DELETE", "conversations", id, `Deleted conversation`);
  }

  // Message operations (SMS)
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const created = await db.insert(messages).values(message).returning();
    
    // Update conversation with last message and timestamp
    await db
      .update(conversations)
      .set({
        lastMessage: created[0].content,
        lastMessageAt: created[0].createdAt,
        unreadCount: message.direction === 'inbound' ? sql`${conversations.unreadCount} + 1` : conversations.unreadCount,
        updatedAt: new Date()
      })
      .where(eq(conversations.id, created[0].conversationId));
    
    await this.logAudit("CREATE", "messages", created[0].id, `Message ${message.direction}`);
    return created[0];
  }

  async markMessageAsRead(id: string): Promise<Message> {
    const updated = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    
    if (!updated[0]) {
      throw new Error("Message not found");
    }
    
    return updated[0];
  }

  async markConversationMessagesAsRead(conversationId: string): Promise<void> {
    // Mark all unread messages in this conversation as read
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isRead, false)
        )
      );
    
    // Reset unread count on conversation
    await db
      .update(conversations)
      .set({ unreadCount: 0, updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));
  }
}

export const storage = new DatabaseStorage();
