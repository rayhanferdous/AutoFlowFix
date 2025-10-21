import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Conversation, Message } from "@shared/schema";
import { MessageSquare, Send, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Messaging() {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [messageText, setMessageText] = useState("");

  // Fetch all conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; direction: 'outbound'; conversationId?: string; phoneNumber?: string }) => {
      if (data.conversationId) {
        // Send to existing conversation
        return await apiRequest('POST', `/api/conversations/${data.conversationId}/messages`, {
          content: data.content,
          direction: data.direction,
        });
      } else {
        // Create new conversation first, then send message
        const conversationResponse = await apiRequest('POST', '/api/conversations', {
          customerName: data.phoneNumber || 'Unknown',
          phoneNumber: data.phoneNumber,
          lastMessage: data.content,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        });
        const conversation: any = await conversationResponse.json();
        
        // Then send the message
        return await apiRequest('POST', `/api/conversations/${conversation.id}/messages`, {
          content: data.content,
          direction: data.direction,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation, 'messages'] });
      }
      setMessageText("");
      setNewPhoneNumber("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark conversation as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest('PATCH', `/api/conversations/${conversationId}/read-all`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // Mark messages as read when conversation is opened
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && conversation.unreadCount > 0) {
      markAsReadMutation.mutate(conversationId);
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedConversation && !newPhoneNumber) {
      toast({
        title: "Error",
        description: "Please select a conversation or enter a phone number.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      content: messageText,
      direction: 'outbound',
      conversationId: selectedConversation || undefined,
      phoneNumber: newPhoneNumber || undefined,
    });
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2" data-testid="title-messaging">
                <MessageSquare className="h-8 w-8" />
                Two-Way Texting
              </h1>
              <p className="text-muted-foreground">Communicate directly with customers via SMS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>Active customer messaging threads</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  {conversationsLoading ? (
                    <div className="space-y-4 p-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No conversations yet</p>
                      <p className="text-sm text-muted-foreground">Send a message to start a conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => handleSelectConversation(conversation.id)}
                          className={`flex items-center justify-between p-4 hover:bg-accent cursor-pointer transition-colors border-b ${
                            selectedConversation === conversation.id ? 'bg-accent' : ''
                          }`}
                          data-testid={`conversation-${conversation.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{conversation.customerName}</h4>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-red-100 text-red-800 text-xs" data-testid={`badge-unread-${conversation.id}`}>
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Phone className="h-3 w-3" />
                              <span>{conversation.phoneNumber}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate" data-testid={`text-last-message-${conversation.id}`}>
                              {conversation.lastMessage}
                            </p>
                            {conversation.lastMessageAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages View / Composer */}
            <Card className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedConversationData?.customerName}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {selectedConversationData?.phoneNumber}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversation(null)}
                        data-testid="button-close-conversation"
                      >
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      {messagesLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-3/4" />
                          ))}
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                              data-testid={`message-${message.id}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  message.direction === 'outbound'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1"
                          rows={2}
                          data-testid="textarea-message"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={sendMessageMutation.isPending || !messageText.trim()}
                          data-testid="button-send-message"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {messageText.length} / 160 characters
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle>Send New Message</CardTitle>
                    <CardDescription>Start a new conversation with a customer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input
                          placeholder="(555) 123-4567"
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                          data-testid="input-phone-number"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                          placeholder="Type your message here..."
                          rows={4}
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          data-testid="textarea-new-message"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {messageText.length} / 160 characters
                        </span>
                        <Button
                          onClick={handleSendMessage}
                          disabled={sendMessageMutation.isPending || !messageText.trim() || !newPhoneNumber.trim()}
                          data-testid="button-send-new-message"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
