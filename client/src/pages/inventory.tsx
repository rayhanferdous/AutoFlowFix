import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package, DollarSign, AlertTriangle, ShoppingCart, Edit, Trash2 } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";

// Inventory item type
type InventoryItem = {
  id: string;
  partNumber: string;
  name: string;
  description: string | null;
  category: string;
  quantity: number;
  minStock: number;
  unitCost: string;
  sellingPrice: string | null;
  supplier: string | null;
  supplierPartNumber: string | null;
  location: string | null;
  lastOrdered: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

// Form validation schema
const inventoryItemSchema = z.object({
  partNumber: z.string().min(1, "Part number is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or greater"),
  minStock: z.coerce.number().int().min(0, "Min stock must be 0 or greater"),
  unitCost: z.string().min(1, "Unit cost is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    { message: "Unit cost must be a valid positive number" }
  ),
  sellingPrice: z.string().optional().refine(
    (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
    { message: "Selling price must be a valid positive number" }
  ),
  supplier: z.string().optional(),
  supplierPartNumber: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

export default function Inventory() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // Fetch inventory items
  const { data: inventoryItems = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Fetch low stock items
  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  // Create inventory item mutation
  const createMutation = useMutation({
    mutationFn: async (data: InventoryItemFormData) => {
      const res = await apiRequest("POST", "/api/inventory", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
      setShowAddModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create inventory item",
        variant: "destructive",
      });
    },
  });

  // Update inventory item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventoryItemFormData> }) => {
      const res = await apiRequest("PATCH", `/api/inventory/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory item",
        variant: "destructive",
      });
    },
  });

  // Delete inventory item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
      setDeletingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete inventory item",
        variant: "destructive",
      });
    },
  });

  // Add form
  const addForm = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      partNumber: "",
      name: "",
      description: "",
      category: "",
      quantity: 0,
      minStock: 0,
      unitCost: 0,
      sellingPrice: 0,
      supplier: "",
      supplierPartNumber: "",
      location: "",
      notes: "",
    },
  });

  // Edit form
  const editForm = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
  });

  // Calculate metrics
  const totalItems = inventoryItems.length;
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + (Number(item.unitCost) * item.quantity), 0);
  const lowStockCount = lowStockItems.length;
  const pendingOrders = 0; // This would come from purchase orders in a full implementation

  // Get stock status
  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock) return { status: "Low Stock", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
    if (quantity <= minStock * 1.5) return { status: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    return { status: "In Stock", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
  };

  // Filter items based on search
  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (data: InventoryItemFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (data: InventoryItemFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    }
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    editForm.reset({
      partNumber: item.partNumber,
      name: item.name,
      description: item.description || "",
      category: item.category,
      quantity: item.quantity,
      minStock: item.minStock,
      unitCost: item.unitCost,
      sellingPrice: item.sellingPrice || undefined,
      supplier: item.supplier || "",
      supplierPartNumber: item.supplierPartNumber || "",
      location: item.location || "",
      notes: item.notes || "",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-inventory">Inventory</h1>
              <p className="text-muted-foreground">Manage parts and supplies inventory</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} data-testid="button-add-item">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    <Package className="text-blue-600 dark:text-blue-200 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalItems}</p>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                    <DollarSign className="text-green-600 dark:text-green-200 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${inventoryValue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Inventory Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
                    <AlertTriangle className="text-yellow-600 dark:text-yellow-200 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{lowStockCount}</p>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                    <ShoppingCart className="text-purple-600 dark:text-purple-200 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingOrders}</p>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>Track parts, supplies, and stock levels</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Search items..." 
                    className="w-64" 
                    data-testid="input-search-inventory"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search" : "Add your first inventory item to get started"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowAddModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Item
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Part Number</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Unit Cost</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => {
                        const stockStatus = getStockStatus(item.quantity, item.minStock);
                        return (
                          <tr key={item.id} className="border-b border-border hover:bg-accent" data-testid={`row-item-${item.id}`}>
                            <td className="py-3 px-4 font-mono text-sm">{item.partNumber}</td>
                            <td className="py-3 px-4 font-medium">{item.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                            <td className="py-3 px-4">
                              <div>
                                <span className="font-medium">{item.quantity}</span>
                                <span className="text-muted-foreground text-xs ml-1">(min: {item.minStock})</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">${Number(item.unitCost).toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <Badge className={stockStatus.color}>
                                {stockStatus.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openEditModal(item)}
                                  data-testid={`button-edit-${item.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setDeletingItem(item)}
                                  data-testid={`button-delete-${item.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Item Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>
                Add a new part or supply to your inventory
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="partNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Number *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-part-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-category" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-quantity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} data-testid="input-min-stock" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="unitCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Cost *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} data-testid="input-unit-cost" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} data-testid="input-selling-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-supplier" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="supplierPartNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Part Number</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-supplier-part-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-add">
                    {createMutation.isPending ? "Adding..." : "Add Item"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Item Modal */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>
                Update inventory item details
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="partNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Number *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="unitCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Cost *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="supplierPartNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Part Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Updating..." : "Update Item"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Inventory Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {deletingItem && (
              <div className="py-4">
                <p className="font-medium">{deletingItem.name}</p>
                <p className="text-sm text-muted-foreground">Part Number: {deletingItem.partNumber}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeletingItem(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
