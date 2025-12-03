"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueAnalytics } from "@/components/admin/analytics/RevenueAnalytics";
import { UserGrowthChart } from "@/components/admin/analytics/UserGrowthChart";
import { EventMetrics } from "@/components/admin/analytics/EventMetrics";
import { RealTimeStats } from "@/components/admin/analytics/RealTimeStats";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <RealTimeStats />
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <RevenueAnalytics />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserGrowthChart />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <EventMetrics />
        </TabsContent>

        <TabsContent value="realtime" className="mt-6">
          <RealTimeStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
