import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";

export default function Inspections() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    vehicleInfo: "",
    serviceType: ""
  });
  const { toast } = useToast();
  
  const [inspections, setInspections] = useState([
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
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateInspection = () => {
    if (!formData.customerName || !formData.vehicleInfo || !formData.serviceType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newInspection = {
      id: `INS-${String(inspections.length + 1).padStart(3, '0')}`,
      vehicleInfo: formData.vehicleInfo,
      customerName: formData.customerName,
      status: "pending",
      createdAt: new Date().toISOString(),
      checklistItems: 12,
      completedItems: 0
    };

    setInspections(prev => [newInspection, ...prev]);
    setFormData({ customerName: "", vehicleInfo: "", serviceType: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "New inspection created successfully",
    });
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-inspection">
                  <i className="fas fa-plus mr-2"></i>
                  New Inspection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Inspection</DialogTitle>
                  <DialogDescription>
                    Start a new digital vehicle inspection for a customer.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Enter customer name"
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicle-info">Vehicle Information</Label>
                    <Input
                      id="vehicle-info"
                      value={formData.vehicleInfo}
                      onChange={(e) => handleInputChange('vehicleInfo', e.target.value)}
                      placeholder="e.g., 2020 Honda Civic - ABC123"
                      data-testid="input-vehicle-info"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service-type">Service Type</Label>
                    <Select onValueChange={(value) => handleInputChange('serviceType', value)}>
                      <SelectTrigger data-testid="select-service-type">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oil-change">Oil Change</SelectItem>
                        <SelectItem value="brake-inspection">Brake Inspection</SelectItem>
                        <SelectItem value="general-inspection">General Inspection</SelectItem>
                        <SelectItem value="tire-rotation">Tire Rotation</SelectItem>
                        <SelectItem value="engine-diagnostic">Engine Diagnostic</SelectItem>
                        <SelectItem value="transmission-service">Transmission Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateInspection} data-testid="button-create-inspection">
                    Create Inspection
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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