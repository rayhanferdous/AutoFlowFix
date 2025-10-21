import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { z } from "zod";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  createdAt: string;
};

export default function Customers() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: z.infer<typeof insertCustomerSchema>) => {
      return await apiRequest("POST", "/api/customers", customerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Customer created successfully",
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
        description: "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof insertCustomerSchema>>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    },
  });

  const onSubmit = (data: z.infer<typeof insertCustomerSchema>) => {
    createCustomerMutation.mutate(data);
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter((customer: Customer) =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  ) : [];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-customers-title">
                Customer Management
              </h2>
              <p className="text-muted-foreground">
                Manage customer information and service history with reliable data persistence.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-customer">
                  <i className="fas fa-plus mr-2"></i>
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Enter customer information. All data will be securely stored with audit trails.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John" 
                                {...field} 
                                data-testid="input-first-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                {...field} 
                                data-testid="input-last-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="john@example.com" 
                                {...field} 
                                value={field.value || ""}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(555) 123-4567" 
                                {...field} 
                                value={field.value || ""}
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="123 Main St" 
                              {...field} 
                              value={field.value || ""}
                              data-testid="input-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Anytown" 
                                {...field} 
                                value={field.value || ""}
                                data-testid="input-city"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="CA" 
                                {...field} 
                                value={field.value || ""}
                                data-testid="input-state"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="12345" 
                                {...field} 
                                value={field.value || ""}
                                data-testid="input-zip"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                        disabled={createCustomerMutation.isPending}
                        data-testid="button-submit-customer"
                      >
                        {createCustomerMutation.isPending ? "Creating..." : "Create Customer"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="flex-1 p-8 space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Search Customers</CardTitle>
              <CardDescription>
                Find customers by name, email, or phone number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search-customers"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Customers ({filteredCustomers.length})
              </CardTitle>
              <CardDescription>
                All customer data is securely stored with comprehensive audit trails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-12" data-testid="text-no-customers">
                  <i className="fas fa-users text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No customers found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first customer"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-customer">
                      <i className="fas fa-plus mr-2"></i>
                      Add First Customer
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCustomers.map((customer: Customer) => (
                    <div 
                      key={customer.id} 
                      className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                      data-testid={`card-customer-${customer.id}`}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {customer.email && (
                            <span>
                              <i className="fas fa-envelope mr-1"></i>
                              {customer.email}
                            </span>
                          )}
                          {customer.phone && (
                            <span>
                              <i className="fas fa-phone mr-1"></i>
                              {customer.phone}
                            </span>
                          )}
                        </div>
                        {(customer.city && customer.state) && (
                          <p className="text-sm text-muted-foreground">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            {customer.city}, {customer.state}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          Member since {new Date(customer.createdAt).getFullYear()}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewingCustomer(customer)}
                          data-testid={`button-view-customer-${customer.id}`}
                        >
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* View Customer Dialog */}
        <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                View customer information and contact details
              </DialogDescription>
            </DialogHeader>
            
            {viewingCustomer && (
              <div className="space-y-6">
                {/* Customer Name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-2xl">
                      {viewingCustomer.firstName[0]}{viewingCustomer.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">
                      {viewingCustomer.firstName} {viewingCustomer.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(viewingCustomer.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Contact Information</h4>
                  <div className="space-y-3">
                    {viewingCustomer.email && (
                      <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                        <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                          <i className="fas fa-envelope text-primary"></i>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{viewingCustomer.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {viewingCustomer.phone && (
                      <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                        <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                          <i className="fas fa-phone text-primary"></i>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium">{viewingCustomer.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {(viewingCustomer.address || viewingCustomer.city || viewingCustomer.state || viewingCustomer.zipCode) && (
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Address</h4>
                    <div className="p-3 bg-accent rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-map-marker-alt text-primary"></i>
                        </div>
                        <div>
                          {viewingCustomer.address && (
                            <p className="font-medium">{viewingCustomer.address}</p>
                          )}
                          {(viewingCustomer.city || viewingCustomer.state || viewingCustomer.zipCode) && (
                            <p className="text-muted-foreground">
                              {[viewingCustomer.city, viewingCustomer.state, viewingCustomer.zipCode]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setViewingCustomer(null)} data-testid="button-close-view">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
