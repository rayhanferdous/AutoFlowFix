import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();



  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/customers" component={Customers} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/repair-orders" component={RepairOrders} />
          <Route path="/customer-portal" component={CustomerPortal} />
          <Route path="/inspections" component={Inspections} />
          <Route path="/job-board" component={JobBoard} />
          <Route path="/messaging" component={Messaging} />
          <Route path="/reviews" component={Reviews} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/reporting" component={Reporting} />
          <Route path="/settings" component={Settings} />
        </>
      )}
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
