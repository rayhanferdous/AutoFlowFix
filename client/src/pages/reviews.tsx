import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/sidebar";
import { Plus, Send, Star, Percent, Trophy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewCampaignSchema, type ReviewCampaign, type Review, type InsertReviewCampaign } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type CreateCampaignForm = InsertReviewCampaign;

export default function Reviews() {
  const { toast } = useToast();
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<ReviewCampaign[]>({
    queryKey: ['/api/campaigns'],
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
  });

  const form = useForm<CreateCampaignForm>({
    resolver: zodResolver(insertReviewCampaignSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      trigger: "post_service",
      delayDays: 1,
      emailTemplate: "",
      smsTemplate: "",
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CreateCampaignForm) => {
      return await apiRequest('POST', '/api/campaigns', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      setIsCreateCampaignOpen(false);
      form.reset();
      toast({
        title: "Campaign Created",
        description: "Review campaign has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest('PATCH', `/api/campaigns/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: "Status Updated",
        description: "Campaign status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update campaign status.",
        variant: "destructive",
      });
    },
  });

  const handleToggleCampaign = (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toggleCampaignMutation.mutate({ id: campaignId, status: newStatus });
  };

  const onSubmitCampaign = (data: CreateCampaignForm) => {
    createCampaignMutation.mutate(data);
  };

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
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const calculateMetrics = () => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalResponses = campaigns.reduce((sum, c) => sum + (c.responseCount || 0), 0);
    const responseRate = totalSent > 0 ? Math.round((totalResponses / totalSent) * 100) : 0;
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

    return {
      totalSent,
      totalResponses,
      responseRate,
      avgRating,
    };
  };

  const metrics = calculateMetrics();

  const recentReviews = reviews.slice(0, 5);

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
            <Button onClick={() => setIsCreateCampaignOpen(true)} data-testid="button-new-campaign">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Review Campaigns</CardTitle>
                <CardDescription>Automated review request campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No campaigns yet. Create your first campaign to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => {
                      const campaignReviews = reviews.filter(r => r.campaignId === campaign.id);
                      const avgRating = campaignReviews.length > 0
                        ? (campaignReviews.reduce((sum, r) => sum + r.rating, 0) / campaignReviews.length).toFixed(1)
                        : "0.0";
                      const responseRate = campaign.sentCount && campaign.sentCount > 0
                        ? Math.round((campaign.responseCount / campaign.sentCount) * 100)
                        : 0;

                      return (
                        <div key={campaign.id} className="p-4 border border-border rounded-lg" data-testid={`campaign-${campaign.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{campaign.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(campaign.status)}>
                                {campaign.status}
                              </Badge>
                              <Switch
                                checked={campaign.status === 'active'}
                                onCheckedChange={() => handleToggleCampaign(campaign.id, campaign.status)}
                                data-testid={`toggle-campaign-${campaign.id}`}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{campaign.description || 'No description'}</p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Sent</p>
                              <p className="font-medium">{campaign.sentCount || 0}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Response Rate</p>
                              <p className="font-medium">{responseRate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Rating</p>
                              <p className="font-medium">{avgRating} ⭐</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
                ) : recentReviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. Reviews will appear here once customers respond.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="p-4 border border-border rounded-lg" data-testid={`review-${review.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Customer Review</h4>
                          {review.platform && <Badge variant="outline">{review.platform}</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment || 'No comment provided'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Send className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="metric-sent">{metrics.totalSent}</p>
                    <p className="text-sm text-muted-foreground">Requests Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Star className="text-green-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="metric-received">{metrics.totalResponses}</p>
                    <p className="text-sm text-muted-foreground">Reviews Received</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <Percent className="text-yellow-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="metric-response-rate">{metrics.responseRate}%</p>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <Trophy className="text-purple-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="metric-avg-rating">{metrics.avgRating}</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Review Campaign</DialogTitle>
            <DialogDescription>
              Set up an automated campaign to request reviews from customers
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCampaign)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Post-Service Review Request"
                        data-testid="input-campaign-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Describe the purpose of this campaign"
                        data-testid="input-campaign-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Event</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-trigger">
                          <SelectValue placeholder="Select when to send" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="post_service">After Service Completion</SelectItem>
                        <SelectItem value="monthly">Monthly Follow-up</SelectItem>
                        <SelectItem value="manual">Manual Trigger</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delayDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay (Days)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        placeholder="Days to wait before sending"
                        data-testid="input-delay-days"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Template (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Email message template"
                        data-testid="input-email-template"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smsTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMS Template (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="SMS message template"
                        data-testid="input-sms-template"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateCampaignOpen(false)}
                  data-testid="button-cancel-campaign"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCampaignMutation.isPending} data-testid="button-submit-campaign">
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
