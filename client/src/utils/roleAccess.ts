// Role-based access control configuration
export type UserRole = "admin" | "user" | "client";

export interface MenuItem {
  title: string;
  path: string;
  icon: string;
  section: string;
  roles: UserRole[];
  description?: string;
  priority?: number;
  roleSpecificTitle?: Partial<Record<UserRole, string>>;
  roleSpecificIcon?: Partial<Record<UserRole, string>>;
}

// Define which roles can access which features with role-specific customization
export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    roleSpecificTitle: {
      admin: "Management Dashboard",
      user: "Technician Dashboard",
      client: "My Dashboard",
    },
    path: "/",
    icon: "fas fa-tachometer-alt",
    section: "main",
    roles: ["admin", "user", "client"],
    description: "Overview and key metrics",
    priority: 1,
  },
  {
    title: "Digital Inspections",
    roleSpecificTitle: {
      admin: "All Inspections",
      user: "My Inspections",
    },
    path: "/inspections",
    icon: "fas fa-clipboard-check",
    section: "operations",
    roles: ["admin", "user"], // Shop Manager and Technician only
    description: "Vehicle inspection reports",
    priority: 2,
  },
  {
    title: "Appointments",
    roleSpecificTitle: {
      admin: "All Appointments",
      user: "My Assignments",
      client: "My Appointments",
    },
    path: "/appointments",
    icon: "fas fa-calendar-alt",
    section: "operations",
    roles: ["admin", "user", "client"], // All roles - clients see their own
    description: "Schedule and manage appointments",
    priority: 3,
  },
  {
    title: "Repair Orders",
    roleSpecificTitle: {
      admin: "All Work Orders",
      user: "My Work Orders",
    },
    path: "/repair-orders",
    icon: "fas fa-wrench",
    section: "operations",
    roles: ["admin", "user"], // Shop Manager and Technician (assigned orders only)
    description: "Track repair progress",
    priority: 4,
  },
  {
    title: "Job Board",
    roleSpecificTitle: {
      admin: "Work Assignment Board",
      user: "Available Jobs",
    },
    path: "/job-board",
    icon: "fas fa-tasks",
    section: "operations",
    roles: ["admin", "user"], // Shop Manager and Technician only
    description: "View and assign work",
    priority: 5,
  },
  {
    title: "Customer Management",
    path: "/customers",
    icon: "fas fa-users",
    section: "customer",
    roles: ["admin"], // Shop Manager only
    description: "Manage customer database",
    priority: 6,
  },
  {
    title: "Vehicles",
    roleSpecificTitle: {
      admin: "Vehicle Management",
      client: "My Vehicles",
    },
    path: "/vehicles",
    icon: "fas fa-car",
    section: "customer",
    roles: ["admin", "client"], // Admin manages all, clients manage their own
    description: "Manage vehicle information",
    priority: 6.5,
  },
  {
    title: "Two-Way Texting",
    path: "/messaging",
    icon: "fas fa-sms",
    section: "customer",
    roles: ["admin"], // Shop Manager only
    description: "Communicate with customers",
    priority: 7,
  },
  {
    title: "Reviews Campaign",
    path: "/reviews",
    icon: "fas fa-star",
    section: "customer",
    roles: ["admin"], // Shop Manager only
    description: "Manage customer reviews",
    priority: 8,
  },
  {
    title: "My Account",
    path: "/customer-portal",
    icon: "fas fa-user-circle",
    section: "personal",
    roles: ["client"], // Client only - their personal portal
    description: "View your vehicles and services",
    priority: 1,
  },
  {
    title: "Invoices & Payments",
    path: "/invoices",
    icon: "fas fa-file-invoice-dollar",
    section: "business",
    roles: ["admin"], // Shop Manager only
  },
  {
    title: "Inventory",
    path: "/inventory",
    icon: "fas fa-boxes",
    section: "business",
    roles: ["admin"], // Shop Manager only
  },
  {
    title: "Reporting",
    path: "/reporting",
    icon: "fas fa-chart-line",
    section: "business",
    roles: ["admin"], // Shop Manager only
  },
  {
    title: "User Management",
    path: "/users",
    icon: "fas fa-users-cog",
    section: "business",
    roles: ["admin"], // Shop Manager only
  },
  {
    title: "Settings",
    path: "/settings",
    icon: "fas fa-cog",
    section: "business",
    roles: ["admin"], // Shop Manager only
  },
];

export const sections = {
  main: "Main",
  operations: "Operations",
  customer: "Customer Management",
  business: "Business Management",
  personal: "My Account",
};

// Role display names
export const roleDisplayNames: Record<UserRole, string> = {
  admin: "Shop Manager",
  user: "Technician",
  client: "Client",
};

// Helper function to filter menu items by user role with customization
export function getMenuItemsForRole(userRole: UserRole): MenuItem[] {
  return menuItems
    .filter((item) => item.roles.includes(userRole))
    .map((item) => ({
      ...item,
      title: item.roleSpecificTitle?.[userRole] || item.title,
      icon: item.roleSpecificIcon?.[userRole] || item.icon,
    }))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

// Helper function to check if user has access to a specific path
export function hasAccess(userRole: UserRole, path: string): boolean {
  // Dashboard is always accessible to authenticated users
  if (path === "/") return true;

  // Check for exact path match or path prefix for nested routes
  const item = menuItems.find(
    (item) => item.path === path || path.startsWith(item.path + "/")
  );
  return item ? item.roles.includes(userRole) : false;
}

// Helper function to get role display name
export function getRoleDisplayName(role?: string): string {
  if (!role || !(role in roleDisplayNames)) {
    return "User";
  }
  return roleDisplayNames[role as UserRole];
}
