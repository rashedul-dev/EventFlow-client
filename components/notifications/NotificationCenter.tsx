"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRealtimeNotifications } from "@/lib/websocket/realtimeHooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Ticket,
  Calendar,
  MessageSquare,
  AlertCircle,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationCenterProps {
  userId?: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead } = useRealtimeNotifications(userId);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ticket_purchase":
        return <Ticket className="h-5 w-5 text-primary" />;
      case "event_update":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-foreground" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "ticket_purchase":
        return "bg-primary/10 border-primary/20";
      case "event_update":
        return "bg-blue-500/10 border-blue-500/20";
      case "message":
        return "bg-purple-500/10 border-purple-500/20";
      case "alert":
        return "bg-yellow-500/10 border-yellow-500/20";
      default:
        return "bg-muted/30 border-border";
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    toast.success("Marked as read", {
      style: { background: "#0a0a0a", border: "1px solid #08CB00", color: "#EEEEEE" },
      duration: 2000,
    });
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach((n: any) => {
      if (!n.readAt) markAsRead(n.id);
    });
    toast.success("All marked as read", {
      style: { background: "#0a0a0a", border: "1px solid #08CB00", color: "#EEEEEE" },
    });
  };

  const filteredNotifications = filter === "unread" ? notifications.filter((n: any) => !n.readAt) : notifications;

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative h-10 w-10 p-0">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Card className="absolute right-0 top-12 w-96 max-h-[600px] overflow-hidden z-50 bg-background border-border shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="gap-2 h-8 px-2"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFilter("all")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                    filter === "all" ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                    filter === "unread" ? "bg-primary text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium mb-1 text-sm">No notifications</p>
                    <p className="text-xs text-muted-foreground">
                      {filter === "unread" ? "You're all caught up!" : "You'll see notifications here"}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "relative p-3 rounded-lg border transition-all",
                        getNotificationColor(notification.type),
                        !notification.readAt && "ring-2 ring-primary/20"
                      )}
                    >
                      {!notification.readAt && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm mb-1">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <div className="flex gap-1">
                              {!notification.readAt && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="h-6 px-2 gap-1 hover:bg-primary/10"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-foreground" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">Sound</p>
                    <p className="text-xs text-muted-foreground">Play notification sounds</p>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    soundEnabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      soundEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
