import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { roleDisplayNames, type UserRole } from "@/utils/roleAccess";

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: string;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [editingRoles, setEditingRoles] = useState<Record<string, UserRole>>({});

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      return apiRequest(`/api/users/${userId}/role`, 'PATCH', { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      setEditingRoles({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setEditingRoles(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleUpdateRole = (userId: string) => {
    const newRole = editingRoles[userId];
    if (newRole) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const handleCancelEdit = (userId: string) => {
    setEditingRoles(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-500 hover:bg-red-600';
      case 'user': return 'bg-blue-500 hover:bg-blue-600';
      case 'client': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and access permissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            View and manage user roles. Only Shop Managers can modify user permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users && users.length > 0 ? (
              users.map((user) => {
                const isEditing = editingRoles[user.id] !== undefined;
                const currentRole = isEditing ? editingRoles[user.id] : user.role;
                
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`user-row-${user.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium" data-testid={`text-username-${user.id}`}>
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.username}
                          </h3>
                          {!isEditing && (
                            <Badge 
                              className={getRoleBadgeColor(user.role)}
                              data-testid={`badge-role-${user.id}`}
                            >
                              {roleDisplayNames[user.role]}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Username: {user.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <Select
                            value={currentRole}
                            onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                            data-testid={`select-role-${user.id}`}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="user">Technician</SelectItem>
                              <SelectItem value="admin">Shop Manager</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleUpdateRole(user.id)}
                            size="sm"
                            disabled={updateRoleMutation.isPending}
                            data-testid={`button-save-${user.id}`}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => handleCancelEdit(user.id)}
                            variant="outline"
                            size="sm"
                            data-testid={`button-cancel-${user.id}`}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleRoleChange(user.id, user.role)}
                          variant="outline"
                          size="sm"
                          data-testid={`button-edit-${user.id}`}
                        >
                          Edit Role
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}