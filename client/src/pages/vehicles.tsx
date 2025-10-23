import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { z } from "zod";
import { Car, Edit, Trash2, Plus, Search } from "lucide-react";

type Vehicle = {
  id: string;
  customerId: string;
  year: number;
  make: string;
  model: string;
  vin: string | null;
  licensePlate: string | null;
  color: string | null;
  mileage: number | null;
  notes: string | null;
  createdAt: string;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

export default function Vehicles() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user to determine role
  const { data: user } = useQuery<{ id: string; username: string; email: string; role: string }>({
    queryKey: ["/api/auth/user"],
  });

  // Fetch vehicles
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Fetch customers (for admin to assign vehicles)
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: user?.role === "admin",
  });

  // Fetch current user's customer profile (for non-admin to auto-assign vehicles)
  const { data: userCustomer } = useQuery<Customer>({
    queryKey: ["/api/customers/me"],
    enabled: user?.role === "client",
  });

  const isAdmin = user?.role === "admin";

  const createVehicleMutation = useMutation({
    mutationFn: async (vehicleData: z.infer<typeof insertVehicleSchema>) => {
      return await apiRequest("POST", "/api/vehicles", vehicleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setIsDialogOpen(false);
      setEditingVehicle(null);
      form.reset();
      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });
    },
    onError: (error: any) => {
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
        description: error.message || "Failed to add vehicle",
        variant: "destructive",
      });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertVehicleSchema>> }) => {
      return await apiRequest("PATCH", `/api/vehicles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setIsDialogOpen(false);
      setEditingVehicle(null);
      form.reset();
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setDeletingVehicle(null);
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof insertVehicleSchema>>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      customerId: "",
      year: new Date().getFullYear(),
      make: "",
      model: "",
      vin: "",
      licensePlate: "",
      color: "",
      mileage: 0,
      notes: "",
    },
  });

  // Auto-populate customerId for non-admin users when their customer profile loads
  useEffect(() => {
    if (userCustomer?.id && !isAdmin) {
      form.setValue("customerId", userCustomer.id);
    }
  }, [userCustomer, isAdmin, form]);

  const onSubmit = (data: z.infer<typeof insertVehicleSchema>) => {
    if (editingVehicle) {
      updateVehicleMutation.mutate({ id: editingVehicle.id, data });
    } else {
      createVehicleMutation.mutate(data);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      customerId: vehicle.customerId,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin || "",
      licensePlate: vehicle.licensePlate || "",
      color: vehicle.color || "",
      mileage: vehicle.mileage || 0,
      notes: vehicle.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setDeletingVehicle(vehicle);
  };

  const confirmDelete = () => {
    if (deletingVehicle) {
      deleteVehicleMutation.mutate(deletingVehicle.id);
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers?.find((c: Customer) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown";
  };

  const filteredVehicles = Array.isArray(vehicles) ? vehicles.filter((vehicle: Vehicle) =>
    `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (isAdmin && getCustomerName(vehicle.customerId).toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-vehicles-title">
                <Car className="h-6 w-6" />
                Vehicle Management
              </h2>
              <p className="text-muted-foreground">
                {isAdmin ? "Manage all customer vehicles" : "Manage your vehicles"}
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingVehicle(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-vehicle">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                  <DialogDescription>
                    {editingVehicle ? "Update vehicle information" : "Add a new vehicle to the system"}
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {isAdmin && (
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-customer">
                                  <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customers?.map((customer: Customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.firstName} {customer.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-year"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="make"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Make *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Toyota" data-testid="input-make" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Camry" data-testid="input-model" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="vin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VIN</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="1HGBH41JXMN109186" data-testid="input-vin" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="licensePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Plate</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="ABC-1234" data-testid="input-license-plate" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="Silver" data-testid="input-color" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mileage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mileage</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value ?? 0}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-mileage"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="Additional notes..." data-testid="input-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingVehicle(null);
                          form.reset();
                        }}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                        data-testid="button-save-vehicle"
                      >
                        {createVehicleMutation.isPending || updateVehicleMutation.isPending ? "Saving..." : "Save Vehicle"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="flex-1 p-8">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by make, model, VIN, license plate, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-vehicles"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading vehicles...</div>
          ) : filteredVehicles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No vehicles found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? "Try a different search term" : "Add your first vehicle to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((vehicle: Vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow" data-testid={`card-vehicle-${vehicle.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg" data-testid={`text-vehicle-name-${vehicle.id}`}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </CardTitle>
                        {isAdmin && (
                          <CardDescription data-testid={`text-vehicle-customer-${vehicle.id}`}>
                            {getCustomerName(vehicle.customerId)}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(vehicle)}
                          data-testid={`button-edit-vehicle-${vehicle.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(vehicle)}
                          data-testid={`button-delete-vehicle-${vehicle.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {vehicle.color && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{vehicle.color}</Badge>
                      </div>
                    )}
                    {vehicle.licensePlate && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">License:</span>{" "}
                        <span className="font-medium" data-testid={`text-license-${vehicle.id}`}>{vehicle.licensePlate}</span>
                      </div>
                    )}
                    {vehicle.vin && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">VIN:</span>{" "}
                        <span className="font-mono text-xs" data-testid={`text-vin-${vehicle.id}`}>{vehicle.vin}</span>
                      </div>
                    )}
                    {vehicle.mileage !== null && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Mileage:</span>{" "}
                        <span className="font-medium" data-testid={`text-mileage-${vehicle.id}`}>{vehicle.mileage.toLocaleString()} mi</span>
                      </div>
                    )}
                    {vehicle.notes && (
                      <div className="text-sm text-muted-foreground pt-2 border-t">
                        {vehicle.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!deletingVehicle} onOpenChange={() => setDeletingVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingVehicle && `${deletingVehicle.year} ${deletingVehicle.make} ${deletingVehicle.model}`}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}