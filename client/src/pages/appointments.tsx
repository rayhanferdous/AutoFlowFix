import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { z } from "zod";

type Appointment = {
  id: string;
  customerId: string;
  vehicleId: string;
  scheduledDate: string;
  duration: number;
  serviceType: string;
  description: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

export default function Appointments() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: z.infer<typeof insertAppointmentSchema>) => {
      return await apiRequest("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
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
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof insertAppointmentSchema>>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      customerId: "",
      vehicleId: "",
      scheduledDate: new Date(),
      duration: 60,
      serviceType: "",
      description: "",
      status: "scheduled",
      notes: "",
    },
  });

  const onSubmit = (data: z.infer<typeof insertAppointmentSchema>) => {
    createAppointmentMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const todaysAppointments = Array.isArray(appointments) ? appointments.filter((appointment: Appointment) => {
    const appointmentDate = new Date(appointment.scheduledDate).toISOString().split('T')[0];
    return appointmentDate === selectedDate;
  }) : [];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-appointments-title">
                Appointment Management
              </h2>
              <p className="text-muted-foreground">
                Schedule and manage customer appointments with automated reminders and notifications.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-schedule-appointment">
                  <i className="fas fa-calendar-plus mr-2"></i>
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>
                    Create a new appointment with secure data persistence and audit trails.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-service-type">
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="oil_change">Oil Change</SelectItem>
                              <SelectItem value="tire_service">Tire Service</SelectItem>
                              <SelectItem value="brake_service">Brake Service</SelectItem>
                              <SelectItem value="engine_diagnostic">Engine Diagnostic</SelectItem>
                              <SelectItem value="general_maintenance">General Maintenance</SelectItem>
                              <SelectItem value="inspection">Vehicle Inspection</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date & Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                data-testid="input-scheduled-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="60" 
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-duration"
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
                              placeholder="Describe the service needed..." 
                              {...field} 
                              value={field.value || ""}
                              data-testid="textarea-description"
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
                        disabled={createAppointmentMutation.isPending}
                        data-testid="button-submit-appointment"
                      >
                        {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="flex-1 p-8 space-y-6">
          {/* Date Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Calendar</CardTitle>
              <CardDescription>
                View and manage appointments by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <div className="flex-1 max-w-xs">
                  <Label htmlFor="date-select">Select Date</Label>
                  <Input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    data-testid="input-select-date"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    data-testid="button-today"
                  >
                    Today
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle>
                Appointments for {new Date(selectedDate + 'T00:00:00').toLocaleDateString("en-US", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </CardTitle>
              <CardDescription>
                {todaysAppointments.length} appointment(s) scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : todaysAppointments.length === 0 ? (
                <div className="text-center py-12" data-testid="text-no-appointments">
                  <i className="fas fa-calendar-alt text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No appointments scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    No appointments found for the selected date.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} data-testid="button-schedule-first">
                    <i className="fas fa-calendar-plus mr-2"></i>
                    Schedule First Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysAppointments.map((appointment: Appointment) => (
                    <div 
                      key={appointment.id} 
                      className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                      data-testid={`card-appointment-${appointment.id}`}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <i className="fas fa-calendar-check text-primary"></i>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {appointment.serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            <i className="fas fa-clock mr-1"></i>
                            {new Date(appointment.scheduledDate).toLocaleTimeString("en-US", { 
                              hour: "numeric", 
                              minute: "2-digit",
                              hour12: true 
                            })} ({appointment.duration} min)
                          </p>
                          {appointment.description && (
                            <p className="mt-1">{appointment.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" data-testid={`button-view-appointment-${appointment.id}`}>
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-edit-appointment-${appointment.id}`}>
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
