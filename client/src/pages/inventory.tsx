import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/sidebar";

export default function Inventory() {
  const inventoryItems = [
    {
      id: "PART-001",
      name: "Motor Oil 5W-30",
      category: "Fluids",
      quantity: 24,
      minStock: 10,
      price: 12.99,
      supplier: "AutoParts Plus",
      lastOrdered: "2024-01-10"
    },
    {
      id: "PART-002",
      name: "Air Filter",
      category: "Filters", 
      quantity: 5,
      minStock: 15,
      price: 24.50,
      supplier: "Filter Corp",
      lastOrdered: "2024-01-05"
    },
    {
      id: "PART-003",
      name: "Brake Pads",
      category: "Brakes",
      quantity: 8,
      minStock: 5,
      price: 89.99,
      supplier: "Brake Solutions",
      lastOrdered: "2024-01-12"
    }
  ];

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock) return { status: "low", color: "bg-red-100 text-red-800" };
    if (quantity <= minStock * 1.5) return { status: "medium", color: "bg-yellow-100 text-yellow-800" };
    return { status: "good", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-inventory">Inventory</h1>
              <p className="text-muted-foreground">Manage parts and supplies inventory</p>
            </div>
            <Button data-testid="button-add-item">
              <i className="fas fa-plus mr-2"></i>
              Add Item
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-boxes text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">37</p>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">$4,250</p>
                    <p className="text-sm text-muted-foreground">Inventory Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-shopping-cart text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>Track parts, supplies, and stock levels</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Search items..." className="w-64" data-testid="input-search-inventory" />
                  <Button variant="outline" data-testid="button-reorder-report">
                    <i className="fas fa-file-alt mr-2"></i>
                    Reorder Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Part ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => {
                      const stockStatus = getStockStatus(item.quantity, item.minStock);
                      return (
                        <tr key={item.id} className="border-b border-border hover:bg-accent">
                          <td className="py-3 px-4 font-mono text-sm">{item.id}</td>
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-medium">{item.quantity}</span>
                              <span className="text-muted-foreground text-xs ml-1">(min: {item.minStock})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">${item.price}</td>
                          <td className="py-3 px-4">
                            <Badge className={stockStatus.color}>
                              {stockStatus.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" data-testid={`button-edit-${item.id}`}>
                                Edit
                              </Button>
                              {stockStatus.status === "low" && (
                                <Button size="sm" data-testid={`button-reorder-${item.id}`}>
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}