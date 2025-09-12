import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { 
  insertCustomerSchema,
  insertVehicleSchema,
  insertAppointmentSchema,
  insertRepairOrderSchema,
  insertInvoiceSchema,
  insertInspectionSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/logout', isAuthenticated, async (req: any, res) => {
    try {
      req.logout((err: any) => {
        if (err) {
          console.error("Error during logout:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        req.session.destroy((err: any) => {
          if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ message: "Failed to logout" });
          }
          res.clearCookie('connect.sid');
          res.json({ message: "Logged out successfully" });
        });
      });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // System Health
  app.get('/api/system/health', isAuthenticated, async (req, res) => {
    try {
      const healthRecords = await storage.getSystemHealth();
      res.json(healthRecords);
    } catch (error) {
      console.error("Error fetching system health:", error);
      res.status(500).json({ message: "Failed to fetch system health" });
    }
  });

  app.post('/api/system/health', isAuthenticated, async (req, res) => {
    try {
      const { component, status, responseTime, details } = req.body;
      const healthRecord = await storage.recordSystemHealth(component, status, responseTime, details);
      res.json(healthRecord);
    } catch (error) {
      console.error("Error recording system health:", error);
      res.status(500).json({ message: "Failed to record system health" });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const auditLogs = await storage.getAuditLogs(limit);
      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_CUSTOMER",
        entityType: "customer",
        entityId: customer.id,
        newValues: customer,
        status: "success",
      });

      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.patch('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const oldCustomer = await storage.getCustomer(req.params.id);
      if (!oldCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const customer = await storage.updateCustomer(req.params.id, customerData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_CUSTOMER",
        entityType: "customer",
        entityId: customer.id,
        oldValues: oldCustomer,
        newValues: customer,
        status: "success",
      });

      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete('/api/customers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      await storage.deleteCustomer(req.params.id);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "DELETE_CUSTOMER",
        entityType: "customer",
        entityId: req.params.id,
        oldValues: customer,
        status: "success",
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Vehicle routes
  app.get('/api/customers/:customerId/vehicles', isAuthenticated, async (req, res) => {
    try {
      const vehicles = await storage.getVehiclesByCustomer(req.params.customerId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.post('/api/vehicles', isAuthenticated, async (req: any, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_VEHICLE",
        entityType: "vehicle",
        entityId: vehicle.id,
        newValues: vehicle,
        status: "success",
      });

      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  // Appointment routes
  app.get('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const appointments = await storage.getAppointments(startDate, endDate);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        scheduledDate: new Date(req.body.scheduledDate)
      });
      const appointment = await storage.createAppointment(appointmentData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_APPOINTMENT",
        entityType: "appointment",
        entityId: appointment.id,
        newValues: appointment,
        status: "success",
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch('/api/appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const appointmentData = insertAppointmentSchema.partial().parse({
        ...req.body,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined
      });
      
      const appointment = await storage.updateAppointment(id, appointmentData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_APPOINTMENT",
        entityType: "appointment",
        entityId: appointment.id,
        newValues: appointment,
        status: "success",
      });

      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Repair Order routes
  app.get('/api/repair-orders', isAuthenticated, async (req, res) => {
    try {
      const repairOrders = await storage.getRepairOrders();
      res.json(repairOrders);
    } catch (error) {
      console.error("Error fetching repair orders:", error);
      res.status(500).json({ message: "Failed to fetch repair orders" });
    }
  });

  app.post('/api/repair-orders', isAuthenticated, async (req: any, res) => {
    try {
      const repairOrderData = insertRepairOrderSchema.parse(req.body);
      const repairOrder = await storage.createRepairOrder(repairOrderData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_REPAIR_ORDER",
        entityType: "repair_order",
        entityId: repairOrder.id,
        newValues: repairOrder,
        status: "success",
      });

      res.status(201).json(repairOrder);
    } catch (error) {
      console.error("Error creating repair order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid repair order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create repair order" });
    }
  });

  // Invoice routes
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_INVOICE",
        entityType: "invoice",
        entityId: invoice.id,
        newValues: invoice,
        status: "success",
      });

      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Inspections routes
  app.get('/api/inspections', isAuthenticated, async (req, res) => {
    try {
      const inspections = await storage.getInspections();
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.post('/api/inspections', isAuthenticated, async (req: any, res) => {
    try {
      const inspectionData = insertInspectionSchema.parse(req.body);
      const inspection = await storage.createInspection(inspectionData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_INSPECTION",
        entityType: "inspection",
        entityId: inspection.id,
        newValues: inspection,
        status: "success",
      });

      res.status(201).json(inspection);
    } catch (error) {
      console.error("Error creating inspection:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inspection data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inspection" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
