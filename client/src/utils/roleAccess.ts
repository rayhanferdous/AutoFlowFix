// Role-based access control configuration
export type UserRole = 'admin' | 'user' | 'client';

export interface MenuItem {
  title: string;
  path: string;
  icon: string;
  section: string;
  roles: UserRole[];
}

// Define which roles can access which features
export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: "fas fa-tachometer-alt",
    section: "main",
    roles: ["admin", "user", "client"]
  },
  {
    title: "Digital Inspections", 
    path: "/inspections",
    icon: "fas fa-clipboard-check",
    section: "operations",
    roles: ["admin", "user"] // Shop Manager and Technician only
  },
  {
    title: "Appointments",
    path: "/appointments", 
    icon: "fas fa-calendar-alt",
    section: "operations",
    roles: ["admin", "user", "client"] // All roles - clients see their own
  },
  {
    title: "Repair Orders",
    path: "/repair-orders",
    icon: "fas fa-wrench", 
    section: "operations",
    roles: ["admin", "user"] // Shop Manager and Technician (assigned orders only)
  },
  {
    title: "Job Board",
    path: "/job-board",
    icon: "fas fa-tasks",
    section: "operations",
    roles: ["admin", "user"] // Shop Manager and Technician only
  },
  {
    title: "Customer Management",
    path: "/customers",
    icon: "fas fa-users",
    section: "customer",
    roles: ["admin"] // Shop Manager only
  },
  {
    title: "Two-Way Texting",
    path: "/messaging",
    icon: "fas fa-sms",
    section: "customer",
    roles: ["admin"] // Shop Manager only
  },
  {
    title: "Reviews Campaign",
    path: "/reviews",
    icon: "fas fa-star",
    section: "customer",
    roles: ["admin"] // Shop Manager only
  },
  {
    title: "Customer Portal",
    path: "/customer-portal",
    icon: "fas fa-user-circle",
    section: "personal",
    roles: ["client"] // Client only - their personal portal
  },
  {
    title: "Invoices & Payments",
    path: "/invoices",
    icon: "fas fa-file-invoice-dollar",
    section: "business",
    roles: ["admin"] // Shop Manager only
  },
  {
    title: "Inventory",
    path: "/inventory",
    icon: "fas fa-boxes",
    section: "business",
    roles: ["admin"] // Shop Manager only
  },
  {
    title: "Reporting",
    path: "/reporting",
    icon: "fas fa-chart-line",
    section: "business",
    roles: ["admin"] // Shop Manager only
  },
  {
    title: "Settings",
    path: "/settings", 
    icon: "fas fa-cog",
    section: "business",
    roles: ["admin"] // Shop Manager only
  }
];

export const sections = {
  main: "Main",
  operations: "Operations",
  customer: "Customer Management", 
  business: "Business Management",
  personal: "My Account"
};

// Role display names
export const roleDisplayNames: Record<UserRole, string> = {
  admin: "Shop Manager",
  user: "Technician",
  client: "Client"
};

// Helper function to filter menu items by user role
export function getMenuItemsForRole(userRole: UserRole): MenuItem[] {
  return menuItems.filter(item => item.roles.includes(userRole));
}

// Helper function to check if user has access to a specific path
export function hasAccess(userRole: UserRole, path: string): boolean {
  // Dashboard is always accessible to authenticated users
  if (path === "/") return true;
  
  // Check for exact path match or path prefix for nested routes
  const item = menuItems.find(item => 
    item.path === path || path.startsWith(item.path + "/")
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