import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
  insertInventorySchema,
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

  // Analytics endpoints - Admin only
  app.get('/api/analytics/revenue', adminOnly, async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const analytics = await storage.getRevenueAnalytics(startDate, endDate);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get('/api/analytics/customers', adminOnly, async (req, res) => {
    try {
      const analytics = await storage.getCustomerAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
    }
  });

  app.get('/api/analytics/technicians', adminOnly, async (req, res) => {
    try {
      const analytics = await storage.getTechnicianAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching technician analytics:", error);
      res.status(500).json({ message: "Failed to fetch technician analytics" });
    }
  });

  app.get('/api/analytics/inventory', adminOnly, async (req, res) => {
    try {
      const analytics = await storage.getInventoryAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching inventory analytics:", error);
      res.status(500).json({ message: "Failed to fetch inventory analytics" });
    }
  });

  // Settings endpoints - Admin only
  app.get('/api/settings/business', adminOnly, async (req, res) => {
    try {
      const settings = await storage.getBusinessSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching business settings:", error);
      res.status(500).json({ message: "Failed to fetch business settings" });
    }
  });

  app.put('/api/settings/business', adminOnly, async (req, res) => {
    try {
      const { insertBusinessSettingsSchema } = await import('@shared/schema');
      const updateSchema = insertBusinessSettingsSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const settings = await storage.updateBusinessSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating business settings:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data provided" });
      }
      res.status(500).json({ message: "Failed to update business settings" });
    }
  });

  app.get('/api/settings/hours', adminOnly, async (req, res) => {
    try {
      const hours = await storage.getOperatingHours();
      res.json(hours);
    } catch (error) {
      console.error("Error fetching operating hours:", error);
      res.status(500).json({ message: "Failed to fetch operating hours" });
    }
  });

  app.put('/api/settings/hours', adminOnly, async (req, res) => {
    try {
      const { insertOperatingHoursSchema } = await import('@shared/schema');
      const { z } = await import('zod');
      const hoursArraySchema = z.array(insertOperatingHoursSchema);
      const validatedData = hoursArraySchema.parse(req.body);
      const hours = await storage.updateOperatingHours(validatedData);
      res.json(hours);
    } catch (error) {
      console.error("Error updating operating hours:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data provided" });
      }
      res.status(500).json({ message: "Failed to update operating hours" });
    }
  });

  app.get('/api/settings/notifications', adminOnly, async (req, res) => {
    try {
      const settings = await storage.getNotificationSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put('/api/settings/notifications', adminOnly, async (req, res) => {
    try {
      const { insertNotificationSettingsSchema } = await import('@shared/schema');
      const updateSchema = insertNotificationSettingsSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const settings = await storage.updateNotificationSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data provided" });
      }
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  app.get('/api/settings/billing', adminOnly, async (req, res) => {
    try {
      const settings = await storage.getBillingSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching billing settings:", error);
      res.status(500).json({ message: "Failed to fetch billing settings" });
    }
  });

  app.put('/api/settings/billing', adminOnly, async (req, res) => {
    try {
      const { insertBillingSettingsSchema } = await import('@shared/schema');
      const updateSchema = insertBillingSettingsSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const settings = await storage.updateBillingSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating billing settings:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data provided" });
      }
      res.status(500).json({ message: "Failed to update billing settings" });
    }
  });

  app.get('/api/settings/integrations', adminOnly, async (req, res) => {
    try {
      const settings = await storage.getIntegrationSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching integration settings:", error);
      res.status(500).json({ message: "Failed to fetch integration settings" });
    }
  });

  app.put('/api/settings/integrations', adminOnly, async (req, res) => {
    try {
      const { insertIntegrationSettingsSchema } = await import('@shared/schema');
      const updateSchema = insertIntegrationSettingsSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const settings = await storage.updateIntegrationSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating integration settings:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data provided" });
      }
      res.status(500).json({ message: "Failed to update integration settings" });
    }
  });

  app.get('/api/settings/security', adminOnly, async (req, res) => {
    try {
      const settings = await storage.getSecuritySettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching security settings:", error);
      res.status(500).json({ message: "Failed to fetch security settings" });
    }
  });

  app.put('/api/settings/security', adminOnly, async (req, res) => {
    try {
      const { insertSecuritySettingsSchema } = await import('@shared/schema');
      const updateSchema = insertSecuritySettingsSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const settings = await storage.updateSecuritySettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating security settings:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data provided" });
      }
      res.status(500).json({ message: "Failed to update security settings" });
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
  // Get current user's customer profile (for clients)
  app.get('/api/customers/me', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role === 'admin') {
        return res.status(403).json({ message: "Admins don't have customer profiles" });
      }
      
      const customer = await storage.getCustomerByUserId(req.user.id);
      
      if (!customer) {
        return res.status(404).json({ message: "No customer profile found for this user" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      res.status(500).json({ message: "Failed to fetch customer profile" });
    }
  });

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

  // Create vehicle for a specific customer
  app.post('/api/customers/:customerId/vehicles', isAuthenticated, filterDataByRole, async (req: any, res) => {
    try {
      const { customerId } = req.params;
      const roleContext = req.roleContext;
      
      // For clients, ensure they can only create vehicles for their own customer
      if (roleContext.role === 'client') {
        const customer = await storage.getCustomerByEmail(req.user.email);
        if (!customer || customer.id !== customerId) {
          return res.status(403).json({ message: "Access denied - you can only create vehicles for your own profile" });
        }
      }
      
      // Parse and validate vehicle data
      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        customerId, // Override customerId from URL param
      });
      
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

  // Get all vehicles (role-aware)
  app.get('/api/vehicles', isAuthenticated, clientOwnershipMiddleware, async (req: any, res) => {
    try {
      let vehicles;
      
      if (req.user.role === 'admin') {
        // Admins see all vehicles
        vehicles = await storage.getAllVehicles();
      } else if (req.clientCustomer) {
        // Clients see only their vehicles
        vehicles = await storage.getVehiclesByCustomer(req.clientCustomer.id);
      } else {
        return res.status(403).json({ message: "No customer profile found for this user" });
      }

      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  // Get a specific vehicle
  app.get('/api/vehicles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check ownership for non-admin users
      if (req.user.role !== 'admin') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer || vehicle.customerId !== customer.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  // Update a vehicle
  app.patch('/api/vehicles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check ownership for non-admin users
      if (req.user.role !== 'admin') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer || vehicle.customerId !== customer.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      const updatedVehicle = await storage.updateVehicle(req.params.id, vehicleData);

      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_VEHICLE",
        entityType: "vehicle",
        entityId: req.params.id,
        oldValues: vehicle,
        newValues: updatedVehicle,
        status: "success",
      });

      res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  // Delete a vehicle
  app.delete('/api/vehicles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check ownership for non-admin users
      if (req.user.role !== 'admin') {
        const customer = await storage.getCustomerByUserId(req.user.id);
        if (!customer || vehicle.customerId !== customer.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      await storage.deleteVehicle(req.params.id);

      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "DELETE_VEHICLE",
        entityType: "vehicle",
        entityId: req.params.id,
        oldValues: vehicle,
        status: "success",
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ message: "Failed to delete vehicle" });
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

  // Inventory routes - Technicians and Admins only
  app.get('/api/inventory', technicianOrAdmin, async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get('/api/inventory/low-stock', technicianOrAdmin, async (req, res) => {
    try {
      const items = await storage.getLowStockItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.get('/api/inventory/:id', technicianOrAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getInventoryItem(id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });

  app.post('/api/inventory', adminOnly, async (req: any, res) => {
    try {
      const itemData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_INVENTORY_ITEM",
        entityType: "inventory",
        entityId: item.id,
        newValues: item,
        status: "success",
      });

      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.patch('/api/inventory/:id', adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const itemData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(id, itemData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_INVENTORY_ITEM",
        entityType: "inventory",
        entityId: id,
        newValues: itemData,
        status: "success",
      });

      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.patch('/api/inventory/:id/quantity', technicianOrAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const item = await storage.updateInventoryQuantity(id, quantity);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_INVENTORY_QUANTITY",
        entityType: "inventory",
        entityId: id,
        newValues: { quantity },
        status: "success",
      });

      res.json(item);
    } catch (error) {
      console.error("Error updating inventory quantity:", error);
      res.status(500).json({ message: "Failed to update inventory quantity" });
    }
  });

  app.delete('/api/inventory/:id', adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteInventoryItem(id);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "DELETE_INVENTORY_ITEM",
        entityType: "inventory",
        entityId: id,
        status: "success",
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Review Campaign Routes (Admin only)
  app.get('/api/campaigns', adminOnly, async (req, res) => {
    try {
      const campaigns = await storage.getReviewCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching review campaigns:", error);
      res.status(500).json({ message: "Failed to fetch review campaigns" });
    }
  });

  app.get('/api/campaigns/:id', adminOnly, async (req, res) => {
    try {
      const { id } = req.params;
      const campaign = await storage.getReviewCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching review campaign:", error);
      res.status(500).json({ message: "Failed to fetch review campaign" });
    }
  });

  app.post('/api/campaigns', adminOnly, async (req: any, res) => {
    try {
      const { insertReviewCampaignSchema } = await import('@shared/schema');
      const validatedData = insertReviewCampaignSchema.parse(req.body);
      const campaign = await storage.createReviewCampaign(validatedData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_CAMPAIGN",
        entityType: "review_campaigns",
        entityId: campaign.id,
        status: "success",
      });
      
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating review campaign:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid campaign data", errors: error });
      }
      res.status(500).json({ message: "Failed to create review campaign" });
    }
  });

  app.patch('/api/campaigns/:id', adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const campaign = await storage.updateReviewCampaign(id, req.body);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_CAMPAIGN",
        entityType: "review_campaigns",
        entityId: id,
        status: "success",
      });
      
      res.json(campaign);
    } catch (error) {
      console.error("Error updating review campaign:", error);
      res.status(500).json({ message: "Failed to update review campaign" });
    }
  });

  app.patch('/api/campaigns/:id/status', adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const campaign = await storage.updateCampaignStatus(id, status);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_CAMPAIGN_STATUS",
        entityType: "review_campaigns",
        entityId: id,
        status: "success",
      });
      
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign status:", error);
      res.status(500).json({ message: "Failed to update campaign status" });
    }
  });

  app.delete('/api/campaigns/:id', adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteReviewCampaign(id);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "DELETE_CAMPAIGN",
        entityType: "review_campaigns",
        entityId: id,
        status: "success",
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review campaign:", error);
      res.status(500).json({ message: "Failed to delete review campaign" });
    }
  });

  // Review Routes (Admin only)
  app.get('/api/reviews', adminOnly, async (req, res) => {
    try {
      const { campaignId } = req.query;
      
      let reviews;
      if (campaignId && typeof campaignId === 'string') {
        reviews = await storage.getReviewsByCampaign(campaignId);
      } else {
        reviews = await storage.getReviews();
      }
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/reviews/:id', adminOnly, async (req, res) => {
    try {
      const { id } = req.params;
      const review = await storage.getReview(id);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ message: "Failed to fetch review" });
    }
  });

  app.post('/api/reviews', adminOnly, async (req: any, res) => {
    try {
      const review = await storage.createReview(req.body);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_REVIEW",
        entityType: "reviews",
        entityId: review.id,
        status: "success",
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.patch('/api/reviews/:id', adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const review = await storage.updateReview(id, req.body);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_REVIEW",
        entityType: "reviews",
        entityId: id,
        status: "success",
      });
      
      res.json(review);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete('/api/reviews/:id', adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteReview(id);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "DELETE_REVIEW",
        entityType: "reviews",
        entityId: id,
        status: "success",
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Conversation Routes (Messaging System)
  app.get('/api/conversations', authenticatedOnly, async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id', authenticatedOnly, async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post('/api/conversations', authenticatedOnly, async (req: any, res) => {
    try {
      const { insertConversationSchema } = await import('@shared/schema');
      
      // Convert timestamp strings to Date objects before validation
      const bodyWithDates = {
        ...req.body,
        lastMessageAt: req.body.lastMessageAt ? new Date(req.body.lastMessageAt) : undefined,
      };
      
      const validatedData = insertConversationSchema.parse(bodyWithDates);
      const conversation = await storage.createConversation(validatedData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "CREATE_CONVERSATION",
        entityType: "conversations",
        entityId: conversation.id,
        status: "success",
      });
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid conversation data", errors: error });
      }
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.patch('/api/conversations/:id', authenticatedOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Convert timestamp strings to Date objects before updating
      const bodyWithDates = {
        ...req.body,
        lastMessageAt: req.body.lastMessageAt ? new Date(req.body.lastMessageAt) : undefined,
      };
      
      const conversation = await storage.updateConversation(id, bodyWithDates);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "UPDATE_CONVERSATION",
        entityType: "conversations",
        entityId: id,
        status: "success",
      });
      
      res.json(conversation);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });

  app.delete('/api/conversations/:id', authenticatedOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteConversation(id);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "DELETE_CONVERSATION",
        entityType: "conversations",
        entityId: id,
        status: "success",
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Message Routes
  app.get('/api/conversations/:conversationId/messages', authenticatedOnly, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/conversations/:conversationId/messages', authenticatedOnly, async (req: any, res) => {
    try {
      const { insertMessageSchema } = await import('@shared/schema');
      const { conversationId } = req.params;
      
      // Get conversation to populate phone numbers
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Get system phone number from settings (or use a default)
      const systemPhone = process.env.TWILIO_PHONE_NUMBER || "+15551234567";
      
      // Populate phone fields based on direction
      const direction = req.body.direction || 'outbound';
      const phoneFrom = direction === 'outbound' ? systemPhone : conversation.phoneNumber;
      const phoneTo = direction === 'outbound' ? conversation.phoneNumber : systemPhone;
      
      const messageData = {
        ...req.body,
        conversationId,
        direction,
        phoneFrom,
        phoneTo,
        sentBy: req.user.id,
      };
      
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        operation: "SEND_MESSAGE",
        entityType: "messages",
        entityId: message.id,
        status: "success",
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid message data", errors: error });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch('/api/messages/:id/read', authenticatedOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const message = await storage.markMessageAsRead(id);
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.patch('/api/conversations/:conversationId/read-all', authenticatedOnly, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      await storage.markConversationMessagesAsRead(conversationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
