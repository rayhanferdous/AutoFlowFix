import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";

export default function JobBoard() {
  const jobs = [
    {
      id: "JOB-001",
      title: "Oil Change & Filter",
      vehicle: "2018 Honda Civic",
      customer: "John Smith",
      assignedTo: "Mike Johnson",
      priority: "medium",
      status: "in-progress",
      estimatedTime: "1 hour",
      dueDate: "2024-01-15"
    },
    {
      id: "JOB-002",
      title: "Brake Inspection & Repair",
      vehicle: "2020 Toyota Camry", 
      customer: "Sarah Johnson",
      assignedTo: "Unassigned",
      priority: "high",
      status: "pending",
      estimatedTime: "3 hours",
      dueDate: "2024-01-14"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-job-board">Job Board</h1>
              <p className="text-muted-foreground">Track and manage work assignments</p>
            </div>
            <Button data-testid="button-assign-job">
              <i className="fas fa-plus mr-2"></i>
              Assign Job
            </Button>
          </div>

          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>{job.vehicle} - {job.customer}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(job.priority)}>
                        {job.priority}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{job.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estimated Time</p>
                      <p className="font-medium">{job.estimatedTime}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                      <p className="font-medium">{new Date(job.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-view-${job.id}`}>
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-update-${job.id}`}>
                        Update Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}