import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueTrendChart } from "@/components/analytics/charts/RevenueTrendChart";
import { TicketSalesChart } from "@/components/analytics/charts/TicketSalesChart";
import { UserEngagementChart } from "@/components/analytics/charts/UserEngagementChart";
import { EventPerformanceChart } from "@/components/analytics/charts/EventPerformanceChart";
import { FinancialReportTable } from "@/components/analytics/tables/FinancialReportTable";
import { EventAnalyticsTable } from "@/components/analytics/tables/EventAnalyticsTable";
import { UserBehaviorTable } from "@/components/analytics/tables/UserBehaviorTable";
import { DataExportWizard } from "@/components/analytics/export/DataExportWizard";
import { APIIntegration } from "@/components/analytics/export/APIIntegration";
import { WebhookAnalytics } from "@/components/analytics/export/WebhookAnalytics";
import { MultiDimensionFilter } from "@/components/analytics/filters/MultiDimensionFilter";
import { UserSegmentationTool } from "@/components/analytics/filters/UserSegmentationTool";
import { CohortAnalysis } from "@/components/analytics/filters/CohortAnalysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Table2, FileText, Download, Filter } from "lucide-react";
import { ReportTemplates } from "@/components/analytics/reports/ReportTemplates";
import { ReportBuilder } from "@/components/analytics/reports/ReportBuilder";
import { ScheduleReport } from "@/components/analytics/reports/ScheduleReport";

export default function AnalyticsReportsPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-2">
          Advanced data visualization, reporting systems, and interactive analytics
        </p>
      </div>

      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="charts">
            <BarChart3 className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="tables">
            <Table2 className="h-4 w-4 mr-2" />
            Data Tables
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
          <TabsTrigger value="filters">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </TabsTrigger>
        </TabsList>

        {/* Advanced Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Charting Library</CardTitle>
              <CardDescription>Production-grade visualizations with real-time data integration</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            <RevenueTrendChart />
            <TicketSalesChart />
            <UserEngagementChart />
            <EventPerformanceChart />
          </div>
        </TabsContent>

        {/* Interactive Data Tables Tab */}
        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Data Tables</CardTitle>
              <CardDescription>Virtual scrolling, sorting, filtering, and export for large datasets</CardDescription>
            </CardHeader>
          </Card>

          <FinancialReportTable />
          <EventAnalyticsTable />
          <UserBehaviorTable />
        </TabsContent>

        {/* Report Generation Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Report Generation</CardTitle>
              <CardDescription>Build, schedule, and distribute custom reports</CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Report Templates</TabsTrigger>
              <TabsTrigger value="builder">Report Builder</TabsTrigger>
              <TabsTrigger value="schedule">Schedule Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              <ReportTemplates />
            </TabsContent>

            <TabsContent value="builder">
              <ReportBuilder />
            </TabsContent>

            <TabsContent value="schedule">
              <ScheduleReport />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Export & Integration Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export & Integration Suite</CardTitle>
              <CardDescription>Enterprise export capabilities and BI tool connectivity</CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="wizard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wizard">Export Wizard</TabsTrigger>
              <TabsTrigger value="integrations">BI Integrations</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="wizard">
              <DataExportWizard />
            </TabsContent>

            <TabsContent value="integrations">
              <APIIntegration />
            </TabsContent>

            <TabsContent value="webhooks">
              <WebhookAnalytics />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Filters & Segmentation Tab */}
        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics Filters & Segmentation</CardTitle>
              <CardDescription>Deep data analysis with complex filtering and cohort tracking</CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="multidimension" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="multidimension">Multi-Dimension Filter</TabsTrigger>
              <TabsTrigger value="segmentation">User Segmentation</TabsTrigger>
              <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="multidimension">
              <MultiDimensionFilter />
            </TabsContent>

            <TabsContent value="segmentation">
              <UserSegmentationTool />
            </TabsContent>

            <TabsContent value="cohort">
              <CohortAnalysis />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
