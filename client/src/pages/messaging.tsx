import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/sidebar";

export default function Messaging() {
  const conversations = [
    {
      id: "MSG-001",
      customerName: "John Smith",
      phoneNumber: "(555) 123-4567",
      lastMessage: "Thanks for the update on my vehicle!",
      timestamp: "2024-01-15 10:30 AM",
      status: "read",
      unreadCount: 0
    },
    {
      id: "MSG-002",
      customerName: "Sarah Johnson", 
      phoneNumber: "(555) 987-6543",
      lastMessage: "When will my car be ready?",
      timestamp: "2024-01-15 09:15 AM",
      status: "unread",
      unreadCount: 2
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="title-messaging">Two-Way Texting</h1>
              <p className="text-muted-foreground">Communicate directly with customers via SMS</p>
            </div>
            <Button data-testid="button-new-message">
              <i className="fas fa-plus mr-2"></i>
              New Message
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversations List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Active customer messaging threads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{conversation.customerName}</h4>
                          <span className="text-sm text-muted-foreground">{conversation.phoneNumber}</span>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">{conversation.timestamp}</p>
                      </div>
                      <Button variant="ghost" size="sm" data-testid={`button-open-${conversation.id}`}>
                        <i className="fas fa-chevron-right"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Message Composer */}
            <Card>
              <CardHeader>
                <CardTitle>Send Message</CardTitle>
                <CardDescription>Send SMS to customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input placeholder="(555) 123-4567" data-testid="input-phone-number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea 
                      placeholder="Type your message here..." 
                      rows={4}
                      data-testid="textarea-message"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">160 characters remaining</span>
                    <Button data-testid="button-send-message">
                      <i className="fas fa-paper-plane mr-2"></i>
                      Send Message
                    </Button>
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