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
  estimatedTime: z.string().min(1, "Estimated time is required"),
  notes: z.string().optional(),
});

export default function JobBoard() {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch repair orders for job assignment
  const { data: repairOrders } = useQuery({
    queryKey: ["/api/repair-orders"],
  });

  // Fetch customers to get technician info (for now using customers as technicians)
  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Form for job assignment
  const assignForm = useForm<z.infer<typeof assignJobSchema>>({
    resolver: zodResolver(assignJobSchema),
    defaultValues: {
      repairOrderId: "",
      technicianId: "",
      priority: "normal",
      estimatedTime: "",
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

  const handleAssignJob = () => {
    setIsAssignDialogOpen(true);
  };

  const onAssignSubmit = (data: z.infer<typeof assignJobSchema>) => {
    assignJobMutation.mutate(data);
  };
  const jobs = [
    {
      id: "JOB-001",
      title: "Oil Change & Filter",
      vehicle: "2018 Honda Civic",
      customer: "John Smith",
      assignedTo: "Mike Johnson",
      priority: "medium",
      status: "in-progress",
      estimatedTime: "1 hour",
      dueDate: "2024-01-15"
    },
    {
      id: "JOB-002",
      title: "Brake Inspection & Repair",
      vehicle: "2020 Toyota Camry", 
      customer: "Sarah Johnson",
      assignedTo: "Unassigned",
      priority: "high",
      status: "pending",
      estimatedTime: "3 hours",
      dueDate: "2024-01-14"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
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
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-job-board">Job Board</h1>
              <p className="text-muted-foreground">Track and manage work assignments</p>
            </div>
            <Button onClick={handleAssignJob} data-testid="button-assign-job">
              <i className="fas fa-plus mr-2"></i>
              Assign Job
            </Button>
          </div>

          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
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
                        {job.status}
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
                      <p className="font-medium">{new Date(job.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-view-${job.id}`}>
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-update-${job.id}`}>
                        Update Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                            {Array.isArray(repairOrders) ? repairOrders.map((order: any) => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.orderNumber} - {order.description}
                              </SelectItem>
                            )) : null}
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
                    name="estimatedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Time</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 2 hours" 
                            {...field}
                            data-testid="input-estimated-time"
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
      </main>
    </div>
  );
}