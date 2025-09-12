import { useAuth } from "@/hooks/useAuth";
import { hasAccess, type UserRole, getRoleDisplayName } from "@/utils/roleAccess";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  path: string;
}

export default function ProtectedRoute({ children, path }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  const userRole = (user?.role as UserRole) || 'user';
  const hasPermission = hasAccess(userRole, path);

  useEffect(() => {
    // If user is not authenticated, redirect to home (landing page)
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }
    
    // If user doesn't have permission, redirect to dashboard immediately
    if (!hasPermission) {
      setLocation("/");
    }
  }, [hasPermission, isAuthenticated, setLocation]);

  // If user is not authenticated, don't render anything (redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If user doesn't have access to this route, don't render anything (redirect in useEffect)
  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}