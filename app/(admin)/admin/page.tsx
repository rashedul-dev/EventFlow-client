"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  userGrowth: number;
  totalEvents: number;
  pendingEvents: number;
  eventGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  platformCommission: number;
  systemHealth: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    userGrowth: 0,
    totalEvents: 0,
    pendingEvents: 0,
    eventGrowth: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    platformCommission: 0,
    systemHealth: 100,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      setStats({
        totalUsers: 12847,
        activeUsers: 1247,
        userGrowth: 12.5,
        totalEvents: 453,
        pendingEvents: 12,
        eventGrowth: 8.3,
        totalRevenue: 284750,
        revenueGrowth: 15.2,
        platformCommission: 14238,
        systemHealth: 98,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.userGrowth}%`,
      icon: Users,
      href: "/admin/users",
      description: `${stats.activeUsers.toLocaleString()} active`,
    },
    {
      title: "Total Events",
      value: stats.totalEvents.toLocaleString(),
      change: `+${stats.eventGrowth}%`,
      icon: Calendar,
      href: "/admin/events",
      description: `${stats.pendingEvents} pending approval`,
      badge: stats.pendingEvents,
    },
    {
      title: "Total Revenue",
      value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`,
      change: `+${stats.revenueGrowth}%`,
      icon: DollarSign,
      href: "/admin/analytics/revenue",
      description: `$${(stats.platformCommission / 1000).toFixed(1)}K commission`,
    },
    {
      title: "System Health",
      value: `${stats.systemHealth}%`,
      change: "Excellent",
      icon: Activity,
      href: "/admin/system-health",
      description: "All systems operational",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of platform performance and pending tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="relative">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  {stat.badge !== undefined && stat.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/events">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-medium">Event Approvals</div>
                    <div className="text-sm text-muted-foreground">{stats.pendingEvents} events awaiting review</div>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/users">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">User Reports</div>
                    <div className="text-sm text-muted-foreground">3 reports to review</div>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/admin/analytics">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Weekly Reports</div>
                    <div className="text-sm text-muted-foreground">View analytics dashboard</div>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Platform health indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">API Services</div>
                  <div className="text-sm text-muted-foreground">All operational</div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                100%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Database</div>
                  <div className="text-sm text-muted-foreground">Connected</div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                98%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-medium">Cache Server</div>
                  <div className="text-sm text-muted-foreground">Minor latency</div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
                95%
              </Badge>
            </div>

            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/system-health">View Detailed Metrics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
