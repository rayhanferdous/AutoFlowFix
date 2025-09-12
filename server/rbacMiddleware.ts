import type { RequestHandler } from "express";

export type UserRole = 'admin' | 'user' | 'client';

// Role-based authorization middleware
export const requireRole = (allowedRoles: UserRole[]): RequestHandler => {
  return (req: any, res, next) => {
    // Check if user is authenticated first
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user?.role as UserRole;
    
    // Check if user has required role
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Access denied",
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
};

// Admin only access
export const adminOnly = requireRole(['admin']);

// Technician and admin access
export const technicianOrAdmin = requireRole(['admin', 'user']);

// Client access (and admin for management)
export const clientOrAdmin = requireRole(['client', 'admin']);

// All authenticated users
export const authenticatedOnly = requireRole(['admin', 'user', 'client']);

// Data filtering middleware for role-based data access
export const filterDataByRole: RequestHandler = (req: any, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userRole = req.user?.role as UserRole;
  const userId = req.user?.id;

  // Attach role-based filtering context to request
  req.roleContext = {
    role: userRole,
    userId: userId,
    canAccessAll: userRole === 'admin',
    canAccessAssigned: userRole === 'user' || userRole === 'admin',
    canAccessOwn: true
  };

  next();
};

// Helper to get customer ID for client users
export const getCustomerIdForUser = async (userId: string, storage: any): Promise<string | null> => {
  try {
    // In a real implementation, you'd have a mapping between users and customers
    // For now, we'll use the user ID as customer ID for client users
    const user = await storage.getUser(userId);
    if (user?.role === 'client') {
      // Assuming client users have a direct customer relationship
      return userId; // or implement proper customer lookup
    }
    return null;
  } catch (error) {
    console.error("Error getting customer ID for user:", error);
    return null;
  }
};

// Middleware to ensure clients can only access their own data
export const ensureOwnership = (resourceType: 'customer' | 'vehicle' | 'appointment' | 'repair_order' | 'invoice'): RequestHandler => {
  return async (req: any, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user?.role as UserRole;
    const userId = req.user?.id;

    // Admins can access everything
    if (userRole === 'admin') {
      return next();
    }

    // For clients, ensure they're only accessing their own data
    if (userRole === 'client') {
      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({ message: "Resource ID required" });
      }

      // Store resource ownership check context for storage layer
      req.ownershipContext = {
        resourceType,
        resourceId,
        userId,
        userRole
      };
    }

    // For technicians, they can access assigned work (handled in storage layer)
    if (userRole === 'user') {
      req.technicianContext = {
        technicianId: userId,
        resourceType,
        resourceId: req.params.id
      };
    }

    next();
  };
};

// Factory function to create middleware that validates client ownership for create/update operations
export const createClientOwnershipMiddleware = (storage: any): RequestHandler => {
  return async (req: any, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user?.role as UserRole;
    
    // Skip validation for admins
    if (userRole === 'admin') {
      return next();
    }
    
    // For clients, ensure they can only create/update their own data
    if (userRole === 'client') {
      try {
        const customer = await storage.getCustomerByEmail(req.user.email);
        if (!customer) {
          return res.status(404).json({ message: "Customer profile not found" });
        }
        
        // Check if the request body contains customerId and validate ownership
        const { customerId, vehicleId } = req.body;
        
        if (customerId && customerId !== customer.id) {
          return res.status(403).json({ message: "Access denied - you can only access your own data" });
        }
        
        // If vehicleId is provided, ensure it belongs to the client's customer
        if (vehicleId) {
          const vehicle = await storage.getVehicle(vehicleId);
          if (!vehicle || vehicle.customerId !== customer.id) {
            return res.status(403).json({ message: "Access denied - vehicle does not belong to you" });
          }
        }
        
        // Attach customer context for use in route handlers
        req.clientCustomer = customer;
      } catch (error) {
        console.error("Error validating client ownership:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
    
    next();
  };
};