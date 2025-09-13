import { useAuth } from "@/hooks/useAuth";
import { hasAccess, type UserRole, getRoleDisplayName } from "@/utils/roleAccess";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  path: string;
}

export default function ProtectedRoute({ children, path }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  
  const userRole = (user?.role as UserRole) || 'user';
  const hasPermission = hasAccess(userRole, path);

  useEffect(() => {
    // Don't do anything while still loading auth
    if (isLoading) {
      return;
    }

    // If user is not authenticated, redirect to home (landing page)
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }
    
    // If user doesn't have permission, show access denied briefly then redirect
    if (!hasPermission) {
      setShowAccessDenied(true);
      setTimeout(() => {
        setLocation("/");
      }, 2000); // Show message for 2 seconds before redirect
    }
  }, [hasPermission, isAuthenticated, isLoading, setLocation]);

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If user doesn't have access, show access denied message
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Your role: <span className="font-medium">{getRoleDisplayName(userRole)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                This page requires different permissions.
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => setLocation("/")}
                className="w-full"
                data-testid="button-back-to-dashboard"
              >
                Back to Dashboard
              </Button>
              <p className="text-xs text-muted-foreground">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}