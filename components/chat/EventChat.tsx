"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRealtimeChat } from "@/lib/websocket/realtimeHooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Smile, MoreVertical, User, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EventChatProps {
  chatId: string;
  type?: "support" | "event";
  currentUserId?: string;
}

export function EventChat({ chatId, type = "support", currentUserId }: EventChatProps) {
  const { messages, typingUsers, sendMessage, sendTyping, messagesEndRef } = useRealtimeChat(chatId, type);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (value: string) => {
    setInput(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    sendMessage(input.trim());
    setInput("");
    setIsTyping(false);
    sendTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    toast.info("File upload coming soon", {
      style: {
        background: "#0a0a0a",
        border: "1px solid #253900",
        color: "#EEEEEE",
      },
    });
  };

  return (
    <Card className="flex flex-col h-[600px] bg-card border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            {type === "support" ? (
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                <User className="h-5 w-5 text-foreground" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#08CB00] rounded-full border-2 border-card" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{type === "support" ? "Support Team" : "Event Chat"}</h3>
            <p className="text-xs text-muted-foreground">{typingUsers.length > 0 ? "Typing..." : "Online"}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {type === "support" ? (
                <Bot className="h-8 w-8 text-primary" />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <p className="text-foreground font-medium mb-1">
              {type === "support" ? "How can we help?" : "Start the conversation"}
            </p>
            <p className="text-sm text-muted-foreground">
              {type === "support"
                ? "Send us a message and we'll get back to you shortly"
                : "Chat with other event attendees"}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message: any) => {
              const isCurrentUser = message.userId === currentUserId;
              const isAgent = message.role === "agent" || message.role === "admin";

              return (
                <div key={message.id} className={cn("flex gap-3", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
                  {/* Avatar */}
                  {!isCurrentUser && (
                    <div className="shrink-0">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          isAgent ? "bg-primary/10 border-2 border-primary/20" : "bg-muted border-2 border-border"
                        )}
                      >
                        {isAgent ? (
                          <Bot className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-foreground" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className={cn("flex flex-col gap-1", isCurrentUser ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {isCurrentUser ? "You" : message.userName || "User"}
                      </span>
                      {isAgent && (
                        <Badge variant="outline" className="h-5 text-xs bg-primary/10 text-primary border-primary/20">
                          Agent
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "px-4 py-2 rounded-2xl max-w-md",
                        isCurrentUser
                          ? "bg-primary text-black rounded-br-sm"
                          : isAgent
                          ? "bg-[#253900] text-foreground rounded-bl-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                  <User className="h-4 w-4 text-foreground" />
                </div>
                <div className="px-4 py-2 rounded-2xl bg-muted rounded-bl-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleFileUpload} className="h-10 w-10 p-0 hover:bg-muted">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-background border-border"
          />
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-muted">
            <Smile className="h-5 w-5" />
          </Button>
          <Button onClick={handleSendMessage} disabled={!input.trim()} size="sm" className="h-10 px-4 gap-2">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}
