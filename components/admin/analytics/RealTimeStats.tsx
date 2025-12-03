"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Users, DollarSign, Ticket, TrendingUp, Clock, Zap } from "lucide-react";

interface LiveTransaction {
  id: string;
  type: "ticket_purchase" | "event_created" | "user_registered";
  description: string;
  amount?: number;
  timestamp: Date;
}

export function RealTimeStats() {
  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>([]);
  const [stats, setStats] = useState({
    activeSessions: 1247,
    ticketsSoldToday: 3542,
    revenueLastHour: 12450,
    eventsCreatedToday: 28,
    avgResponseTime: 145,
    errorRate: 0.02,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Add new transaction
      const transactionTypes: Array<"ticket_purchase" | "event_created" | "user_registered"> = [
        "ticket_purchase",
        "event_created",
        "user_registered",
      ];
      const randomType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];

      const descriptions = {
        ticket_purchase: [
          "Purchased 2 tickets for Summer Music Festival",
          "Bought VIP ticket for Tech Conference 2025",
          "Reserved seats for Sports Championship",
        ],
        event_created: [
          "Created new event: Food & Wine Expo",
          "Published: Downtown Jazz Night",
          "Setup: Community Fitness Challenge",
        ],
        user_registered: [
          "New user registered from New York",
          "New organizer account from California",
          "User joined from London, UK",
        ],
      };

      const newTransaction: LiveTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: randomType,
        description: descriptions[randomType][Math.floor(Math.random() * descriptions[randomType].length)],
        amount: randomType === "ticket_purchase" ? Math.floor(Math.random() * 300) + 20 : undefined,
        timestamp: new Date(),
      };

      setLiveTransactions((prev) => [newTransaction, ...prev].slice(0, 20));

      // Update stats randomly
      setStats((prev) => ({
        activeSessions: prev.activeSessions + Math.floor(Math.random() * 20) - 10,
        ticketsSoldToday:
          prev.ticketsSoldToday + (randomType === "ticket_purchase" ? Math.floor(Math.random() * 3) + 1 : 0),
        revenueLastHour: prev.revenueLastHour + (randomType === "ticket_purchase" ? newTransaction.amount || 0 : 0),
        eventsCreatedToday: prev.eventsCreatedToday + (randomType === "event_created" ? 1 : 0),
        avgResponseTime: Math.max(100, prev.avgResponseTime + Math.floor(Math.random() * 10) - 5),
        errorRate: Math.max(0, Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.01)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getTransactionIcon = (type: LiveTransaction["type"]) => {
    switch (type) {
      case "ticket_purchase":
        return <Ticket className="w-4 h-4" />;
      case "event_created":
        return <Activity className="w-4 h-4" />;
      case "user_registered":
        return <Users className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: LiveTransaction["type"]) => {
    switch (type) {
      case "ticket_purchase":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "event_created":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "user_registered":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Real-Time Platform Monitoring
        </h2>
        <p className="text-muted-foreground">Live activity and system health indicators</p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-500">Live</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Tickets Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ticketsSoldToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Sold today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue/Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.revenueLastHour / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground mt-1">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Events Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventsCreatedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Created today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}ms</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700">
                Good
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.errorRate * 100).toFixed(2)}%</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700">
                Excellent
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Activity Feed
          </CardTitle>
          <CardDescription>Real-time platform transactions and events</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {liveTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(
                      transaction.type
                    )}`}
                  >
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{getTimeAgo(transaction.timestamp)}</span>
                      {transaction.amount && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs">
                            ${transaction.amount}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {liveTransactions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Waiting for live activity...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
