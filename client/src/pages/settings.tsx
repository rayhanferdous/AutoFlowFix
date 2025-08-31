import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/sidebar";

export default function Settings() {
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
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Update your garage's basic information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input id="business-name" placeholder="AutoFlow Garage" data-testid="input-business-name" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="(555) 123-4567" data-testid="input-phone" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" placeholder="123 Main St, City, State 12345" data-testid="textarea-address" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Business Email</Label>
                        <Input id="email" type="email" placeholder="info@autoflowgarage.com" data-testid="input-email" />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" placeholder="www.autoflowgarage.com" data-testid="input-website" />
                      </div>
                    </div>
                    <Button data-testid="button-save-business">Save Changes</Button>
                  </CardContent>
                </Card>

                {/* Operating Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle>Operating Hours</CardTitle>
                    <CardDescription>Set your business hours for appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="flex items-center gap-4">
                          <div className="w-24">
                            <span className="text-sm font-medium">{day}</span>
                          </div>
                          <Switch defaultChecked={day !== 'Sunday'} />
                          <Input type="time" defaultValue="08:00" className="w-32" />
                          <span className="text-muted-foreground">to</span>
                          <Input type="time" defaultValue="18:00" className="w-32" />
                        </div>
                      ))}
                    </div>
                    <Button className="mt-4" data-testid="button-save-hours">Save Hours</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-email-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive urgent notifications via SMS</p>
                    </div>
                    <Switch data-testid="switch-sms-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Appointment Reminders</h4>
                      <p className="text-sm text-muted-foreground">Send appointment reminders to customers</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-appointment-reminders" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Payment Notifications</h4>
                      <p className="text-sm text-muted-foreground">Notify about payment status changes</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-payment-notifications" />
                  </div>
                  <Button data-testid="button-save-notifications">Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                  <CardDescription>Manage your subscription and billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">Professional Plan</h4>
                        <p className="text-sm text-muted-foreground">Unlimited customers and features</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">$99</p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" data-testid="button-change-plan">Change Plan</Button>
                      <Button variant="outline" data-testid="button-cancel-subscription">Cancel Subscription</Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <i className="fab fa-cc-visa text-2xl text-blue-600"></i>
                        <div>
                          <p className="font-medium">**** **** **** 1234</p>
                          <p className="text-sm text-muted-foreground">Expires 12/26</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto" data-testid="button-update-payment">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect with external services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <i className="fab fa-google text-2xl text-blue-600"></i>
                        <div>
                          <h4 className="font-medium">Google Reviews</h4>
                          <p className="text-sm text-muted-foreground">Sync customer reviews</p>
                        </div>
                      </div>
                      <Switch data-testid="switch-google-reviews" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-credit-card text-2xl text-green-600"></i>
                        <div>
                          <h4 className="font-medium">Stripe Payments</h4>
                          <p className="text-sm text-muted-foreground">Process online payments</p>
                        </div>
                      </div>
                      <Switch defaultChecked data-testid="switch-stripe" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-sms text-2xl text-purple-600"></i>
                        <div>
                          <h4 className="font-medium">Twilio SMS</h4>
                          <p className="text-sm text-muted-foreground">Send SMS notifications</p>
                        </div>
                      </div>
                      <Switch data-testid="switch-twilio" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Change Password</h4>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" data-testid="input-current-password" />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" data-testid="input-new-password" />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" data-testid="input-confirm-password" />
                      </div>
                      <Button data-testid="button-change-password">Change Password</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch data-testid="switch-2fa" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session Timeout</h4>
                      <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                    </div>
                    <Switch defaultChecked data-testid="switch-session-timeout" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}