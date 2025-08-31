import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/sidebar";

export default function Reporting() {
  const reports = [
    {
      id: "RPT-001",
      name: "Monthly Revenue Report",
      description: "Revenue breakdown by service type and time period",
      category: "Financial",
      lastRun: "2024-01-15",
      format: "PDF"
    },
    {
      id: "RPT-002",
      name: "Customer Activity Report", 
      description: "Customer visit frequency and service history",
      category: "Customer",
      lastRun: "2024-01-14",
      format: "Excel"
    },
    {
      id: "RPT-003",
      name: "Technician Performance",
      description: "Productivity and efficiency metrics by technician",
      category: "Operations",
      lastRun: "2024-01-13",
      format: "PDF"
    },
    {
      id: "RPT-004",
      name: "Inventory Usage Report",
      description: "Parts consumption and reorder recommendations",
      category: "Inventory",
      lastRun: "2024-01-12",
      format: "Excel"
    }
  ];

  const quickStats = [
    { title: "Total Reports", value: "12", icon: "fas fa-file-alt", color: "blue" },
    { title: "This Month", value: "8", icon: "fas fa-calendar", color: "green" },
    { title: "Scheduled", value: "5", icon: "fas fa-clock", color: "yellow" },
    { title: "Automated", value: "3", icon: "fas fa-robot", color: "purple" }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600", 
      yellow: "bg-yellow-100 text-yellow-600",
      purple: "bg-purple-100 text-purple-600"
    };
    return colorMap[color as keyof typeof colorMap] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-reporting">Reporting</h1>
              <p className="text-muted-foreground">Generate business reports and analytics</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-schedule-report">
                <i className="fas fa-clock mr-2"></i>
                Schedule Report
              </Button>
              <Button data-testid="button-new-report">
                <i className="fas fa-plus mr-2"></i>
                Create Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${getColorClasses(stat.color)} rounded-lg flex items-center justify-center mr-4`}>
                      <i className={`${stat.icon} text-xl`}></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Quick Report Generator */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Report Generator</CardTitle>
                <CardDescription>Generate reports instantly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Report Type</label>
                    <Select>
                      <SelectTrigger data-testid="select-report-type">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue Report</SelectItem>
                        <SelectItem value="customer">Customer Report</SelectItem>
                        <SelectItem value="inventory">Inventory Report</SelectItem>
                        <SelectItem value="performance">Performance Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Select>
                      <SelectTrigger data-testid="select-date-range">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 3 months</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Format</label>
                    <Select>
                      <SelectTrigger data-testid="select-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" data-testid="button-generate-report">
                    <i className="fas fa-file-download mr-2"></i>
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.slice(0, 4).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{report.name}</h4>
                        <p className="text-xs text-muted-foreground">{report.category} • {report.format}</p>
                        <p className="text-xs text-muted-foreground">Last run: {new Date(report.lastRun).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" data-testid={`button-download-${report.id}`}>
                          <i className="fas fa-download text-xs"></i>
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-regenerate-${report.id}`}>
                          <i className="fas fa-redo text-xs"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Reports */}
          <Card>
            <CardHeader>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>Complete list of available reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{report.name}</h4>
                        <span className="text-xs px-2 py-1 bg-secondary rounded text-secondary-foreground">
                          {report.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{report.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Last run: {new Date(report.lastRun).toLocaleDateString()} • Format: {report.format}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-view-${report.id}`}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-run-${report.id}`}>
                        Run Now
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-schedule-${report.id}`}>
                        Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}