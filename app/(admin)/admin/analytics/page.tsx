"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueAnalytics } from "@/components/admin/analytics/RevenueAnalytics";
import { UserGrowthChart } from "@/components/admin/analytics/UserGrowthChart";
import { EventMetrics } from "@/components/admin/analytics/EventMetrics";
import { RealTimeStats } from "@/components/admin/analytics/RealTimeStats";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { RevenueTrendChart } from "@/components/analytics/charts/RevenueTrendChart";
import { TicketSalesChart } from "@/components/analytics/charts/TicketSalesChart";
import { UserEngagementChart } from "@/components/analytics/charts/UserEngagementChart";
import { EventPerformanceChart } from "@/components/analytics/charts/EventPerformanceChart";
import { FinancialReportTable } from "@/components/analytics/tables/FinancialReportTable";
import { EventAnalyticsTable } from "@/components/analytics/tables/EventAnalyticsTable";
import { UserBehaviorTable } from "@/components/analytics/tables/UserBehaviorTable";
import { MultiDimensionFilter } from "@/components/analytics/filters/MultiDimensionFilter";
import { UserSegmentationTool } from "@/components/analytics/filters/UserSegmentationTool";
import { CohortAnalysis } from "@/components/analytics/filters/CohortAnalysis";

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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Advanced Charts</TabsTrigger>
          <TabsTrigger value="tables">Data Tables</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <RealTimeStats />
          <div className="grid gap-6 md:grid-cols-2">
            <RevenueAnalytics />
            <UserGrowthChart />
          </div>
          <EventMetrics />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6 mt-6">
          <RevenueTrendChart />
          <TicketSalesChart />
          <UserEngagementChart />
          <EventPerformanceChart />
        </TabsContent>

        <TabsContent value="tables" className="space-y-6 mt-6">
          <FinancialReportTable />
          <EventAnalyticsTable />
          <UserBehaviorTable />
        </TabsContent>

        <TabsContent value="filters" className="mt-6">
          <MultiDimensionFilter />
        </TabsContent>

        <TabsContent value="segments" className="mt-6">
          <UserSegmentationTool />
        </TabsContent>

        <TabsContent value="cohorts" className="mt-6">
          <CohortAnalysis />
        </TabsContent>

        <TabsContent value="realtime" className="mt-6">
          <RealTimeStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
