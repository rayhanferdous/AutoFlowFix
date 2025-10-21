import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, Users, Wrench, Package, TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface RevenueAnalytics {
  totalRevenue: number;
  paidInvoices: number;
  averageInvoiceAmount: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalVehicles: number;
  activeCustomers: number;
  customersByMonth: Array<{ month: string; count: number }>;
}

interface TechnicianAnalytics {
  technicianId: string;
  technicianName: string;
  completedJobs: number;
  activeJobs: number;
  totalRevenue: number;
  averageCompletionTime: number;
}

interface InventoryAnalytics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categoriesCount: number;
  valueByCategory: Array<{ category: string; value: number }>;
}

export default function Reporting() {
  const { data: revenueData, isLoading: revenueLoading, isError: revenueError } = useQuery<RevenueAnalytics>({
    queryKey: ['/api/analytics/revenue'],
  });

  const { data: customerData, isLoading: customerLoading, isError: customerError } = useQuery<CustomerAnalytics>({
    queryKey: ['/api/analytics/customers'],
  });

  const { data: technicianData, isLoading: technicianLoading, isError: technicianError } = useQuery<TechnicianAnalytics[]>({
    queryKey: ['/api/analytics/technicians'],
  });

  const { data: inventoryData, isLoading: inventoryLoading, isError: inventoryError } = useQuery<InventoryAnalytics>({
    queryKey: ['/api/analytics/inventory'],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-reporting">Analytics & Reporting</h1>
              <p className="text-muted-foreground">Business insights and performance metrics</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                {revenueLoading ? (
                  <div className="flex items-center">
                    <Skeleton className="w-12 h-12 rounded-lg mr-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg flex items-center justify-center mr-4">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" data-testid="stat-total-revenue">
                        {formatCurrency(revenueData?.totalRevenue || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                {customerLoading ? (
                  <div className="flex items-center">
                    <Skeleton className="w-12 h-12 rounded-lg mr-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" data-testid="stat-total-customers">
                        {customerData?.totalCustomers || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                {technicianLoading ? (
                  <div className="flex items-center">
                    <Skeleton className="w-12 h-12 rounded-lg mr-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg flex items-center justify-center mr-4">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" data-testid="stat-total-jobs">
                        {technicianData?.reduce((sum, tech) => sum + tech.completedJobs, 0) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Completed Jobs</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                {inventoryLoading ? (
                  <div className="flex items-center">
                    <Skeleton className="w-12 h-12 rounded-lg mr-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-lg flex items-center justify-center mr-4">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" data-testid="stat-inventory-value">
                        {formatCurrency(inventoryData?.totalValue || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Inventory Value</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Revenue Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Overview
                </CardTitle>
                <CardDescription>Revenue metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Revenue</span>
                      <span className="font-bold" data-testid="revenue-total">
                        {formatCurrency(revenueData?.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Paid Invoices</span>
                      <span className="font-bold" data-testid="revenue-paid-invoices">
                        {revenueData?.paidInvoices || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Average Invoice</span>
                      <span className="font-bold" data-testid="revenue-average">
                        {formatCurrency(revenueData?.averageInvoiceAmount || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Revenue by Month
                </CardTitle>
                <CardDescription>Monthly revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : revenueError || !revenueData?.revenueByMonth?.length ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{revenueError ? "Failed to load revenue data" : "No revenue data available"}</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueData.revenueByMonth.map(item => ({
                      month: formatMonth(item.month),
                      revenue: item.revenue,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Customer Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Metrics
                </CardTitle>
                <CardDescription>Customer growth and activity</CardDescription>
              </CardHeader>
              <CardContent>
                {customerLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Customers</span>
                      <span className="font-bold" data-testid="customer-total">
                        {customerData?.totalCustomers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">New This Month</span>
                      <span className="font-bold text-green-600 dark:text-green-400" data-testid="customer-new">
                        +{customerData?.newCustomersThisMonth || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Active Customers</span>
                      <span className="font-bold" data-testid="customer-active">
                        {customerData?.activeCustomers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Vehicles</span>
                      <span className="font-bold" data-testid="customer-vehicles">
                        {customerData?.totalVehicles || 0}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Customer Growth
                </CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                {customerLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : customerError || !customerData?.customersByMonth?.length ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{customerError ? "Failed to load customer data" : "No customer data available"}</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={customerData.customersByMonth.map(item => ({
                      month: formatMonth(item.month),
                      count: item.count,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Technician Performance */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Technician Performance
              </CardTitle>
              <CardDescription>Individual technician metrics and productivity</CardDescription>
            </CardHeader>
            <CardContent>
              {technicianLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : technicianError || !technicianData || technicianData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{technicianError ? "Failed to load technician data" : "No technician data available"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {technicianData.map((tech) => (
                    <div key={tech.technicianId} className="p-4 border border-border rounded-lg" data-testid={`tech-${tech.technicianId}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{tech.technicianName}</h4>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(tech.totalRevenue)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Completed Jobs</p>
                          <p className="text-lg font-bold">{tech.completedJobs}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Active Jobs</p>
                          <p className="text-lg font-bold">{tech.activeJobs}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg. Time (hrs)</p>
                          <p className="text-lg font-bold">{tech.averageCompletionTime.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory Overview
                </CardTitle>
                <CardDescription>Inventory metrics and status</CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Items</span>
                      <span className="font-bold" data-testid="inventory-total-items">
                        {inventoryData?.totalItems || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Value</span>
                      <span className="font-bold" data-testid="inventory-total-value">
                        {formatCurrency(inventoryData?.totalValue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Categories</span>
                      <span className="font-bold" data-testid="inventory-categories">
                        {inventoryData?.categoriesCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <span className="text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-orange-600 dark:text-orange-400">Low Stock Items</span>
                      </span>
                      <span className="font-bold text-orange-600 dark:text-orange-400" data-testid="inventory-low-stock">
                        {inventoryData?.lowStockItems || 0}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Value by Category
                </CardTitle>
                <CardDescription>Inventory distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : inventoryError || !inventoryData?.valueByCategory?.length ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{inventoryError ? "Failed to load inventory data" : "No inventory data available"}</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={inventoryData.valueByCategory}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.category}: ${formatCurrency(entry.value)}`}
                      >
                        {inventoryData.valueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
