import {
  users,
  customers,
  vehicles,
  appointments,
  repairOrders,
  invoices,
  auditLog,
  systemHealth,
  type User,
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
  type AuditLog,
  type InsertAuditLog,
  type SystemHealth,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Vehicle operations
  getVehiclesByCustomer(customerId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;

  // Appointment operations
  getAppointments(startDate?: Date, endDate?: Date): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;

  // Repair Order operations
  getRepairOrders(): Promise<RepairOrder[]>;
  getRepairOrder(id: string): Promise<RepairOrder | undefined>;
  createRepairOrder(repairOrder: InsertRepairOrder): Promise<RepairOrder>;
  updateRepairOrder(id: string, repairOrder: Partial<InsertRepairOrder>): Promise<RepairOrder>;

  // Invoice operations
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;

  // Audit Log operations
  createAuditLog(auditEntry: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  // System Health operations
  recordSystemHealth(component: string, status: string, responseTime?: number, details?: any): Promise<SystemHealth>;
  getSystemHealth(): Promise<SystemHealth[]>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalCustomers: number;
    totalVehicles: number;
    todayAppointments: number;
    activeRepairOrders: number;
    pendingInvoices: number;
    todayRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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

  // Vehicle operations
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
    return await db.select().from(repairOrders).orderBy(desc(repairOrders.createdAt));
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
}

export const storage = new DatabaseStorage();
