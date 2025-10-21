import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, FileText, Clock, AlertTriangle, Plus, Banknote, CreditCard, FileCheck, Building2 } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  repairOrderId: string | null;
  amount: number;
  taxAmount: number | null;
  totalAmount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
};

type RepairOrder = {
  id: string;
  orderNumber: string;
  customerId: string;
};

// Form validation schema
const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  repairOrderId: z.string().optional(),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  taxAmount: z.string().optional().refine(
    (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
    { message: "Tax amount must be a valid number" }
  ),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function Invoices() {
  const { toast } = useToast();
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [collectingPayment, setCollectingPayment] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: repairOrders = [] } = useQuery<RepairOrder[]>({
    queryKey: ["/api/repair-orders"],
  });

  // Form for creating invoices
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      repairOrderId: "",
      amount: "",
      taxAmount: "",
      dueDate: "",
      notes: "",
    },
  });

  // Create invoice mutation
  const createMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const payload = {
        customerId: data.customerId,
        repairOrderId: data.repairOrderId || null,
        amount: parseFloat(data.amount),
        taxAmount: data.taxAmount ? parseFloat(data.taxAmount) : null,
        dueDate: data.dueDate,
        notes: data.notes || null,
      };
      const res = await apiRequest("POST", "/api/invoices", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      setShowCreateModal(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  // Calculate dynamic metrics
  const metrics = useMemo(() => {
    const displayInvoices = Array.isArray(invoices) ? invoices : [];
    const totalRevenue = displayInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const invoicesSent = displayInvoices.length;
    const pendingPayment = displayInvoices.filter(inv => inv.status === 'pending').length;
    const overdue = displayInvoices.filter(inv => inv.status === 'overdue').length;

    return { totalRevenue, invoicesSent, pendingPayment, overdue };
  }, [invoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCollectPayment = (invoice: Invoice) => {
    setCollectingPayment(invoice);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
  };

  const handleCreate = (data: InvoiceFormData) => {
    createMutation.mutate(data);
  };

  // Use real invoices data or empty array
  const displayInvoices = Array.isArray(invoices) ? invoices : [];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-invoices">Invoices & Payments</h1>
              <p className="text-muted-foreground">Manage billing and payment processing</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} data-testid="button-new-invoice">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                    <DollarSign className="text-green-600 dark:text-green-200 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="metric-total-revenue">
                      ${metrics.totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="text-blue-600 dark:text-blue-200 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="metric-invoices-sent">
                      {metrics.invoicesSent}
                    </p>
                    <p className="text-sm text-muted-foreground">Invoices Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="text-yellow-600 dark:text-yellow-200 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="metric-pending-payment">
                      {metrics.pendingPayment}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending Payment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-4">
                    <AlertTriangle className="text-red-600 dark:text-red-200 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="metric-overdue">
                      {metrics.overdue}
                    </p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Track payments and billing status</CardDescription>
                </div>
                <Input placeholder="Search invoices..." className="w-64" data-testid="input-search-invoices" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : displayInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                  <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Invoice
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayInvoices.map((invoice: Invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Invoice ID: {invoice.id.substring(0, 8)}...
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-lg font-bold">${invoice.totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                          data-testid={`button-view-${invoice.id}`}
                        >
                          View
                        </Button>
                        {invoice.status === "pending" && (
                          <Button 
                            size="sm"
                            onClick={() => handleCollectPayment(invoice)}
                            data-testid={`button-collect-${invoice.id}`}
                          >
                            Collect Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* View Invoice Modal */}
        <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                View complete invoice information
              </DialogDescription>
            </DialogHeader>
            
            {viewingInvoice && (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{viewingInvoice.invoiceNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(viewingInvoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(viewingInvoice.status)}>
                    {viewingInvoice.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Invoice ID</Label>
                    <p className="font-medium">{viewingInvoice.id.substring(0, 13)}...</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Customer ID</Label>
                    <p className="font-medium">{viewingInvoice.customerId.substring(0, 13)}...</p>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Amount Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${viewingInvoice.amount.toFixed(2)}</span>
                    </div>
                    {viewingInvoice.taxAmount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="font-medium">${viewingInvoice.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span>${viewingInvoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Due Date</Label>
                      <p className="font-medium">{new Date(viewingInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    {viewingInvoice.paidDate && (
                      <div>
                        <Label className="text-muted-foreground">Paid Date</Label>
                        <p className="font-medium">{new Date(viewingInvoice.paidDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {viewingInvoice.paymentMethod && (
                      <div>
                        <Label className="text-muted-foreground">Payment Method</Label>
                        <p className="font-medium">{viewingInvoice.paymentMethod}</p>
                      </div>
                    )}
                  </div>
                </div>

                {viewingInvoice.notes && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="mt-2 p-3 bg-accent rounded-md">{viewingInvoice.notes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setViewingInvoice(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Collect Payment Modal */}
        <Dialog open={!!collectingPayment} onOpenChange={() => setCollectingPayment(null)}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Collect Payment</DialogTitle>
              <DialogDescription>
                Process payment for invoice {collectingPayment?.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            
            {collectingPayment && (
              <div className="space-y-6">
                {/* Invoice Summary */}
                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-semibold">{collectingPayment.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Due</span>
                    <span>${collectingPayment.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Select Payment Method</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                      onClick={() => {
                        toast({
                          title: "Payment Processing",
                          description: "Cash payment recorded for " + collectingPayment.invoiceNumber,
                        });
                        setCollectingPayment(null);
                      }}
                    >
                      <Banknote className="h-8 w-8 text-green-600" />
                      <span>Cash</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                      onClick={() => {
                        toast({
                          title: "Payment Processing",
                          description: "Card payment recorded for " + collectingPayment.invoiceNumber,
                        });
                        setCollectingPayment(null);
                      }}
                    >
                      <CreditCard className="h-8 w-8 text-blue-600" />
                      <span>Card</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                      onClick={() => {
                        toast({
                          title: "Payment Processing",
                          description: "Check payment recorded for " + collectingPayment.invoiceNumber,
                        });
                        setCollectingPayment(null);
                      }}
                    >
                      <FileCheck className="h-8 w-8 text-purple-600" />
                      <span>Check</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                      onClick={() => {
                        toast({
                          title: "Payment Processing",
                          description: "Bank transfer recorded for " + collectingPayment.invoiceNumber,
                        });
                        setCollectingPayment(null);
                      }}
                    >
                      <Building2 className="h-8 w-8 text-orange-600" />
                      <span>Transfer</span>
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setCollectingPayment(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Invoice Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate a new invoice for a customer
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-customer">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} ({customer.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repairOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repair Order (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-repair-order">
                            <SelectValue placeholder="Select repair order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {repairOrders.map((ro) => (
                            <SelectItem key={ro.id} value={ro.id}>
                              {ro.orderNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            data-testid="input-amount"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            data-testid="input-tax-amount"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-due-date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional invoice notes..."
                          className="resize-none"
                          rows={3}
                          data-testid="input-notes"
                          {...field}
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
                    onClick={() => {
                      setShowCreateModal(false);
                      form.reset();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-invoice"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Invoice"}
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