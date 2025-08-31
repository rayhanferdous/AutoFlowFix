import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
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

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
              <CardDescription>
                Access your secure garage management dashboard with reliable data persistence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogin} 
                className="w-full"
                data-testid="button-login"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
