import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Inspection, InsertInspection, Customer, Vehicle } from "@shared/schema";

export default function Inspections() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    serviceType: ""
  });
  const { toast } = useToast();

  // Fetch data from API
  const { data: inspections = [], isLoading } = useQuery<Inspection[]>({
    queryKey: ['/api/inspections'],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Get vehicles for selected customer
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/customers", formData.customerId, "vehicles"],
    enabled: !!formData.customerId,
  });

  // Reset vehicleId when customer changes
  useEffect(() => {
    if (formData.customerId) {
      setFormData(prev => ({ ...prev, vehicleId: "" }));
    }
  }, [formData.customerId]);

  // Create inspection mutation
  const createInspectionMutation = useMutation({
    mutationFn: (inspection: InsertInspection) => 
      apiRequest('POST', '/api/inspections', inspection),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      setFormData({ customerId: "", vehicleId: "", serviceType: "" });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "New inspection created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create inspection",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateInspection = async () => {
    if (!formData.customerId || !formData.vehicleId || !formData.serviceType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Get customer and vehicle info for display
    const selectedCustomer = customers?.find(c => c.id === formData.customerId);
    const selectedVehicle = vehicles?.find(v => v.id === formData.vehicleId);
    
    if (!selectedCustomer || !selectedVehicle) {
      toast({
        title: "Error",
        description: "Selected customer or vehicle not found",
        variant: "destructive",
      });
      return;
    }

    const inspectionData: InsertInspection = {
      customerId: formData.customerId,
      vehicleId: formData.vehicleId,
      vehicleInfo: `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} - ${selectedVehicle.licensePlate}`,
      customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      serviceType: formData.serviceType,
      status: "pending",
      checklistItems: 12,
      completedItems: 0,
      notes: null,
    };

    createInspectionMutation.mutate(inspectionData);
  };

  const handleViewDetails = (inspection: Inspection) => {
    toast({
      title: "Inspection Details",
      description: `Viewing details for ${inspection.customerName}'s ${inspection.vehicleInfo} - Status: ${inspection.status}`,
    });
  };

  const handleContinueInspection = (inspection: Inspection) => {
    toast({
      title: "Continue Inspection",
      description: `Continuing inspection for ${inspection.customerName}'s ${inspection.vehicleInfo}`,
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
                    <Label htmlFor="customer">Customer</Label>
                    <Select onValueChange={(value) => handleInputChange('customerId', value)}>
                      <SelectTrigger data-testid="select-customer">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName} - {customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicle">Vehicle</Label>
                    <Select 
                      onValueChange={(value) => handleInputChange('vehicleId', value)}
                      disabled={!formData.customerId || isLoadingVehicles}
                    >
                      <SelectTrigger data-testid="select-vehicle">
                        <SelectValue 
                          placeholder={
                            !formData.customerId ? "Select a customer first" :
                            isLoadingVehicles ? "Loading vehicles..." :
                            "Select a vehicle"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <Button 
                    onClick={handleCreateInspection} 
                    disabled={createInspectionMutation.isPending}
                    data-testid="button-create-inspection"
                  >
                    {createInspectionMutation.isPending ? "Creating..." : "Create Inspection"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-muted-foreground">Loading inspections...</div>
              </div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No inspections found. Create your first inspection to get started.</p>
              </div>
            ) : (
              inspections.map((inspection) => (
                <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{inspection.id}</CardTitle>
                      <CardDescription>{inspection.vehicleInfo}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(inspection.status || "pending")}>
                      {inspection.status || "pending"}
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(inspection)}
                        data-testid={`button-view-${inspection.id}`}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleContinueInspection(inspection)}
                        data-testid={`button-edit-${inspection.id}`}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}