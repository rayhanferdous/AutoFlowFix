import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Vehicles from "@/pages/vehicles";
import Appointments from "@/pages/appointments";
import RepairOrders from "@/pages/repair-orders";
import CustomerPortal from "@/pages/customer-portal";
import Inspections from "@/pages/inspections";
import JobBoard from "@/pages/job-board";
import Messaging from "@/pages/messaging";
import Reviews from "@/pages/reviews";
import Invoices from "@/pages/invoices";
import Inventory from "@/pages/inventory";
import Reporting from "@/pages/reporting";
import Settings from "@/pages/settings";
import Users from "@/pages/users";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {isLoading || !isAuthenticated ? <Landing /> : <Dashboard />}
      </Route>
      <Route path="/customers">
        <ProtectedRoute path="/customers">
          <Customers />
        </ProtectedRoute>
      </Route>
       <Route path="/vehicles">
        <ProtectedRoute path="/vehicles">
          <Vehicles />
        </ProtectedRoute>
      </Route>
      <Route path="/appointments">
        <ProtectedRoute path="/appointments">
          <Appointments />
        </ProtectedRoute>
      </Route>
      <Route path="/repair-orders">
        <ProtectedRoute path="/repair-orders">
          <RepairOrders />
        </ProtectedRoute>
      </Route>
      <Route path="/customer-portal">
        <ProtectedRoute path="/customer-portal">
          <CustomerPortal />
        </ProtectedRoute>
      </Route>
      <Route path="/inspections">
        <ProtectedRoute path="/inspections">
          <Inspections />
        </ProtectedRoute>
      </Route>
      <Route path="/job-board">
        <ProtectedRoute path="/job-board">
          <JobBoard />
        </ProtectedRoute>
      </Route>
      <Route path="/messaging">
        <ProtectedRoute path="/messaging">
          <Messaging />
        </ProtectedRoute>
      </Route>
      <Route path="/reviews">
        <ProtectedRoute path="/reviews">
          <Reviews />
        </ProtectedRoute>
      </Route>
      <Route path="/invoices">
        <ProtectedRoute path="/invoices">
          <Invoices />
        </ProtectedRoute>
      </Route>
      <Route path="/inventory">
        <ProtectedRoute path="/inventory">
          <Inventory />
        </ProtectedRoute>
      </Route>
      <Route path="/reporting">
        <ProtectedRoute path="/reporting">
          <Reporting />
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute path="/users">
          <Users />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute path="/settings">
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
