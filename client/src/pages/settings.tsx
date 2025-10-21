import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Building2, Clock, Bell, CreditCard, Link2, Shield } from "lucide-react";
import { useState, useEffect } from "react";

interface BusinessSettings {
  id: string;
  businessName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
}

interface OperatingHours {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

interface NotificationSettings {
  id: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  paymentNotifications: boolean;
}

interface BillingSettings {
  id: string;
  planName: string | null;
  planPrice: string | null;
  billingCycle: string | null;
  paymentMethod: string | null;
  cardLast4: string | null;
  cardExpiry: string | null;
  autoRenew: boolean;
}

interface IntegrationSettings {
  id: string;
  googleReviewsEnabled: boolean;
  googleReviewsApiKey: string | null;
  stripeEnabled: boolean;
  stripeApiKey: string | null;
  stripePublishableKey: string | null;
  twilioEnabled: boolean;
  twilioAccountSid: string | null;
  twilioAuthToken: string | null;
  twilioPhoneNumber: string | null;
}

interface SecuritySettings {
  id: string;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  requireSpecialChar: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  loginAttemptsLimit: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Settings() {
  const { toast } = useToast();

  // Business Settings
  const { data: businessData, isLoading: businessLoading } = useQuery<BusinessSettings | null>({
    queryKey: ['/api/settings/business'],
  });

  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    phone: '',
    email: '',
    website: '',
    address: '',
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async (data: Partial<BusinessSettings>) => {
      return await apiRequest('PUT', '/api/settings/business', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/business'] });
      toast({
        title: "Success",
        description: "Business settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update business settings",
        variant: "destructive",
      });
    },
  });

  // Operating Hours
  const { data: hoursData, isLoading: hoursLoading } = useQuery<OperatingHours[]>({
    queryKey: ['/api/settings/hours'],
  });

  const [hoursForm, setHoursForm] = useState<OperatingHours[]>([]);

  const updateHoursMutation = useMutation({
    mutationFn: async (data: Partial<OperatingHours>[]) => {
      return await apiRequest('PUT', '/api/settings/hours', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/hours'] });
      toast({
        title: "Success",
        description: "Operating hours updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update operating hours",
        variant: "destructive",
      });
    },
  });

  // Notification Settings
  const { data: notificationData, isLoading: notificationLoading } = useQuery<NotificationSettings | null>({
    queryKey: ['/api/settings/notifications'],
  });

  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    paymentNotifications: true,
  });

