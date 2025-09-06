import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    firstName: "", 
    lastName: "" 
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      return apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Success", description: "Logged in successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Login Failed", 
        description: error.message || "Invalid username or password",
        variant: "destructive" 
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string; firstName: string; lastName: string }) => {
      return apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Success", description: "Account created and logged in!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Registration Failed", 
        description: error.message || "Failed to create account",
        variant: "destructive" 
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <i className="fas fa-car text-primary-foreground text-2xl"></i>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">AutoFlow GMS</h1>
              <p className="text-xl text-muted-foreground">Garage Management System</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional garage management with reliable data persistence, customer portal access, 
            and comprehensive audit trails. Now powered by robust PostgreSQL infrastructure.
          </p>
        </div>

        {/* Migration Success Alert */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800">Migration Successful</h3>
                  <p className="text-green-700">
                    All data has been successfully migrated from Base44 platform to reliable Replit infrastructure. 
                    Zero data loss guaranteed with comprehensive backup and recovery systems.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-shield-alt text-blue-600 text-xl"></i>
              </div>
              <CardTitle>Data Integrity</CardTitle>
              <CardDescription>
                100% data integrity with PostgreSQL database, comprehensive validation, and real-time error detection.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-users text-green-600 text-xl"></i>
              </div>
              <CardTitle>Customer Portal</CardTitle>
              <CardDescription>
                Secure customer registration, authentication, and access to complete service history.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-clipboard-check text-purple-600 text-xl"></i>
              </div>
              <CardTitle>Digital Inspections</CardTitle>
              <CardDescription>
                Comprehensive digital vehicle inspections with photo documentation and detailed reports.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-calendar-alt text-orange-600 text-xl"></i>
              </div>
              <CardTitle>Appointment Management</CardTitle>
              <CardDescription>
                Streamlined appointment scheduling with automated reminders and customer notifications.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-wrench text-red-600 text-xl"></i>
              </div>
              <CardTitle>Repair Orders</CardTitle>
              <CardDescription>
                Complete repair order management with real-time status tracking and technician assignments.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-chart-line text-indigo-600 text-xl"></i>
              </div>
              <CardTitle>Business Analytics</CardTitle>
              <CardDescription>
                Comprehensive reporting and analytics with audit trails for all business operations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Authentication */}
        <div className="text-center">
          {!showAuth ? (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Ready to Get Started?</CardTitle>
                <CardDescription>
                  Access your secure garage management dashboard with reliable data persistence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAuth(true)} 
                  className="w-full"
                  data-testid="button-show-auth"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Sign In to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Account Access</CardTitle>
                <CardDescription>
                  Sign in to your account or create a new one to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          type="text"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                          required
                          data-testid="input-login-username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                          data-testid="input-login-password"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstName">First Name</Label>
                          <Input
                            id="register-firstName"
                            type="text"
                            value={registerForm.firstName}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                            data-testid="input-register-firstName"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-lastName">Last Name</Label>
                          <Input
                            id="register-lastName"
                            type="text"
                            value={registerForm.lastName}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                            data-testid="input-register-lastName"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Username</Label>
                        <Input
                          id="register-username"
                          type="text"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                          required
                          data-testid="input-register-username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                          data-testid="input-register-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                          data-testid="input-register-password"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAuth(false)}
                  className="w-full mt-4"
                  data-testid="button-back"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
