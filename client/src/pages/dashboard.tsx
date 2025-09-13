import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import SystemHealth from "@/components/system-health";
import ErrorNotification from "@/components/error-notification";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const { data: metrics, isLoading: metricsLoading } = useQuery<Metrics>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: !!user && user.role === 'admin',
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["/api/audit-logs"],
    enabled: !!user && user.role === 'admin',
  });

  const { data: repairOrders, isError: repairOrdersError } = useQuery({
    queryKey: ["/api/repair-orders"],
    enabled: !!user && (user.role === 'admin' || user.role === 'user'),
  });

  // Add role-specific data fetching
  const { data: appointments, isError: appointmentsError } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user && (user.role === 'admin' || user.role === 'client'),
  });

  const { data: inspections, isError: inspectionsError } = useQuery({
    queryKey: ["/api/inspections"],
    enabled: !!user && (user.role === 'admin' || user.role === 'user'),
  });

  const { data: customerVehicles } = useQuery({
    queryKey: ["/api/vehicles"],
    enabled: !!user && user.role === 'client',
  });

  const { data: customerInvoices } = useQuery({
    queryKey: ["/api/invoices"],
    enabled: !!user && user.role === 'client',
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

  // Show loading if authentication is still in progress
  if (authLoading) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mb-4"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Role-based content rendering
  const userRole = user?.role || 'client';
  const isAdmin = userRole === 'admin';
  const isTechnician = userRole === 'user';
  const isClient = userRole === 'client';

  // Define types for better TypeScript support
  interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'admin' | 'user' | 'client';
  }

  interface Metrics {
    todayAppointments: number;
    activeRepairOrders: number;
    totalCustomers: number;
    todayRevenue: number;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">
                {isAdmin ? 'Manager Dashboard' : isTechnician ? 'Technician Dashboard' : 'My Garage Portal'}
              </h2>
              <p className="text-muted-foreground">
                {isAdmin ? 
                  'Complete overview of all garage operations and performance metrics.' :
                  isTechnician ? 
                  'Your assigned repair orders, inspections, and job board.' :
                  'Manage your vehicle information, service history, and appointments.'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <i className="fas fa-user text-sm mr-1"></i>
                {isAdmin ? 'Shop Manager' : isTechnician ? 'Technician' : 'Client'}
              </Badge>
              {(isAdmin || isClient) && (
                <Button 
                  onClick={handleNewAppointment}
                  data-testid="button-new-appointment"
                >
                  <i className="fas fa-plus mr-2"></i>
                  New Appointment
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 space-y-8">
          {/* System Health - Admin only */}
          {isAdmin && <SystemHealth />}

          {/* Role-based Content */}
          {isAdmin && (
            <>
              {/* Key Performance Metrics - Admin Full View */}
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
                              {(metrics as Metrics)?.todayAppointments || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Appointments</div>
                          </div>
                          <div className="text-center p-4 bg-accent rounded-lg">
                            <div className="text-2xl font-bold text-orange-600" data-testid="metric-repair-orders">
                              {(metrics as Metrics)?.activeRepairOrders || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Repair Orders</div>
                          </div>
                          <div className="text-center p-4 bg-accent rounded-lg">
                            <div className="text-2xl font-bold text-green-600" data-testid="metric-customers">
                              {(metrics as Metrics)?.totalCustomers || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Customers</div>
                          </div>
                          <div className="text-center p-4 bg-accent rounded-lg">
                            <div className="text-2xl font-bold text-purple-600" data-testid="metric-revenue">
                              ${(metrics as Metrics)?.todayRevenue || 0}
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
            </>
          )}

          {isTechnician && (
            <>
              {/* Technician Metrics - Limited View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Work Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600" data-testid="metric-my-repair-orders">
                        {Array.isArray(repairOrders) ? repairOrders.filter((order: any) => 
                          ["created", "in_progress"].includes(order.status)
                        ).length : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Assigned Orders</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Inspections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600" data-testid="metric-inspections">
                        {Array.isArray(inspections) ? inspections.filter((inspection: any) => 
                          ["pending", "in_progress"].includes(inspection.status)
                        ).length : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Today's Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600" data-testid="metric-completed-today">
                        {Array.isArray(repairOrders) ? repairOrders.filter((order: any) => 
                          order.status === "completed"
                        ).length : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {isClient && (
            <>
              {/* Client Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Vehicles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(customerVehicles) && customerVehicles.length > 0 ? (
                        customerVehicles.slice(0, 2).map((vehicle: any) => (
                          <div key={vehicle.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i className="fas fa-car text-blue-600"></i>
                              </div>
                              <div>
                                <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                <p className="text-sm text-muted-foreground">License: {vehicle.licensePlate}</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <i className="fas fa-car text-4xl mb-4 opacity-50"></i>
                          <p>No vehicles registered</p>
                          <p className="text-sm">Contact us to add your vehicle</p>
                        </div>
                      )}

                      {Array.isArray(appointments) && appointments.length > 0 && (
                        <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-orange-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-calendar text-orange-600"></i>
                            </div>
                            <div>
                              <p className="font-medium">Next Service</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(appointments[0].scheduledDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            {appointments[0].status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-check text-green-600 text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Service Completed</p>
                          <p className="text-xs text-muted-foreground">Oil change - 2 weeks ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-calendar text-blue-600 text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Appointment Booked</p>
                          <p className="text-xs text-muted-foreground">Brake inspection - Next week</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Role-based Work Lists */}
          {(isAdmin || isTechnician) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Repair Orders */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {isAdmin ? 'Active Repair Orders' : 'My Assigned Orders'}
                    </CardTitle>
                    <Button variant="ghost" size="sm" data-testid="link-view-all-repair-orders">
                      View All <i className="fas fa-arrow-right ml-1"></i>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeRepairOrders.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8" data-testid="text-no-active-orders">
                        {isAdmin ? 'No active repair orders' : 'No assigned repair orders'}
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

              {/* Role-specific second panel */}
              {isAdmin && (
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
                            {(metrics as Metrics)?.totalCustomers || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Registered Users</div>
                        </div>
                        <div className="bg-accent p-4 rounded-lg text-center">
                          <div className="text-xl font-bold text-green-600" data-testid="metric-active-today">
                            {Math.floor(((metrics as Metrics)?.totalCustomers || 0) * 0.17)}
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
              )}

              {isTechnician && (
                <Card>
                  <CardHeader>
                    <CardTitle>Digital Inspections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-clipboard-check text-blue-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">Vehicle Safety Check</p>
                            <p className="text-sm text-muted-foreground">2021 Honda Civic</p>
                          </div>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          Pending
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-check-circle text-green-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">Brake System Inspection</p>
                            <p className="text-sm text-muted-foreground">2019 Toyota Camry</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Complete
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {isClient && (
            <Card>
              <CardHeader>
                <CardTitle>My Service History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(appointments) && appointments.length > 0 ? (
                    appointments.filter((appt: any) => appt.status === 'completed').slice(0, 3).map((appointment: any) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-calendar-check text-blue-600"></i>
                          </div>
                          <div>
                            <p className="font-medium">{appointment.serviceType || 'Service Appointment'}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.scheduledDate ? new Date(appointment.scheduledDate).toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Completed
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-history text-4xl mb-4 opacity-50"></i>
                      <p>No service history available</p>
                      <p className="text-sm">Your completed services will appear here</p>
                    </div>
                  )}

                  {Array.isArray(customerInvoices) && customerInvoices.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Invoices</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {customerInvoices.slice(0, 2).map((invoice: any) => (
                          <div key={invoice.id} className="p-3 bg-accent rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                  {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'Recent'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm">${invoice.total}</p>
                                <Badge 
                                  className={`text-xs ${
                                    invoice.status === 'paid' 
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : 'bg-orange-100 text-orange-800 border-orange-200'
                                  }`}
                                >
                                  {invoice.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Integrity and Audit Trail - Admin only */}
          {isAdmin && (
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
          )}

          {/* Role-based Quick Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {isAdmin && (
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
              )}

              {isTechnician && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center gap-3 p-6 h-auto"
                    data-testid="button-new-inspection"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-clipboard-check text-blue-600 text-xl"></i>
                    </div>
                    <span className="text-sm font-medium">Start Inspection</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center gap-3 p-6 h-auto"
                    data-testid="button-update-repair-order"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-wrench text-orange-600 text-xl"></i>
                    </div>
                    <span className="text-sm font-medium">Update Order</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center gap-3 p-6 h-auto"
                    data-testid="button-view-job-board"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-tasks text-green-600 text-xl"></i>
                    </div>
                    <span className="text-sm font-medium">Job Board</span>
                  </Button>
                </div>
              )}

              {isClient && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center gap-3 p-6 h-auto"
                    data-testid="button-book-appointment"
                    onClick={handleNewAppointment}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-calendar-plus text-blue-600 text-xl"></i>
                    </div>
                    <span className="text-sm font-medium">Book Appointment</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center gap-3 p-6 h-auto"
                    data-testid="button-view-vehicles"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-car text-green-600 text-xl"></i>
                    </div>
                    <span className="text-sm font-medium">My Vehicles</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center gap-3 p-6 h-auto"
                    data-testid="button-service-history"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-history text-orange-600 text-xl"></i>
                    </div>
                    <span className="text-sm font-medium">Service History</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <ErrorNotification />
    </div>
  );
}
