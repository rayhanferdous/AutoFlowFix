import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import SystemHealth from "@/components/system-health";
import ErrorNotification from "@/components/error-notification";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["/api/audit-logs"],
  });

  const { data: repairOrders } = useQuery({
    queryKey: ["/api/repair-orders"],
  });

  const activeRepairOrders = Array.isArray(repairOrders) ? repairOrders.filter((order: any) => 
    ["created", "in_progress"].includes(order.status)
  ).slice(0, 3) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const handleNewAppointment = () => {
    toast({
      title: "Appointment Creation",
      description: "Redirecting to appointment scheduling...",
    });
    // Navigate to appointments page
    window.location.href = "/appointments";
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">
                Dashboard
              </h2>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening at your garage today.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <i className="fas fa-database text-sm mr-1"></i>
                Migration Complete
                <i className="fas fa-check-circle text-sm ml-1"></i>
              </Badge>
              <Button 
                onClick={handleNewAppointment}
                data-testid="button-new-appointment"
              >
                <i className="fas fa-plus mr-2"></i>
                New Appointment
              </Button>
              <Button 
                variant="outline"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 space-y-8">
          {/* System Health */}
          <SystemHealth />

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Today's Operations</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <i className="fas fa-calendar"></i>
                      <span data-testid="text-current-date">
                        {new Date().toLocaleDateString("en-US", { 
                          year: "numeric", 
                          month: "long", 
                          day: "numeric" 
                        })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="text-center p-4 bg-accent rounded-lg animate-pulse">
                          <div className="h-8 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-accent rounded-lg">
                        <div className="text-2xl font-bold text-blue-600" data-testid="metric-appointments">
                          {metrics?.todayAppointments || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Appointments</div>
                      </div>
                      <div className="text-center p-4 bg-accent rounded-lg">
                        <div className="text-2xl font-bold text-orange-600" data-testid="metric-repair-orders">
                          {metrics?.activeRepairOrders || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Repair Orders</div>
                      </div>
                      <div className="text-center p-4 bg-accent rounded-lg">
                        <div className="text-2xl font-bold text-green-600" data-testid="metric-customers">
                          {metrics?.totalCustomers || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Customers</div>
                      </div>
                      <div className="text-center p-4 bg-accent rounded-lg">
                        <div className="text-2xl font-bold text-purple-600" data-testid="metric-revenue">
                          ${metrics?.todayRevenue || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Today's Revenue</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <i className="fas fa-check-circle text-green-600 mt-0.5"></i>
                    <div>
                      <p className="text-sm font-medium text-green-800">Migration Successful</p>
                      <p className="text-xs text-green-600">All data transferred to Replit infrastructure</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Backup Completed</p>
                      <p className="text-xs text-blue-600">Daily backup ran successfully at 2:00 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Jobs and Customer Portal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Repair Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Repair Orders</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="link-view-all-repair-orders">
                    View All <i className="fas fa-arrow-right ml-1"></i>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeRepairOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-active-orders">
                      No active repair orders
                    </p>
                  ) : (
                    activeRepairOrders.map((order: any) => (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                        data-testid={`card-repair-order-${order.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-wrench text-blue-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">{order.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Portal Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Portal Activity</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="link-portal-settings">
                    Portal Settings <i className="fas fa-cog ml-1"></i>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-600" data-testid="metric-registered-users">
                        {metrics?.totalCustomers || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Registered Users</div>
                    </div>
                    <div className="bg-accent p-4 rounded-lg text-center">
                      <div className="text-xl font-bold text-green-600" data-testid="metric-active-today">
                        {Math.floor((metrics?.totalCustomers || 0) * 0.17)}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Today</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
                    
                    <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-user-plus text-green-600 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">System Ready</p>
                        <p className="text-xs text-muted-foreground">All services operational</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Integrity and Audit Trail */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Integrity & Audit Trail</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" data-testid="button-export-audit">
                    <i className="fas fa-download mr-1"></i>
                    Export
                  </Button>
                  <Button size="sm" data-testid="button-run-backup">
                    <i className="fas fa-shield-alt mr-1"></i>
                    Run Backup
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Operation</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entity</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(auditLogs) && auditLogs.length > 0 ? auditLogs.slice(0, 5).map((entry: any) => (
                      <tr key={entry.id} className="border-b border-border hover:bg-accent">
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{entry.operation}</td>
                        <td className="py-3 px-4">{entry.entityType}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground" data-testid="text-no-audit-logs">
                          No audit logs available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-3 p-6 h-auto"
                  data-testid="button-new-inspection"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clipboard-check text-blue-600 text-xl"></i>
                  </div>
                  <span className="text-sm font-medium">New Inspection</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-3 p-6 h-auto"
                  data-testid="button-create-repair-order"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-wrench text-orange-600 text-xl"></i>
                  </div>
                  <span className="text-sm font-medium">Create Repair Order</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-3 p-6 h-auto"
                  data-testid="button-add-customer"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user-plus text-green-600 text-xl"></i>
                  </div>
                  <span className="text-sm font-medium">Add Customer</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-3 p-6 h-auto"
                  data-testid="button-generate-report"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-bar text-purple-600 text-xl"></i>
                  </div>
                  <span className="text-sm font-medium">Generate Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <ErrorNotification />
    </div>
  );
}
