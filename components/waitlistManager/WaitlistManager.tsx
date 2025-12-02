"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRealtimeWaitlist } from "@/lib/websocket/realtimeHooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Bell, Clock, Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WaitlistManagerProps {
  eventId: string;
  isOrganizer?: boolean;
}

export function WaitlistManager({ eventId, isOrganizer = false }: WaitlistManagerProps) {
  const { waitlist, myPosition } = useRealtimeWaitlist(eventId);
  const [notifying, setNotifying] = useState(false);

  const handleNotifyNext = async (count: number = 1) => {
    setNotifying(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Notified ${count} ${count === 1 ? "person" : "people"}`, {
        style: {
          background: "#0a0a0a",
          border: "1px solid #08CB00",
          color: "#EEEEEE",
        },
      });
    } catch (error) {
      toast.error("Failed to notify waitlist", {
        style: {
          background: "#0a0a0a",
          border: "1px solid #dc2626",
          color: "#EEEEEE",
        },
      });
    } finally {
      setNotifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "NOTIFIED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "CONVERTED":
        return "bg-primary/10 text-primary border-primary/20";
      case "EXPIRED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "CANCELLED":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "WAITING":
        return <Clock className="h-4 w-4" />;
      case "NOTIFIED":
        return <Bell className="h-4 w-4" />;
      case "CONVERTED":
        return <CheckCircle className="h-4 w-4" />;
      case "EXPIRED":
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // User View
  if (!isOrganizer && myPosition !== null) {
    const progressPercentage = Math.max(0, 100 - (myPosition / waitlist.length) * 100);

    return (
      <Card className="p-6 bg-card border-border">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Your Waitlist Position</h3>
              <p className="text-sm text-muted-foreground">You'll be notified when tickets become available</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>

          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/20 mb-4">
              <span className="text-5xl font-bold text-primary">#{myPosition}</span>
            </div>
            <p className="text-muted-foreground">
              {myPosition === 1
                ? "You're next in line!"
                : `${myPosition - 1} ${myPosition === 2 ? "person" : "people"} ahead of you`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Queue Progress</span>
              <span className="text-foreground font-medium">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Waiting</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{waitlist.length}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Movement</span>
              </div>
              <p className="text-2xl font-bold text-foreground">+3</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Bell className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Stay Alert</p>
              <p className="text-xs text-muted-foreground">
                We'll email you immediately when tickets become available. Check your inbox regularly!
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Organizer View
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Waiting</span>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{waitlist.filter((w) => w.status === "WAITING").length}</p>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Notified</span>
            <Bell className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-foreground">{waitlist.filter((w) => w.status === "NOTIFIED").length}</p>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Converted</span>
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {waitlist.filter((w) => w.status === "CONVERTED").length}
          </p>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Notify next in queue when tickets are available</p>
          <div className="flex gap-2">
            <Button onClick={() => handleNotifyNext(1)} disabled={notifying} size="sm" className="gap-2">
              {notifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Notify Next
            </Button>
            <Button
              onClick={() => handleNotifyNext(5)}
              disabled={notifying}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              Notify 5
            </Button>
          </div>
        </div>
      </Card>

      {/* Waitlist Table */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Waitlist Entries</h3>
        <div className="space-y-2">
          {waitlist.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No one on the waitlist yet</p>
            </div>
          ) : (
            waitlist.map((entry: any, index: number) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-all",
                  "bg-muted/30 border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-sm font-bold text-primary">#{entry.position}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{entry.name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">{entry.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getStatusColor(entry.status)}>
                    {getStatusIcon(entry.status)}
                    <span className="ml-1">{entry.status}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
