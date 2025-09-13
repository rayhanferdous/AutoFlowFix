import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getMenuItemsForRole, sections, getRoleDisplayName, type UserRole } from "@/utils/roleAccess";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      toast({ title: "Success", description: "Logged out successfully!" });
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({ 
        title: "Logout Failed", 
        description: error.message || "Failed to logout",
        variant: "destructive" 
      });
    },
  });

  // Get user role and filter menu items accordingly
  const userRole = (user?.role as UserRole) || 'user';
  const allowedMenuItems = getMenuItemsForRole(userRole);

  const handleLogout = () => {
    logoutMutation.mutate();
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
        <TooltipProvider>
          {/* Menu Sections */}
          {Object.entries(sections).map(([sectionKey, sectionTitle]) => {
            // Get items for this section
            const sectionItems = allowedMenuItems.filter(item => item.section === sectionKey);
            
            // Only render section if it has items
            if (sectionItems.length === 0) return null;
            
            return (
              <div key={sectionKey}>
                {!isCollapsed && sectionKey !== 'main' && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-6">
                    {sectionTitle}
                  </h3>
                )}
                <div className="space-y-1">
                  {sectionItems.map((item) => (
                    <Tooltip key={item.path} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Link href={item.path}>
                          <div 
                            className={`px-3 py-2 rounded-md cursor-pointer transition-colors flex items-center gap-3 ${
                              isActive(item.path)
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent text-accent-foreground"
                            }`}
                            data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                          >
                            <i className={`${item.icon} w-5 flex-shrink-0`}></i>
                            {!isCollapsed && (
                              <div className="flex-1 min-w-0">
                                <span className="block truncate">{item.title}</span>
                                {item.description && (
                                  <span className="text-xs opacity-70 block truncate">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            )}
                            {isActive(item.path) && (
                              <div className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                            )}
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="text-sm">
                          <div className="font-semibold">{item.title}</div>
                          {item.description && (
                            <div className="text-muted-foreground mt-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </TooltipProvider>
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
                <p className="text-xs text-muted-foreground">{getRoleDisplayName(userRole)}</p>
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
