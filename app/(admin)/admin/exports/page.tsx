"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataExportWizard } from "@/components/analytics/export/DataExportWizard";
import { APIIntegration } from "@/components/analytics/export/APIIntegration";
import { WebhookAnalytics } from "@/components/analytics/export/WebhookAnalytics";
import { Button } from "@/components/ui/button";
import { Download, Key, Webhook } from "lucide-react";

export default function AdminExportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Export & Integrations</h1>
          <p className="text-muted-foreground mt-1">Export data and manage external integrations</p>
        </div>
      </div>

      {/* Exports Tabs */}
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Wizard</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="mt-6">
          <DataExportWizard />
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <APIIntegration />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhookAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
