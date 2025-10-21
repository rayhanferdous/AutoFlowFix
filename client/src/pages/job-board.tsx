import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";

// Job assignment form schema
const assignJobSchema = z.object({
  repairOrderId: z.string().min(1, "Please select a repair order"),
  technicianId: z.string().min(1, "Please select a technician"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  laborHours: z.string().min(1, "Labor hours estimate is required"),
  notes: z.string().optional(),
});

// Update status form schema
const updateStatusSchema = z.object({
  status: z.enum(["created", "in_progress", "awaiting_parts", "completed"]),
  notes: z.string().optional(),
});

export default function JobBoard() {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch repair orders for job assignment and display
  const { data: repairOrders, isLoading: isLoadingRepairOrders } = useQuery({
    queryKey: ["/api/repair-orders"],
  });

  // Fetch users for technician selection
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  // Form for job assignment
  const assignForm = useForm<z.infer<typeof assignJobSchema>>({
    resolver: zodResolver(assignJobSchema),
    defaultValues: {
      repairOrderId: "",
      technicianId: "",
      priority: "normal",
      laborHours: "",
      notes: "",
    },
  });

  // Form for updating status
  const statusForm = useForm<z.infer<typeof updateStatusSchema>>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: "created",
      notes: "",
    },
  });

  // Job assignment mutation (for now we'll update the repair order)
  const assignJobMutation = useMutation({
    mutationFn: async (jobData: z.infer<typeof assignJobSchema>) => {
      // Update the repair order with technician assignment
      return await apiRequest("PUT", `/api/repair-orders/${jobData.repairOrderId}`, {
        technicianId: jobData.technicianId,
        priority: jobData.priority,
        laborHours: jobData.laborHours, // Send as string, backend will handle conversion
        diagnosis: jobData.notes || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-orders"] });
      setIsAssignDialogOpen(false);
      assignForm.reset();
      toast({
        title: "Success",
        description: "Job assigned successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign job",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (statusData: z.infer<typeof updateStatusSchema>) => {
      if (!selectedJob) throw new Error("No job selected");
      return await apiRequest("PUT", `/api/repair-orders/${selectedJob.id}`, {
        status: statusData.status,
        diagnosis: statusData.notes || selectedJob.diagnosis,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-orders"] });
      setIsUpdateStatusDialogOpen(false);
      setSelectedJob(null);
      statusForm.reset();
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleAssignJob = () => {
    setIsAssignDialogOpen(true);
  };

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (job: any) => {
    setSelectedJob(job);
    statusForm.reset({
      status: job.status,
      notes: "",
    });
    setIsUpdateStatusDialogOpen(true);
  };

  const onAssignSubmit = (data: z.infer<typeof assignJobSchema>) => {
    assignJobMutation.mutate(data);
  };

  const onStatusSubmit = (data: z.infer<typeof updateStatusSchema>) => {
    updateStatusMutation.mutate(data);
  };
  // Transform repair orders into job format for display
  const jobs = Array.isArray(repairOrders) ? repairOrders.map((order: any) => {
    // Build vehicle display string with proper fallback
    const vehicleParts = [order.vehicle?.year, order.vehicle?.make, order.vehicle?.model].filter(Boolean);
    const vehicle = vehicleParts.length > 0 ? vehicleParts.join(' ') : "Unknown Vehicle";
    
    // Build customer display string with proper fallback
    const customerParts = [order.customer?.firstName, order.customer?.lastName].filter(Boolean);
    const customer = customerParts.length > 0 ? customerParts.join(' ') : "Unknown Customer";
    
    return {
      id: order.id,
      title: order.description,
      vehicle,
      customer,
      assignedTo: order.technician ? `${order.technician.firstName} ${order.technician.lastName}` : "Unassigned",
      priority: order.priority || "normal",
      status: order.status || "created",
      estimatedTime: order.laborHours ? `${order.laborHours} hours` : "Not set",
      dueDate: order.startedAt ? new Date(order.startedAt) : null
    };
  }) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "awaiting_parts": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "created": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-job-board">Job Board</h1>
              <p className="text-muted-foreground">Track and manage work assignments</p>
            </div>
            <Button onClick={handleAssignJob} data-testid="button-assign-job">
              <i className="fas fa-plus mr-2"></i>
              Assign Job
            </Button>
          </div>

          <div className="grid gap-6">
            {isLoadingRepairOrders ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="h-12 bg-muted rounded"></div>
                        <div className="h-12 bg-muted rounded"></div>
                        <div className="h-12 bg-muted rounded"></div>
                        <div className="h-12 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-clipboard-list text-3xl text-muted-foreground"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Jobs Available</h3>
                  <p className="text-muted-foreground mb-4 text-center max-w-md">
                    There are currently no repair orders to display on the job board. Create repair orders to assign work to technicians.
                  </p>
                  <Button onClick={handleAssignJob}>
                    <i className="fas fa-plus mr-2"></i>
                    Assign First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow" data-testid={`job-card-${job.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription>{job.vehicle} - {job.customer}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.split('_').join(' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                        <p className="font-medium">{job.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                        <p className="font-medium">{job.estimatedTime}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                        <p className="font-medium">{job.dueDate ? job.dueDate.toLocaleDateString() : "Not scheduled"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(job)}
                          data-testid={`button-view-${job.id}`}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUpdateStatus(job)}
                          data-testid={`button-update-${job.id}`}
                        >
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Assign Job Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Assign Job</DialogTitle>
              <DialogDescription>
                Assign a repair order to a technician for completion
              </DialogDescription>
            </DialogHeader>
            
            <Form {...assignForm}>
              <form onSubmit={assignForm.handleSubmit(onAssignSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={assignForm.control}
                    name="repairOrderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repair Order</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-repair-order">
                              <SelectValue placeholder="Select a repair order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingRepairOrders ? (
                              <SelectItem value="loading" disabled>Loading repair orders...</SelectItem>
                            ) : Array.isArray(repairOrders) && repairOrders.length > 0 ? repairOrders.map((order: any) => (
                              <SelectItem key={order.id} value={String(order.id)}>
                                {order.orderNumber} - {order.description}
                              </SelectItem>
                            )) : (
                              <SelectItem value="none" disabled>No repair orders available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={assignForm.control}
                    name="technicianId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technician</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-technician">
                              <SelectValue placeholder="Select a technician" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingUsers ? (
                              <SelectItem value="loading" disabled>Loading technicians...</SelectItem>
                            ) : Array.isArray(users) && users.length > 0 ? users.map((user: any) => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.firstName} {user.lastName} ({user.role})
                              </SelectItem>
                            )) : (
                              <SelectItem value="none" disabled>No technicians available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={assignForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    control={assignForm.control}
                    name="laborHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Labor Hours</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.5"
                            placeholder="e.g., 2.5" 
                            {...field}
                            data-testid="input-labor-hours"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={assignForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes or instructions for the technician..." 
                          {...field}
                          data-testid="textarea-notes"
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
                    onClick={() => setIsAssignDialogOpen(false)}
                    data-testid="button-cancel-assign"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={assignJobMutation.isPending}
                    data-testid="button-submit-assign-job"
                  >
                    {assignJobMutation.isPending ? "Assigning..." : "Assign Job"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
              <DialogDescription>
                Complete information about this repair order
              </DialogDescription>
            </DialogHeader>
            
            {selectedJob && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                    <p className="text-lg font-semibold">{selectedJob.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                    <p className="text-lg font-semibold">{selectedJob.vehicle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedJob.status)}>
                      {selectedJob.status.split('_').join(' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                    <Badge className={getPriorityColor(selectedJob.priority)}>
                      {selectedJob.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{selectedJob.assignedTo}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="p-3 bg-muted rounded-md">{selectedJob.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                    <p className="font-medium">{selectedJob.estimatedTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                    <p className="font-medium">{selectedJob.dueDate ? selectedJob.dueDate.toLocaleDateString() : "Not scheduled"}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setIsDetailsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Job Status</DialogTitle>
              <DialogDescription>
                Update the status and add notes for this job
              </DialogDescription>
            </DialogHeader>
            
            <Form {...statusForm}>
              <form onSubmit={statusForm.handleSubmit(onStatusSubmit)} className="space-y-4">
                <FormField
                  control={statusForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="created">Created</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={statusForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any notes about this status update..." 
                          {...field}
                          data-testid="textarea-status-notes"
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
                    onClick={() => setIsUpdateStatusDialogOpen(false)}
                    data-testid="button-cancel-status"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-submit-status"
                  >
                    {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}