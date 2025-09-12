import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRepairOrderSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { z } from "zod";

type RepairOrder = {
  id: string;
  orderNumber: string;
  customerId: string;
  vehicleId: string;
  technicianId: string | null;
  status: string;
  priority: string;
  description: string;
  diagnosis: string | null;
  estimatedCost: string | null;
  actualCost: string | null;
  laborHours: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export default function RepairOrders() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);

  const { data: repairOrders, isLoading } = useQuery({
    queryKey: ["/api/repair-orders"],
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const form = useForm<z.infer<typeof insertRepairOrderSchema>>({
    resolver: zodResolver(insertRepairOrderSchema),
    defaultValues: {
      orderNumber: `RO-${Date.now()}`,
      customerId: "",
      vehicleId: "",
      technicianId: "",
      status: "created",
      priority: "normal",
      description: "",
      diagnosis: "",
      estimatedCost: "",
      actualCost: "",
      laborHours: "",
    },
  });

  const customerId = form.watch("customerId");
  
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["/api/customers", customerId, "vehicles"],
    enabled: !!customerId,
  });

  useEffect(() => {
    if (customerId) {
      form.setValue("vehicleId", "");
    }
  }, [customerId, form]);

  const createRepairOrderMutation = useMutation({
    mutationFn: async (repairOrderData: z.infer<typeof insertRepairOrderSchema>) => {
      return await apiRequest("POST", "/api/repair-orders", repairOrderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-orders"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Repair order created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create repair order",
        variant: "destructive",
      });
    },
  });

  const updateRepairOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof insertRepairOrderSchema> }) => {
      return await apiRequest("PUT", `/api/repair-orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-orders"] });
      setIsEditDialogOpen(false);
      setSelectedOrder(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Repair order updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update repair order",
        variant: "destructive",
      });
    },
  });

  const editForm = useForm<z.infer<typeof insertRepairOrderSchema>>({
    resolver: zodResolver(insertRepairOrderSchema),
    defaultValues: {
      orderNumber: "",
      customerId: "",
      vehicleId: "",
      technicianId: "",
      status: "created",
      priority: "normal",
      description: "",
      diagnosis: "",
      estimatedCost: "",
      actualCost: "",
      laborHours: "",
    },
  });

  const editCustomerId = editForm.watch("customerId");
  
  const { data: editVehicles, isLoading: isLoadingEditVehicles } = useQuery({
    queryKey: ["/api/customers", editCustomerId, "vehicles"],
    enabled: !!editCustomerId && isEditDialogOpen,
  });

  useEffect(() => {
    if (editCustomerId) {
      editForm.setValue("vehicleId", "");
    }
  }, [editCustomerId, editForm]);

  const handleViewOrder = (order: RepairOrder) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditOrder = (order: RepairOrder) => {
    setSelectedOrder(order);
    editForm.reset({
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      vehicleId: order.vehicleId,
      technicianId: order.technicianId || "",
      status: order.status,
      priority: order.priority,
      description: order.description,
      diagnosis: order.diagnosis || "",
      estimatedCost: order.estimatedCost || "",
      actualCost: order.actualCost || "",
      laborHours: order.laborHours || "",
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: z.infer<typeof insertRepairOrderSchema>) => {
    // Convert string values to proper types
    const formattedData = {
      ...data,
      estimatedCost: data.estimatedCost ? data.estimatedCost : null,
      actualCost: data.actualCost ? data.actualCost : null,
      laborHours: data.laborHours ? data.laborHours : null,
      technicianId: data.technicianId || null,
    };
    createRepairOrderMutation.mutate(formattedData);
  };

  const onEditSubmit = (data: z.infer<typeof insertRepairOrderSchema>) => {
    if (!selectedOrder) return;
    // Convert string values to proper types
    const formattedData = {
      ...data,
      estimatedCost: data.estimatedCost ? data.estimatedCost : null,
      actualCost: data.actualCost ? data.actualCost : null,
      laborHours: data.laborHours ? data.laborHours : null,
      technicianId: data.technicianId || null,
    };
    updateRepairOrderMutation.mutate({ id: selectedOrder.id, data: formattedData });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "awaiting_parts": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredRepairOrders = Array.isArray(repairOrders) ? repairOrders.filter((order: RepairOrder) => 
    statusFilter === "all" || order.status === statusFilter
  ) : [];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-repair-orders-title">
                Repair Orders
              </h2>
              <p className="text-muted-foreground">
                Manage repair orders with real-time status tracking and comprehensive audit trails.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-repair-order">
                  <i className="fas fa-wrench mr-2"></i>
                  Create Repair Order
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Create New Repair Order</DialogTitle>
                  <DialogDescription>
                    Create a new repair order with secure data persistence and audit trails.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="orderNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                data-testid="input-order-number"
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-customer">
                                  <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(customers) ? customers.map((customer: any) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.firstName} {customer.lastName}
                                  </SelectItem>
                                )) : null}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vehicleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!customerId || isLoadingVehicles}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-vehicle">
                                  <SelectValue 
                                    placeholder={
                                      !customerId ? "Select a customer first" :
                                      isLoadingVehicles ? "Loading vehicles..." :
                                      "Select a vehicle"
                                    } 
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(vehicles) ? vehicles.map((vehicle: any) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                                  </SelectItem>
                                )) : null}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "normal"}>
                              <FormControl>
                                <SelectTrigger data-testid="select-priority">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimatedCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Cost</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00" 
                                {...field} 
                                value={field.value || ""}
                                data-testid="input-estimated-cost"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the repair work needed..." 
                              {...field} 
                              value={field.value || ""}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Initial diagnosis or notes..." 
                              {...field} 
                              value={field.value || ""}
                              data-testid="textarea-diagnosis"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createRepairOrderMutation.isPending}
                        data-testid="button-submit-repair-order"
                      >
                        {createRepairOrderMutation.isPending ? "Creating..." : "Create Repair Order"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* View Repair Order Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>View Repair Order</DialogTitle>
              <DialogDescription>
                Repair order details (read-only)
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                    <p className="font-medium">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <div className="mt-1">
                      <Badge className={getPriorityColor(selectedOrder.priority)}>
                        {selectedOrder.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm bg-muted p-3 rounded border">{selectedOrder.description}</p>
                </div>
                
                {selectedOrder.diagnosis && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Diagnosis</label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded border">{selectedOrder.diagnosis}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  {selectedOrder.estimatedCost && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estimated Cost</label>
                      <p className="font-medium">${selectedOrder.estimatedCost}</p>
                    </div>
                  )}
                  {selectedOrder.actualCost && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Actual Cost</label>
                      <p className="font-medium">${selectedOrder.actualCost}</p>
                    </div>
                  )}
                  {selectedOrder.laborHours && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Labor Hours</label>
                      <p className="font-medium">{selectedOrder.laborHours}h</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button onClick={() => setIsViewDialogOpen(false)} data-testid="button-close-view">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Repair Order Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Edit Repair Order</DialogTitle>
              <DialogDescription>
                Update repair order details
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="orderNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            data-testid="input-edit-order-number"
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "created"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="created">Created</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-customer">
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(customers) ? customers.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.firstName} {customer.lastName}
                              </SelectItem>
                            )) : null}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!editCustomerId || isLoadingEditVehicles}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-vehicle">
                              <SelectValue 
                                placeholder={
                                  !editCustomerId ? "Select a customer first" :
                                  isLoadingEditVehicles ? "Loading vehicles..." :
                                  "Select a vehicle"
                                } 
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(editVehicles) ? editVehicles.map((vehicle: any) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                              </SelectItem>
                            )) : null}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "normal"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Cost</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-edit-estimated-cost"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="actualCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Cost</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-edit-actual-cost"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="laborHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Labor Hours</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.5"
                            placeholder="0" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-edit-labor-hours"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the repair work needed..." 
                          {...field} 
                          value={field.value || ""}
                          data-testid="textarea-edit-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Updated diagnosis or notes..." 
                          {...field} 
                          value={field.value || ""}
                          data-testid="textarea-edit-diagnosis"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateRepairOrderMutation.isPending}
                    data-testid="button-submit-edit-repair-order"
                  >
                    {updateRepairOrderMutation.isPending ? "Updating..." : "Update Repair Order"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="flex-1 p-8 space-y-6">
          {/* Status Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Repair Orders</CardTitle>
              <CardDescription>
                Filter repair orders by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1 max-w-xs">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Repair Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Repair Orders ({filteredRepairOrders.length})
              </CardTitle>
              <CardDescription>
                All repair order data is securely stored with comprehensive audit trails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : filteredRepairOrders.length === 0 ? (
                <div className="text-center py-12" data-testid="text-no-repair-orders">
                  <i className="fas fa-wrench text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No repair orders found</h3>
                  <p className="text-muted-foreground mb-4">
                    {statusFilter !== "all" ? "No repair orders match the selected filter" : "Get started by creating your first repair order"}
                  </p>
                  {statusFilter === "all" && (
                    <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-first-repair-order">
                      <i className="fas fa-wrench mr-2"></i>
                      Create First Repair Order
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRepairOrders.map((order: RepairOrder) => (
                    <div 
                      key={order.id} 
                      className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                      data-testid={`card-repair-order-${order.id}`}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <i className="fas fa-wrench text-primary"></i>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {order.orderNumber}
                          </h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {order.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            <i className="fas fa-calendar mr-1"></i>
                            Created: {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          {order.estimatedCost && (
                            <span>
                              <i className="fas fa-dollar-sign mr-1"></i>
                              Est: ${order.estimatedCost}
                            </span>
                          )}
                          {order.laborHours && (
                            <span>
                              <i className="fas fa-clock mr-1"></i>
                              {order.laborHours}h
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewOrder(order)}
                          data-testid={`button-view-repair-order-${order.id}`}
                        >
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditOrder(order)}
                          data-testid={`button-edit-repair-order-${order.id}`}
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