  const updateNotificationMutation = useMutation({
    mutationFn: async (data: Partial<NotificationSettings>) => {
      return await apiRequest('PUT', '/api/settings/notifications', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/notifications'] });
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  // Billing Settings
  const { data: billingData, isLoading: billingLoading } = useQuery<BillingSettings | null>({
    queryKey: ['/api/settings/billing'],
  });

  const [billingForm, setBillingForm] = useState({
    planName: '',
    planPrice: '',
    billingCycle: '',
    paymentMethod: '',
    cardLast4: '',
    cardExpiry: '',
    autoRenew: true,
  });

  const updateBillingMutation = useMutation({
    mutationFn: async (data: Partial<BillingSettings>) => {
      return await apiRequest('PUT', '/api/settings/billing', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/billing'] });
      toast({
        title: "Success",
        description: "Billing settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update billing settings",
        variant: "destructive",
      });
    },
  });

  // Integration Settings
  const { data: integrationData, isLoading: integrationLoading } = useQuery<IntegrationSettings | null>({
    queryKey: ['/api/settings/integrations'],
  });

  const [integrationForm, setIntegrationForm] = useState({
    googleReviewsEnabled: false,
    googleReviewsApiKey: '',
    stripeEnabled: false,
    stripeApiKey: '',
    stripePublishableKey: '',
    twilioEnabled: false,
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async (data: Partial<IntegrationSettings>) => {
      return await apiRequest('PUT', '/api/settings/integrations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/integrations'] });
      toast({
        title: "Success",
        description: "Integration settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update integration settings",
        variant: "destructive",
      });
    },
  });

  // Security Settings
  const { data: securityData, isLoading: securityLoading } = useQuery<SecuritySettings | null>({
    queryKey: ['/api/settings/security'],
  });

  const [securityForm, setSecurityForm] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireSpecialChar: true,
    requireNumbers: true,
    requireUppercase: true,
    loginAttemptsLimit: 5,
  });

  const updateSecurityMutation = useMutation({
    mutationFn: async (data: Partial<SecuritySettings>) => {
      return await apiRequest('PUT', '/api/settings/security', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/security'] });
      toast({
        title: "Success",
        description: "Security settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    },
  });

  // Sync forms with data
  useEffect(() => {
    if (businessData) {
      setBusinessForm({
        businessName: businessData.businessName ?? '',
        phone: businessData.phone ?? '',
        email: businessData.email ?? '',
        website: businessData.website ?? '',
        address: businessData.address ?? '',
      });
    }
  }, [businessData]);

  useEffect(() => {
    if (hoursData) {
      setHoursForm(hoursData);
    }
  }, [hoursData]);

  useEffect(() => {
    if (notificationData) {
      setNotificationForm({
        emailNotifications: notificationData.emailNotifications,
        smsNotifications: notificationData.smsNotifications,
        appointmentReminders: notificationData.appointmentReminders,
        paymentNotifications: notificationData.paymentNotifications,
      });
    }
  }, [notificationData]);

  useEffect(() => {
    if (billingData) {
      setBillingForm({
        planName: billingData.planName ?? '',
        planPrice: billingData.planPrice ?? '',
        billingCycle: billingData.billingCycle ?? '',
        paymentMethod: billingData.paymentMethod ?? '',
        cardLast4: billingData.cardLast4 ?? '',
        cardExpiry: billingData.cardExpiry ?? '',
        autoRenew: billingData.autoRenew ?? true,
      });
    }
  }, [billingData]);

  useEffect(() => {
    if (integrationData) {
      setIntegrationForm({
        googleReviewsEnabled: integrationData.googleReviewsEnabled ?? false,
        googleReviewsApiKey: integrationData.googleReviewsApiKey ?? '',
        stripeEnabled: integrationData.stripeEnabled ?? false,
        stripeApiKey: integrationData.stripeApiKey ?? '',
        stripePublishableKey: integrationData.stripePublishableKey ?? '',
        twilioEnabled: integrationData.twilioEnabled ?? false,
        twilioAccountSid: integrationData.twilioAccountSid ?? '',
        twilioAuthToken: integrationData.twilioAuthToken ?? '',
        twilioPhoneNumber: integrationData.twilioPhoneNumber ?? '',
      });
    }
  }, [integrationData]);

  useEffect(() => {
    if (securityData) {
      setSecurityForm({
        twoFactorEnabled: securityData.twoFactorEnabled ?? false,
        sessionTimeout: securityData.sessionTimeout ?? 30,
        passwordMinLength: securityData.passwordMinLength ?? 8,
        requireSpecialChar: securityData.requireSpecialChar ?? true,
        requireNumbers: securityData.requireNumbers ?? true,
        requireUppercase: securityData.requireUppercase ?? true,
        loginAttemptsLimit: securityData.loginAttemptsLimit ?? 5,
      });
    }
  }, [securityData]);

  // Convert empty strings to null to preserve database nullability
  const nullifyEmptyStrings = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = value === '' ? null : value;
    }
    return result;
  };

  const handleBusinessSubmit = () => {
    updateBusinessMutation.mutate(nullifyEmptyStrings(businessForm));
  };

  const handleHoursSubmit = () => {
    updateHoursMutation.mutate(hoursForm);
  };

  const handleNotificationSubmit = () => {
    updateNotificationMutation.mutate(notificationForm);
  };

  const handleBillingSubmit = () => {
    updateBillingMutation.mutate(nullifyEmptyStrings(billingForm));
  };

  const handleIntegrationSubmit = () => {
    updateIntegrationMutation.mutate(nullifyEmptyStrings(integrationForm));
  };

  const handleSecuritySubmit = () => {
    updateSecurityMutation.mutate(securityForm);
  };

  const updateHour = (dayOfWeek: number, field: string, value: any) => {
    setHoursForm((prev) =>
      prev.map((hour) =>
        hour.dayOfWeek === dayOfWeek ? { ...hour, [field]: value } : hour
      )
    );
  };

  const getHourValue = (hour: OperatingHours, field: 'openTime' | 'closeTime') => {
    const value = hour[field];
    return value === null ? '' : value;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground" data-testid="title-settings">Settings</h1>
            <p className="text-muted-foreground">Manage your garage management system preferences</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
              <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
              <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
              <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
              <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="grid gap-6">
                {/* Business Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Business Information
                    </CardTitle>
                    <CardDescription>Update your garage's basic information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {businessLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="business-name">Business Name</Label>
                            <Input
                              id="business-name"
                              value={businessForm.businessName}
                              onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                              placeholder="AutoFlow Garage"
                              data-testid="input-business-name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={businessForm.phone}
                              onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                              placeholder="(555) 123-4567"
                              data-testid="input-phone"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            value={businessForm.address}
                            onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                            placeholder="123 Main St, City, State 12345"
                            data-testid="textarea-address"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Business Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={businessForm.email}
                              onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                              placeholder="info@autoflowgarage.com"
                              data-testid="input-email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              value={businessForm.website}
                              onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                              placeholder="www.autoflowgarage.com"
                              data-testid="input-website"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleBusinessSubmit}
                          disabled={businessLoading || updateBusinessMutation.isPending}
                          data-testid="button-save-business"
                        >
                          {updateBusinessMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Operating Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Operating Hours
                    </CardTitle>
                    <CardDescription>Set your business hours for appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hoursLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {hoursForm.map((hour) => (
                            <div key={hour.dayOfWeek} className="flex items-center gap-4">
                              <div className="w-24">
                                <span className="text-sm font-medium">{DAYS[hour.dayOfWeek]}</span>
                              </div>
                              <Switch
                                checked={hour.isOpen}
                                onCheckedChange={(checked) => updateHour(hour.dayOfWeek, 'isOpen', checked)}
                                data-testid={`switch-${DAYS[hour.dayOfWeek].toLowerCase()}`}
                              />
                              <Input
                                type="time"
                                value={getHourValue(hour, 'openTime')}
                                onChange={(e) => updateHour(hour.dayOfWeek, 'openTime', e.target.value || null)}
                                className="w-32"
                                disabled={!hour.isOpen}
                                placeholder="08:00"
                                data-testid={`input-open-${DAYS[hour.dayOfWeek].toLowerCase()}`}
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={getHourValue(hour, 'closeTime')}
                                onChange={(e) => updateHour(hour.dayOfWeek, 'closeTime', e.target.value || null)}
                                className="w-32"
                                disabled={!hour.isOpen}
                                placeholder="18:00"
                                data-testid={`input-close-${DAYS[hour.dayOfWeek].toLowerCase()}`}
                              />
                            </div>
                          ))}
                        </div>
                        <Button
                          className="mt-4"
                          onClick={handleHoursSubmit}
                          disabled={hoursLoading || updateHoursMutation.isPending}
                          data-testid="button-save-hours"
                        >
                          {updateHoursMutation.isPending ? "Saving..." : "Save Hours"}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {notificationLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={notificationForm.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationForm({ ...notificationForm, emailNotifications: checked })
                          }
                          data-testid="switch-email-notifications"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">SMS Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive urgent notifications via SMS</p>
                        </div>
                        <Switch
                          checked={notificationForm.smsNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationForm({ ...notificationForm, smsNotifications: checked })
                          }
                          data-testid="switch-sms-notifications"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Appointment Reminders</h4>
                          <p className="text-sm text-muted-foreground">Send appointment reminders to customers</p>
                        </div>
                        <Switch
                          checked={notificationForm.appointmentReminders}
                          onCheckedChange={(checked) =>
                            setNotificationForm({ ...notificationForm, appointmentReminders: checked })
                          }
                          data-testid="switch-appointment-reminders"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Payment Notifications</h4>
                          <p className="text-sm text-muted-foreground">Notify about payment status changes</p>
                        </div>
                        <Switch
                          checked={notificationForm.paymentNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationForm({ ...notificationForm, paymentNotifications: checked })
                          }
                          data-testid="switch-payment-notifications"
                        />
                      </div>
                      <Button
                        onClick={handleNotificationSubmit}
                        disabled={notificationLoading || updateNotificationMutation.isPending}
                        data-testid="button-save-notifications"
                      >
                        {updateNotificationMutation.isPending ? "Saving..." : "Save Preferences"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription>Manage your subscription and billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {billingLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="plan-name">Plan Name</Label>
                          <Input
                            id="plan-name"
                            value={billingForm.planName}
                            onChange={(e) => setBillingForm({ ...billingForm, planName: e.target.value })}
                            placeholder="Professional Plan"
                            data-testid="input-plan-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="plan-price">Plan Price</Label>
                          <Input
                            id="plan-price"
                            value={billingForm.planPrice}
                            onChange={(e) => setBillingForm({ ...billingForm, planPrice: e.target.value })}
                            placeholder="$99"
                            data-testid="input-plan-price"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billing-cycle">Billing Cycle</Label>
                          <Input
                            id="billing-cycle"
                            value={billingForm.billingCycle}
                            onChange={(e) => setBillingForm({ ...billingForm, billingCycle: e.target.value })}
                            placeholder="monthly"
                            data-testid="input-billing-cycle"
                          />
                        </div>
                        <div>
                          <Label htmlFor="payment-method">Payment Method</Label>
                          <Input
                            id="payment-method"
                            value={billingForm.paymentMethod}
                            onChange={(e) => setBillingForm({ ...billingForm, paymentMethod: e.target.value })}
                            placeholder="Credit Card"
                            data-testid="input-payment-method"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="card-last4">Card Last 4 Digits</Label>
                          <Input
                            id="card-last4"
                            value={billingForm.cardLast4}
                            onChange={(e) => setBillingForm({ ...billingForm, cardLast4: e.target.value })}
                            placeholder="1234"
                            maxLength={4}
                            data-testid="input-card-last4"
                          />
                        </div>
                        <div>
                          <Label htmlFor="card-expiry">Card Expiry</Label>
                          <Input
                            id="card-expiry"
                            value={billingForm.cardExpiry}
                            onChange={(e) => setBillingForm({ ...billingForm, cardExpiry: e.target.value })}
                            placeholder="12/26"
                            data-testid="input-card-expiry"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Auto Renew</h4>
                          <p className="text-sm text-muted-foreground">Automatically renew subscription</p>
                        </div>
                        <Switch
                          checked={billingForm.autoRenew}
                          onCheckedChange={(checked) =>
                            setBillingForm({ ...billingForm, autoRenew: checked })
                          }
                          data-testid="switch-auto-renew"
                        />
                      </div>
                      <Button
                        onClick={handleBillingSubmit}
                        disabled={billingLoading || updateBillingMutation.isPending}
                        data-testid="button-save-billing"
                      >
                        {updateBillingMutation.isPending ? "Saving..." : "Save Billing Settings"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Integrations
                  </CardTitle>
                  <CardDescription>Connect with external services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {integrationLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium">Google Reviews</h4>
                              <p className="text-sm text-muted-foreground">Sync customer reviews</p>
                            </div>
                            <Switch
                              checked={integrationForm.googleReviewsEnabled}
                              onCheckedChange={(checked) =>
                                setIntegrationForm({ ...integrationForm, googleReviewsEnabled: checked })
                              }
                              data-testid="switch-google-reviews"
                            />
                          </div>
                          {integrationForm.googleReviewsEnabled && (
                            <div>
                              <Label htmlFor="google-api-key">API Key</Label>
                              <Input
                                id="google-api-key"
                                type="password"
                                value={integrationForm.googleReviewsApiKey}
                                onChange={(e) =>
                                  setIntegrationForm({ ...integrationForm, googleReviewsApiKey: e.target.value })
                                }
                                placeholder="Enter Google API Key"
                                data-testid="input-google-api-key"
                              />
                            </div>
                          )}
                        </div>

                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium">Stripe Payments</h4>
                              <p className="text-sm text-muted-foreground">Process online payments</p>
                            </div>
                            <Switch
                              checked={integrationForm.stripeEnabled}
                              onCheckedChange={(checked) =>
                                setIntegrationForm({ ...integrationForm, stripeEnabled: checked })
                              }
                              data-testid="switch-stripe"
                            />
                          </div>
                          {integrationForm.stripeEnabled && (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="stripe-api-key">Secret API Key</Label>
                                <Input
                                  id="stripe-api-key"
                                  type="password"
                                  value={integrationForm.stripeApiKey}
                                  onChange={(e) =>
                                    setIntegrationForm({ ...integrationForm, stripeApiKey: e.target.value })
                                  }
                                  placeholder="sk_test_..."
                                  data-testid="input-stripe-api-key"
                                />
                              </div>
                              <div>
                                <Label htmlFor="stripe-publishable-key">Publishable Key</Label>
                                <Input
                                  id="stripe-publishable-key"
                                  value={integrationForm.stripePublishableKey}
                                  onChange={(e) =>
                                    setIntegrationForm({ ...integrationForm, stripePublishableKey: e.target.value })
                                  }
                                  placeholder="pk_test_..."
                                  data-testid="input-stripe-publishable-key"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium">Twilio SMS</h4>
                              <p className="text-sm text-muted-foreground">Send SMS notifications</p>
                            </div>
                            <Switch
                              checked={integrationForm.twilioEnabled}
                              onCheckedChange={(checked) =>
                                setIntegrationForm({ ...integrationForm, twilioEnabled: checked })
                              }
                              data-testid="switch-twilio"
                            />
                          </div>
                          {integrationForm.twilioEnabled && (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="twilio-account-sid">Account SID</Label>
                                <Input
                                  id="twilio-account-sid"
                                  value={integrationForm.twilioAccountSid}
                                  onChange={(e) =>
                                    setIntegrationForm({ ...integrationForm, twilioAccountSid: e.target.value })
                                  }
                                  placeholder="AC..."
                                  data-testid="input-twilio-account-sid"
                                />
                              </div>
                              <div>
                                <Label htmlFor="twilio-auth-token">Auth Token</Label>
                                <Input
                                  id="twilio-auth-token"
                                  type="password"
                                  value={integrationForm.twilioAuthToken}
                                  onChange={(e) =>
                                    setIntegrationForm({ ...integrationForm, twilioAuthToken: e.target.value })
                                  }
                                  placeholder="Enter Auth Token"
                                  data-testid="input-twilio-auth-token"
                                />
                              </div>
                              <div>
                                <Label htmlFor="twilio-phone-number">Phone Number</Label>
                                <Input
                                  id="twilio-phone-number"
                                  value={integrationForm.twilioPhoneNumber}
                                  onChange={(e) =>
                                    setIntegrationForm({ ...integrationForm, twilioPhoneNumber: e.target.value })
                                  }
                                  placeholder="+1234567890"
                                  data-testid="input-twilio-phone-number"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={handleIntegrationSubmit}
                        disabled={integrationLoading || updateIntegrationMutation.isPending}
                        data-testid="button-save-integrations"
                      >
                        {updateIntegrationMutation.isPending ? "Saving..." : "Save Integrations"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {securityLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Switch
                          checked={securityForm.twoFactorEnabled}
                          onCheckedChange={(checked) =>
                            setSecurityForm({ ...securityForm, twoFactorEnabled: checked })
                          }
                          data-testid="switch-2fa"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                          <Input
                            id="session-timeout"
                            type="number"
                            value={securityForm.sessionTimeout}
                            onChange={(e) =>
                              setSecurityForm({ ...securityForm, sessionTimeout: parseInt(e.target.value) || 30 })
                            }
                            data-testid="input-session-timeout"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password-min-length">Password Min Length</Label>
                          <Input
                            id="password-min-length"
                            type="number"
                            value={securityForm.passwordMinLength}
                            onChange={(e) =>
                              setSecurityForm({ ...securityForm, passwordMinLength: parseInt(e.target.value) || 8 })
                            }
                            data-testid="input-password-min-length"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Require Special Characters</h4>
                            <p className="text-sm text-muted-foreground">Password must contain special characters</p>
                          </div>
                          <Switch
                            checked={securityForm.requireSpecialChar}
                            onCheckedChange={(checked) =>
                              setSecurityForm({ ...securityForm, requireSpecialChar: checked })
                            }
                            data-testid="switch-require-special-char"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Require Numbers</h4>
                            <p className="text-sm text-muted-foreground">Password must contain numbers</p>
                          </div>
                          <Switch
                            checked={securityForm.requireNumbers}
                            onCheckedChange={(checked) =>
                              setSecurityForm({ ...securityForm, requireNumbers: checked })
                            }
                            data-testid="switch-require-numbers"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Require Uppercase</h4>
                            <p className="text-sm text-muted-foreground">Password must contain uppercase letters</p>
                          </div>
                          <Switch
                            checked={securityForm.requireUppercase}
                            onCheckedChange={(checked) =>
                              setSecurityForm({ ...securityForm, requireUppercase: checked })
                            }
                            data-testid="switch-require-uppercase"
                          />
                        </div>

                        <div>
                          <Label htmlFor="login-attempts-limit">Login Attempts Limit</Label>
                          <Input
                            id="login-attempts-limit"
                            type="number"
                            value={securityForm.loginAttemptsLimit}
                            onChange={(e) =>
                              setSecurityForm({ ...securityForm, loginAttemptsLimit: parseInt(e.target.value) || 5 })
                            }
                            data-testid="input-login-attempts-limit"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleSecuritySubmit}
                        disabled={securityLoading || updateSecurityMutation.isPending}
                        data-testid="button-save-security"
                      >
                        {updateSecurityMutation.isPending ? "Saving..." : "Save Security Settings"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
