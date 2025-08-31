import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Sidebar from "@/components/sidebar";

export default function Reviews() {
  const campaigns = [
    {
      id: "CAM-001",
      name: "Post-Service Review Request",
      description: "Automatically request reviews after completed services",
      status: "active",
      sentCount: 45,
      responseRate: "32%",
      averageRating: 4.8
    },
    {
      id: "CAM-002", 
      name: "Monthly Follow-up",
      description: "Monthly check-in for review requests",
      status: "paused",
      sentCount: 12,
      responseRate: "25%",
      averageRating: 4.6
    }
  ];

  const recentReviews = [
    {
      id: "REV-001",
      customerName: "John Smith",
      rating: 5,
      comment: "Excellent service! My car runs like new.",
      platform: "Google",
      date: "2024-01-15"
    },
    {
      id: "REV-002",
      customerName: "Sarah Johnson",
      rating: 4,
      comment: "Great work, quick turnaround time.",
      platform: "Yelp", 
      date: "2024-01-14"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
    ));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-reviews">Reviews Campaign</h1>
              <p className="text-muted-foreground">Manage customer review requests and campaigns</p>
            </div>
            <Button data-testid="button-new-campaign">
              <i className="fas fa-plus mr-2"></i>
              New Campaign
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Active Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Review Campaigns</CardTitle>
                <CardDescription>Automated review request campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Switch defaultChecked={campaign.status === 'active'} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-medium">{campaign.sentCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Response Rate</p>
                          <p className="font-medium">{campaign.responseRate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Rating</p>
                          <p className="font-medium">{campaign.averageRating} ⭐</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{review.customerName}</h4>
                        <Badge variant="outline">{review.platform}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-paper-plane text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">57</p>
                    <p className="text-sm text-muted-foreground">Requests Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-star text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">18</p>
                    <p className="text-sm text-muted-foreground">Reviews Received</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-percentage text-yellow-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">32%</p>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="fas fa-trophy text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.7</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}