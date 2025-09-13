import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { 
  adminOnly, 
  technicianOrAdmin, 
  clientOrAdmin, 
  authenticatedOnly,
  filterDataByRole,
  ensureOwnership,
  createClientOwnershipMiddleware
} from "./rbacMiddleware";
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

  // Create ownership middleware with storage access
  const clientOwnershipMiddleware = createClientOwnershipMiddleware(storage);

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

  // Dashboard metrics - Admin only
  app.get('/api/dashboard/metrics', adminOnly, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // System Health - Admin only
  app.get('/api/system/health', adminOnly, async (req, res) => {
    try {
      const healthRecords = await storage.getSystemHealth();
      res.json(healthRecords);
    } catch (error) {
      console.error("Error fetching system health:", error);
      res.status(500).json({ message: "Failed to fetch system health" });
    }
  });

  app.post('/api/system/health', adminOnly, async (req, res) => {
    try {
      const { component, status, responseTime, details } = req.body;
      const healthRecord = await storage.recordSystemHealth(component, status, responseTime, details);
      res.json(healthRecord);
    } catch (error) {
      console.error("Error recording system health:", error);
      res.status(500).json({ message: "Failed to record system health" });
    }
  });

  // Audit Logs - Admin only
  app.get('/api/audit-logs', adminOnly, async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const auditLogs = await storage.getAuditLogs(limit);
      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Customer routes - Admin only for full customer management
  app.get('/api/customers', adminOnly, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', adminOnly, ensureOwnership('customer'), async (req, res) => {
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

  // Vehicle routes - with role-based access control
  app.get('/api/customers/:customerId/vehicles', isAuthenticated, filterDataByRole, async (req: any, res) => {
    try {
      const roleContext = req.roleContext;
      const { customerId } = req.params;
      
      // For clients, ensure they can only access their own vehicles
      if (roleContext.role === 'client') {
        const customer = await storage.getCustomerByEmail(req.user.email);
        if (!customer || customer.id !== customerId) {
          return res.status(403).json({ message: "Access denied - you can only view your own vehicles" });
        }
      }
      
      const vehicles = await storage.getVehiclesByCustomer(customerId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.post('/api/vehicles', isAuthenticated, clientOwnershipMiddleware, async (req: any, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      
      // For clients, ensure they can only create vehicles for their own customer
      if (req.user.role === 'client' && req.clientCustomer) {
        vehicleData.customerId = req.clientCustomer.id;
      }
      
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
  app.get('/api/appointments', isAuthenticated, filterDataByRole, async (req: any, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const roleContext = req.roleContext;
      
      let appointments;
      
      if (roleContext.canAccessAll) {
        // Admins see all appointments
        appointments = await storage.getAppointments(startDate, endDate);
      } else if (roleContext.role === 'client') {
        // Clients see only their own appointments
        const customer = await storage.getCustomerByEmail(req.user.email);
        if (!customer) {
          return res.status(404).json({ message: "Customer profile not found" });
        }
        appointments = await storage.getAppointmentsByCustomer(customer.id, startDate, endDate);
      } else if (roleContext.canAccessAssigned) {
        // Technicians see only appointments for jobs assigned to them
        appointments = await storage.getAppointmentsByTechnician(roleContext.userId, startDate, endDate);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/appointments', isAuthenticated, clientOwnershipMiddleware, async (req: any, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        scheduledDate: new Date(req.body.scheduledDate)
      });
      
      // For clients, ensure they can only create appointments for their own customer
      if (req.user.role === 'client' && req.clientCustomer) {
        appointmentData.customerId = req.clientCustomer.id;
      }
      
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

  app.patch('/api/appointments/:id', isAuthenticated, clientOwnershipMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;
      
      // Verify ownership before updating
      const existingAppointment = await storage.getAppointment(id);
      if (!existingAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // For clients, ensure they can only update their own appointments
      if (userRole === 'client') {
        const customer = await storage.getCustomerByEmail(req.user.email);
        if (!customer || existingAppointment.customerId !== customer.id) {
          return res.status(403).json({ message: "Access denied - you can only update your own appointments" });
        }
      }
      
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

  // Repair Order routes - Technicians and Admins only
  app.get('/api/repair-orders', isAuthenticated, filterDataByRole, async (req: any, res) => {
    try {
      const roleContext = req.roleContext;
      let repairOrders;
      
      if (roleContext.canAccessAll) {
        // Admins see all repair orders
        repairOrders = await storage.getRepairOrders();
      } else if (roleContext.canAccessAssigned) {
        // Technicians see only assigned repair orders
        repairOrders = await storage.getRepairOrdersByTechnician(roleContext.userId);
      } else if (roleContext.role === 'client') {
        // Clients see only their own repair orders
        const customer = await storage.getCustomerByEmail(req.user.email);
        if (!customer) {
          return res.status(404).json({ message: "Customer profile not found" });
        }
        repairOrders = await storage.getRepairOrdersByCustomer(customer.id);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(repairOrders);
    } catch (error) {
      console.error("Error fetching repair orders:", error);
      res.status(500).json({ message: "Failed to fetch repair orders" });
    }
  });

  app.post('/api/repair-orders', isAuthenticated, clientOwnershipMiddleware, async (req: any, res) => {
    try {
      const repairOrderData = insertRepairOrderSchema.parse(req.body);
      
      // For clients, ensure they can only create repair orders for their own customer
      if (req.user.role === 'client' && req.clientCustomer) {
        repairOrderData.customerId = req.clientCustomer.id;
      }
      
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

  app.put('/api/repair-orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;
      
      // Verify ownership/assignment before updating
      const existingRepairOrder = await storage.getRepairOrder(id);
      if (!existingRepairOrder) {
        return res.status(404).json({ message: "Repair order not found" });
      }
      
      // For technicians, ensure they can only update assigned repair orders
      if (userRole === 'user' && existingRepairOrder.technicianId !== req.user.id) {
        return res.status(403).json({ message: "Access denied - you can only update repair orders assigned to you" });
      }
      
      // For clients, ensure they can only update their own repair orders
      if (userRole === 'client') {
        const customer = await storage.getCustomerByEmail(req.user.email);
        if (!customer || existingRepairOrder.customerId !== customer.id) {
          return res.status(403).json({ message: "Access denied - you can only update your own repair orders" });
        }
      }
      
      // Parse and validate the request body
      const repairOrderData = insertRepairOrderSchema.partial().parse(req.body);
      
      const repairOrder = await storage.updateRepairOrder(id, repairOrderData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_REPAIR_ORDER",
        entityType: "repair_order",
        entityId: repairOrder.id,
        newValues: repairOrder,
        status: "success",
      });

      res.json(repairOrder);
    } catch (error) {
      console.error("Error updating repair order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid repair order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update repair order" });
    }
  });

  // Invoice routes - Admin only for all invoices, clients see their own
  app.get('/api/invoices', isAuthenticated, filterDataByRole, async (req: any, res) => {
    try {
      const roleContext = req.roleContext;
      let invoices;
      
      if (roleContext.canAccessAll) {
        // Admins see all invoices
        invoices = await storage.getInvoices();
      } else if (roleContext.role === 'client') {
        // Clients see only their own invoices
        const customer = await storage.getCustomerByEmail(req.user.email);
        if (!customer) {
          return res.status(404).json({ message: "Customer profile not found" });
        }
        invoices = await storage.getInvoicesByCustomer(customer.id);
      } else {
        // Technicians have no access to invoices
        return res.status(403).json({ message: "Access denied - technicians cannot view invoices" });
      }
      
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post('/api/invoices', adminOnly, async (req: any, res) => {
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

  // Digital Inspection routes - Technicians and Admins only, clients can see their own
  app.get('/api/inspections', isAuthenticated, filterDataByRole, async (req: any, res) => {
    try {
      const roleContext = req.roleContext;
      let inspections;
      
      if (roleContext.canAccessAll) {
        // Admins see all inspections
        inspections = await storage.getInspections();
      } else if (roleContext.canAccessAssigned) {
        // Technicians see only inspections for jobs assigned to them
        inspections = await storage.getInspectionsByTechnician(roleContext.userId);
      } else if (roleContext.role === 'client') {
        // Clients can see their own inspections
        const customer = await storage.getCustomerByEmail(req.user.email);
        if (!customer) {
          return res.status(404).json({ message: "Customer profile not found" });
        }
        inspections = await storage.getInspectionsByCustomer(customer.id);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(inspections);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.post('/api/inspections', isAuthenticated, clientOwnershipMiddleware, async (req: any, res) => {
    try {
      const inspectionData = insertInspectionSchema.parse(req.body);
      
      // For clients, ensure they can only create inspections for their own customer
      if (req.user.role === 'client' && req.clientCustomer) {
        inspectionData.customerId = req.clientCustomer.id;
      }
      
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

  app.put('/api/inspections/:id', isAuthenticated, clientOwnershipMiddleware, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;
      
      // Verify inspection exists
      const existingInspection = await storage.getInspection(id);
      if (!existingInspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      // Parse and validate the request body
      const inspectionData = insertInspectionSchema.partial().parse(req.body);
      
      // For clients, override customerId to ensure they can only update their own data
      if (userRole === 'client' && req.clientCustomer) {
        // Verify they own this inspection
        if (existingInspection.customerId !== req.clientCustomer.id) {
          return res.status(403).json({ message: "Access denied - you can only update your own inspections" });
        }
        inspectionData.customerId = req.clientCustomer.id;
      }
      
      const inspection = await storage.updateInspection(id, inspectionData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_INSPECTION",
        entityType: "inspection",
        entityId: inspection.id,
        newValues: inspection,
        status: "success",
      });

      res.json(inspection);
    } catch (error) {
      console.error("Error updating inspection:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inspection data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update inspection" });
    }
  });

  // User routes
  app.get('/api/users', adminOnly, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Don't include password in response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id/role', adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      if (!['client', 'user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'client', 'user', or 'admin'" });
      }

      const updatedUser = await storage.updateUser(id, { role });
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_USER_ROLE",
        entityType: "user",
        entityId: id,
        oldValues: { role: "previous_role" }, // Would need to fetch previous value in a real implementation
        newValues: { role },
        status: "success",
      });

      // Don't include password in response
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
