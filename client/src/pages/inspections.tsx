import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";

export default function Inspections() {
  const inspections = [
    {
      id: "INS-001",
      vehicleInfo: "2018 Honda Civic - ABC123",
      customerName: "John Smith",
      status: "pending",
      createdAt: new Date().toISOString(),
      checklistItems: 12,
      completedItems: 8
    },
    {
      id: "INS-002", 
      vehicleInfo: "2020 Toyota Camry - XYZ789",
      customerName: "Sarah Johnson",
      status: "completed",
      createdAt: new Date().toISOString(),
      checklistItems: 15,
      completedItems: 15
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
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
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-inspections">Digital Inspections</h1>
              <p className="text-muted-foreground">Manage digital vehicle inspections and reports</p>
            </div>
            <Button data-testid="button-new-inspection">
              <i className="fas fa-plus mr-2"></i>
              New Inspection
            </Button>
          </div>

          <div className="grid gap-6">
            {inspections.map((inspection) => (
              <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{inspection.id}</CardTitle>
                      <CardDescription>{inspection.vehicleInfo}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(inspection.status)}>
                      {inspection.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer</p>
                      <p className="font-medium">{inspection.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Progress</p>
                      <p className="font-medium">{inspection.completedItems}/{inspection.checklistItems} items</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-view-${inspection.id}`}>
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-edit-${inspection.id}`}>
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}