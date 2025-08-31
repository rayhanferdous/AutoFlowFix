import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: "fas fa-tachometer-alt",
      section: "main"
    },
    {
      title: "Digital Inspections", 
      path: "/inspections",
      icon: "fas fa-clipboard-check",
      section: "operations"
    },
    {
      title: "Appointments",
      path: "/appointments", 
      icon: "fas fa-calendar-alt",
      section: "operations"
    },
    {
      title: "Repair Orders",
      path: "/repair-orders",
      icon: "fas fa-wrench", 
      section: "operations"
    },
    {
      title: "Job Board",
      path: "/job-board",
      icon: "fas fa-tasks",
      section: "operations"
    },
    {
      title: "Customer Management",
      path: "/customers",
      icon: "fas fa-users",
      section: "customer"
    },
    {
      title: "Two-Way Texting",
      path: "/messaging",
      icon: "fas fa-sms",
      section: "customer"
    },
    {
      title: "Reviews Campaign",
      path: "/reviews",
      icon: "fas fa-star",
      section: "customer"
    },
    {
      title: "Customer Portal",
      path: "/customer-portal",
      icon: "fas fa-user-circle",
      section: "customer"
    },
    {
      title: "Invoices & Payments",
      path: "/invoices",
      icon: "fas fa-file-invoice-dollar",
      section: "business"
    },
    {
      title: "Inventory",
      path: "/inventory",
      icon: "fas fa-boxes",
      section: "business"
    },
    {
      title: "Reporting",
      path: "/reporting",
      icon: "fas fa-chart-line",
      section: "business"
    },
    {
      title: "Settings",
      path: "/settings", 
      icon: "fas fa-cog",
      section: "business"
    }
  ];

  const sections = {
    operations: "Operations",
    customer: "Customer", 
    business: "Business"
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border flex flex-col transition-all duration-300`}>
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-car text-primary-foreground text-lg"></i>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-foreground">AutoFlow GMS</h1>
              <p className="text-sm text-muted-foreground">Garage Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="px-4 py-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-start"
          data-testid="button-toggle-sidebar"
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <Link href="/">
          <div 
            className={`px-3 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-3 ${
              isActive("/") 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent text-accent-foreground"
            }`}
            data-testid="nav-dashboard"
          >
            <i className="fas fa-tachometer-alt w-5"></i>
            {!isCollapsed && <span>Dashboard</span>}
          </div>
        </Link>
        
        {/* Menu Sections */}
        {Object.entries(sections).map(([sectionKey, sectionTitle]) => (
          <div key={sectionKey}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-6">
                {sectionTitle}
              </h3>
            )}
            <div className="space-y-1">
              {menuItems
                .filter(item => item.section === sectionKey)
                .map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div 
                      className={`px-3 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-3 ${
                        isActive(item.path)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent text-accent-foreground"
                      }`}
                      data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                    >
                      <i className={`${item.icon} w-5`}></i>
                      {!isCollapsed && <span>{item.title}</span>}
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            {user?.firstName && user?.lastName ? (
              <span className="text-primary-foreground text-sm font-semibold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            ) : (
              <i className="fas fa-user text-primary-foreground text-sm"></i>
            )}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"
                  }
                </p>
                <p className="text-xs text-muted-foreground">Shop Manager</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt text-muted-foreground text-sm"></i>
              </Button>
            </>
          )}
        </div>
        {isCollapsed && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full"
              data-testid="button-logout-collapsed"
            >
              <i className="fas fa-sign-out-alt text-muted-foreground"></i>
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
