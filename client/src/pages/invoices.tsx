import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/sidebar";

export default function Invoices() {
  const invoices = [
    {
      id: "INV-001",
      customerName: "John Smith",
      vehicleInfo: "2018 Honda Civic",
      amount: 125.50,
      status: "paid",
      dueDate: "2024-01-15",
      paidDate: "2024-01-14",
      services: ["Oil Change", "Filter Replacement"]
    },
    {
      id: "INV-002", 
      customerName: "Sarah Johnson",
      vehicleInfo: "2020 Toyota Camry",
      amount: 485.75,
      status: "pending",
      dueDate: "2024-01-20",
      paidDate: null,
      services: ["Brake Repair", "Inspection"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-invoices">Invoices & Payments</h1>
              <p className="text-muted-foreground">Manage billing and payment processing</p>
            </div>
            <Button data-testid="button-new-invoice">
              <i className="fas fa-plus mr-2"></i>
              Create Invoice
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">$2,450</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-file-invoice text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-muted-foreground">Invoices Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-clock text-yellow-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Pending Payment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Track payments and billing status</CardDescription>
                </div>
                <Input placeholder="Search invoices..." className="w-64" data-testid="input-search-invoices" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h4 className="font-medium">{invoice.id}</h4>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.customerName} - {invoice.vehicleInfo}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Services: {invoice.services.join(", ")}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-lg font-bold">${invoice.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-view-${invoice.id}`}>
                        View
                      </Button>
                      {invoice.status === "pending" && (
                        <Button size="sm" data-testid={`button-collect-${invoice.id}`}>
                          Collect Payment
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}