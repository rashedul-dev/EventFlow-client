"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, DollarSign, Users, TrendingUp, Calendar, Download, Eye, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "executive" | "financial" | "marketing" | "operations" | "custom";
  icon: any;
  color: string;
  widgets: string[];
  frequency: string;
  audience: string;
  preview: string;
}

interface ReportTemplatesProps {
  apiEndpoint?: string;
  className?: string;
  onSelectTemplate?: (template: ReportTemplate) => void;
}

export const ReportTemplates = ({
  apiEndpoint = "/api/analytics/report-templates",
  className = "",
  onSelectTemplate,
}: ReportTemplatesProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const templates: ReportTemplate[] = [
    {
      id: "exec-summary",
      name: "Executive Summary",
      description: "High-level overview for C-suite executives with key metrics and trends",
      category: "executive",
      icon: TrendingUp,
      color: "#08CB00",
      widgets: ["Total Revenue Card", "User Growth Chart", "Event Performance Radar", "Top Events Table"],
      frequency: "Weekly",
      audience: "CEO, CFO, Board Members",
      preview: "1-page executive dashboard with critical KPIs",
    },
    {
      id: "financial-performance",
      name: "Financial Performance",
      description: "Detailed revenue, costs, and profitability analysis for finance teams",
      category: "financial",
      icon: DollarSign,
      color: "#253900",
      widgets: [
        "Revenue Trend Chart",
        "Commission Breakdown",
        "Financial Report Table",
        "P&L Summary",
        "Cash Flow Analysis",
      ],
      frequency: "Monthly",
      audience: "CFO, Finance Team, Accountants",
      preview: "Comprehensive financial metrics with drill-down capabilities",
    },
    {
      id: "user-growth",
      name: "User Growth Report",
      description: "User acquisition, engagement, and retention metrics for marketing",
      category: "marketing",
      icon: Users,
      color: "#08CB00",
      widgets: [
        "User Growth Chart",
        "Cohort Analysis",
        "Conversion Funnel",
        "User Behavior Table",
        "Acquisition Channels",
      ],
      frequency: "Weekly",
      audience: "CMO, Marketing Team, Growth Team",
      preview: "Deep-dive into user metrics and marketing effectiveness",
    },
    {
      id: "event-success",
      name: "Event Success Report",
      description: "Event performance metrics for operations and event managers",
      category: "operations",
      icon: Calendar,
      color: "#FFA500",
      widgets: [
        "Event Performance Chart",
        "Ticket Sales Analysis",
        "Event Analytics Table",
        "Venue Utilization",
        "Organizer Performance",
      ],
      frequency: "Daily",
      audience: "Operations Manager, Event Coordinators",
      preview: "Real-time event tracking and success metrics",
    },
    {
      id: "custom-analytics",
      name: "Custom Analytics Dashboard",
      description: "Build your own report from scratch with full customization",
      category: "custom",
      icon: Sparkles,
      color: "#9333EA",
      widgets: ["Drag & Drop Canvas", "Widget Library Access", "Custom Metrics", "Flexible Layout"],
      frequency: "On-demand",
      audience: "All Users",
      preview: "Complete flexibility to design reports for any use case",
    },
  ];

  const categories = [
    { id: "all", name: "All Templates", count: templates.length },
    { id: "executive", name: "Executive", count: templates.filter((t) => t.category === "executive").length },
    { id: "financial", name: "Financial", count: templates.filter((t) => t.category === "financial").length },
    { id: "marketing", name: "Marketing", count: templates.filter((t) => t.category === "marketing").length },
    { id: "operations", name: "Operations", count: templates.filter((t) => t.category === "operations").length },
    { id: "custom", name: "Custom", count: templates.filter((t) => t.category === "custom").length },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const useTemplate = (template: ReportTemplate) => {
    toast.success(`Creating report from "${template.name}" template...`);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const downloadTemplate = (template: ReportTemplate) => {
    // Generate template configuration as JSON
    const config = {
      templateId: template.id,
      name: template.name,
      widgets: template.widgets,
      metadata: {
        category: template.category,
        frequency: template.frequency,
        audience: template.audience,
      },
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${template.id}-template.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Template configuration downloaded");
  };

  const previewReport = (template: ReportTemplate) => {
    setPreviewTemplate(template);
    setDialogOpen(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Report Templates</CardTitle>
              <CardDescription>Pre-built professional reports optimized for different audiences</CardDescription>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${template.color}20` }}>
                    <Icon className="h-6 w-6" style={{ color: template.color }} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Widgets */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Includes {template.widgets.length} widgets:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.widgets.slice(0, 3).map((widget, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {widget}
                      </Badge>
                    ))}
                    {template.widgets.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.widgets.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{template.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best for:</span>
                    <span className="font-medium text-right">{template.audience.split(",")[0]}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => previewReport(template)} variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => useTemplate(template)}
                    size="sm"
                    className="flex-1"
                    style={{ backgroundColor: template.color }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-muted-foreground">No templates found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          {previewTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${previewTemplate.color}20` }}>
                    <previewTemplate.icon className="h-6 w-6" style={{ color: previewTemplate.color }} />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{previewTemplate.name}</DialogTitle>
                    <DialogDescription className="mt-1">{previewTemplate.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Preview Image/Mockup */}
                <div className="aspect-video rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">{previewTemplate.preview}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Included Widgets</h4>
                    <ul className="space-y-1">
                      {previewTemplate.widgets.map((widget, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {widget}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="outline" className="text-xs">
                          {previewTemplate.category}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span className="font-medium">{previewTemplate.frequency}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target Audience:</span>
                        <p className="font-medium mt-1">{previewTemplate.audience}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => downloadTemplate(previewTemplate)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Config
                </Button>
                <Button
                  onClick={() => {
                    useTemplate(previewTemplate);
                    setDialogOpen(false);
                  }}
                  style={{ backgroundColor: previewTemplate.color }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
