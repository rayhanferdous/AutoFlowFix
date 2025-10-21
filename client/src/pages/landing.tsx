import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, User, Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";

export default function Landing() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  
  const [signInData, setSignInData] = useState({
    username: "",
    password: "",
  });
  
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/login", signInData);
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/register", {
        username: signUpData.username,
        email: signUpData.email,
        password: signUpData.password,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
      });
      
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform hover:scale-110 transition-transform duration-300">
              <i className="fas fa-car text-white text-2xl"></i>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                AutoFlow GMS
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">Garage Management System</p>
            </div>
          </div>
        </div>

        {/* Authentication Form - Modern Centered Design */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-8 pt-8">
              <div className="flex items-center justify-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isSignIn 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30'
                }`}>
                  {isSignIn ? (
                    <LogIn className="h-8 w-8 text-white" />
                  ) : (
                    <UserPlus className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {isSignIn ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-center text-base">
                {isSignIn 
                  ? "Sign in to access your dashboard"
                  : "Join us to manage your garage"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              {isSignIn ? (
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-username" className="text-slate-700 dark:text-slate-300 font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signin-username"
                        type="text"
                        placeholder="Enter your username"
                        value={signInData.username}
                        onChange={(e) => setSignInData({ ...signInData, username: e.target.value })}
                        required
                        disabled={isLoading}
                        data-testid="input-username"
                        className="pl-11 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-slate-800 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-slate-700 dark:text-slate-300 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                        disabled={isLoading}
                        data-testid="input-password"
                        className="pl-11 pr-11 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-slate-800 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02]"
                    disabled={isLoading}
                    data-testid="button-signin"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </Button>
                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={() => setIsSignIn(false)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      data-testid="link-signup"
                    >
                      Don't have an account? <span className="underline">Sign up</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstName" className="text-slate-700 dark:text-slate-300 font-medium">
                        First Name
                      </Label>
                      <Input
                        id="signup-firstName"
                        type="text"
                        placeholder="First name"
                        value={signUpData.firstName}
                        onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                        required
                        disabled={isLoading}
                        data-testid="input-firstname"
                        className="h-12 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-slate-800 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastName" className="text-slate-700 dark:text-slate-300 font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="signup-lastName"
                        type="text"
                        placeholder="Last name"
                        value={signUpData.lastName}
                        onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                        required
                        disabled={isLoading}
                        data-testid="input-lastname"
                        className="h-12 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-slate-800 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-slate-700 dark:text-slate-300 font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose a username"
                        value={signUpData.username}
                        onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                        required
                        disabled={isLoading}
                        data-testid="input-signup-username"
                        className="pl-11 h-12 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-slate-800 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-700 dark:text-slate-300 font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        disabled={isLoading}
                        data-testid="input-email"
                        className="pl-11 h-12 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-slate-800 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-700 dark:text-slate-300 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        disabled={isLoading}
                        data-testid="input-signup-password"
                        className="pl-11 pr-11 h-12 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-slate-800 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signup-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                        data-testid="input-confirm-password"
                        className="pl-11 pr-11 h-12 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-slate-800 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02]"
                    disabled={isLoading}
                    data-testid="button-signup"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </Button>
                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={() => setIsSignIn(true)}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                      data-testid="link-signin"
                    >
                      Already have an account? <span className="underline">Sign in</span>
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section - Compact Modern Cards */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Why Choose AutoFlow GMS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-blue-500/30">
                  <i className="fas fa-shield-alt text-white text-xl"></i>
                </div>
                <CardTitle className="text-lg">Data Integrity</CardTitle>
                <CardDescription className="text-sm">
                  PostgreSQL database with comprehensive validation and real-time error detection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-green-500/30">
                  <i className="fas fa-users text-white text-xl"></i>
                </div>
                <CardTitle className="text-lg">Customer Portal</CardTitle>
                <CardDescription className="text-sm">
                  Secure authentication and access to complete service history.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-purple-500/30">
                  <i className="fas fa-chart-line text-white text-xl"></i>
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription className="text-sm">
                  Comprehensive reporting with audit trails for all operations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-600 dark:text-slate-400 text-sm">
          <p>&copy; 2025 AutoFlow GMS. All rights reserved.</p>
          <p className="mt-1">Powered by Replit Infrastructure</p>
        </footer>
      </div>
    </div>
  );
}
