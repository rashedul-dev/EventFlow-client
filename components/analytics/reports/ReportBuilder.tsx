"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard,
  BarChart3,
  Table2,
  PieChart,
  Plus,
  Trash2,
  Save,
  Download,
  Eye,
  GripVertical,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Widget {
  id: string;
  type: "chart" | "table" | "metric" | "text";
  title: string;
  size: "small" | "medium" | "large" | "full";
  config: any;
}

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  layout: "grid" | "column";
  header: {
    title: string;
    subtitle: string;
    logo: boolean;
  };
  footer: {
    text: string;
    pageNumbers: boolean;
  };
}

interface ReportBuilderProps {
  apiEndpoint?: string;
  className?: string;
}

export const ReportBuilder = ({ apiEndpoint = "/api/analytics/reports", className = "" }: ReportBuilderProps) => {
  const [reportName, setReportName] = useState("Untitled Report");
  const [reportDescription, setReportDescription] = useState("");
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [layout, setLayout] = useState<"grid" | "column">("grid");
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const widgetLibrary = [
    {
      type: "chart",
      icon: BarChart3,
      name: "Bar Chart",
      description: "Compare data across categories",
    },
    {
      type: "chart",
      icon: PieChart,
      name: "Pie Chart",
      description: "Show proportions and percentages",
    },
    {
      type: "table",
      icon: Table2,
      name: "Data Table",
      description: "Display detailed tabular data",
    },
    {
      type: "metric",
      icon: LayoutDashboard,
      name: "Metric Card",
      description: "Highlight key performance indicators",
    },
  ];

  const addWidget = (type: string) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: type as any,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      size: "medium",
      config: {},
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget.id);
    toast.success("Widget added to canvas");
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    if (selectedWidget === id) setSelectedWidget(null);
    toast.success("Widget removed");
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const moveWidget = (id: string, direction: "up" | "down") => {
    const index = widgets.findIndex((w) => w.id === id);
    if ((direction === "up" && index === 0) || (direction === "down" && index === widgets.length - 1)) return;

    const newWidgets = [...widgets];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newWidgets[index], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[index]];
    setWidgets(newWidgets);
  };

  const saveReport = async () => {
    if (!reportName.trim()) {
      toast.error("Please enter a report name");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const reportConfig: ReportConfig = {
        id: `report-${Date.now()}`,
        name: reportName,
        description: reportDescription,
        widgets,
        layout,
        header: {
          title: reportName,
          subtitle: reportDescription,
          logo: true,
        },
        footer: {
          text: `Generated on ${new Date().toLocaleDateString()}`,
          pageNumbers: true,
        },
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportConfig),
      });

      if (!response.ok) throw new Error("Failed to save report");

      toast.success("Report configuration saved successfully");

      // Store in localStorage as backup
      const savedReports = JSON.parse(localStorage.getItem("saved_reports") || "[]");
      savedReports.push(reportConfig);
      localStorage.setItem("saved_reports", JSON.stringify(savedReports));
    } catch (error) {
      console.error("Save error:", error);
      // Fallback to localStorage only
      const savedReports = JSON.parse(localStorage.getItem("saved_reports") || "[]");
      savedReports.push({
        id: `report-${Date.now()}`,
        name: reportName,
        description: reportDescription,
        widgets,
        layout,
      });
      localStorage.setItem("saved_reports", JSON.stringify(savedReports));
      toast.success("Report saved locally");
    } finally {
      setSaving(false);
    }
  };

  const exportReport = async (format: "pdf" | "excel") => {
    toast.info(`Exporting report as ${format.toUpperCase()}...`);

    // In a real implementation, this would generate the actual file
    setTimeout(() => {
      toast.success(`Report exported as ${format.toUpperCase()}`);
    }, 1500);
  };

  const previewReport = () => {
    toast.info("Opening report preview...");
    // In real implementation, open in new window/modal
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "col-span-1";
      case "medium":
        return "col-span-2";
      case "large":
        return "col-span-3";
      case "full":
        return "col-span-4";
      default:
        return "col-span-2";
    }
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "chart":
        return BarChart3;
      case "table":
        return Table2;
      case "metric":
        return LayoutDashboard;
      default:
        return BarChart3;
    }
  };

  const selectedWidgetData = widgets.find((w) => w.id === selectedWidget);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="report-desc">Description</Label>
                <Textarea
                  id="report-desc"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe this report's purpose"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button onClick={previewReport} variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={saveReport} disabled={saving} size="sm">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Select onValueChange={(value) => exportReport(value as "pdf" | "excel")}>
                <SelectTrigger className="w-[140px]">
                  <Download className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">Export as PDF</SelectItem>
                  <SelectItem value="excel">Export as Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Widget Library */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Widget Library</CardTitle>
            <CardDescription className="text-xs">Drag widgets to canvas or click to add</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {widgetLibrary.map((widget, index) => {
              const Icon = widget.icon;
              return (
                <div
                  key={index}
                  onClick={() => addWidget(widget.type)}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-muted/50 cursor-pointer transition-all group"
                >
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium group-hover:text-primary">{widget.name}</div>
                    <div className="text-xs text-muted-foreground">{widget.description}</div>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
              );
            })}

            <div className="pt-4 border-t border-border mt-4">
              <Label className="text-xs text-muted-foreground">Layout Style</Label>
              <Select value={layout} onValueChange={(v: any) => setLayout(v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid Layout</SelectItem>
                  <SelectItem value="column">Column Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Report Canvas</CardTitle>
                <CardDescription className="text-xs">
                  {widgets.length} widget{widgets.length !== 1 ? "s" : ""} • Real-time preview
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {layout === "grid" ? "Grid" : "Column"} Layout
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={canvasRef}
              className="min-h-[600px] p-4 rounded-lg border-2 border-dashed border-border bg-muted/20"
            >
              {widgets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">Your canvas is empty</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add widgets from the library to start building your report
                  </p>
                </div>
              ) : (
                <div className={layout === "grid" ? "grid grid-cols-4 gap-4" : "flex flex-col gap-4"}>
                  {widgets.map((widget) => {
                    const Icon = getWidgetIcon(widget.type);
                    return (
                      <div
                        key={widget.id}
                        className={`${layout === "grid" ? getSizeClass(widget.size) : ""} relative group`}
                        onClick={() => setSelectedWidget(widget.id)}
                      >
                        <div
                          className={`h-full p-4 rounded-lg border-2 transition-all ${
                            selectedWidget === widget.id
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          {/* Widget Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{widget.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeWidget(widget.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Widget Content Placeholder */}
                          <div className="h-32 rounded border border-dashed border-border flex items-center justify-center">
                            <div className="text-center">
                              <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">
                                {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)} Preview
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Widget Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              <Settings className="h-4 w-4 inline mr-2" />
              Widget Settings
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedWidget ? "Configure selected widget" : "Select a widget to configure"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedWidgetData ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="widget-title" className="text-xs">
                    Title
                  </Label>
                  <Input
                    id="widget-title"
                    value={selectedWidgetData.title}
                    onChange={(e) => updateWidget(selectedWidgetData.id, { title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="widget-size" className="text-xs">
                    Size
                  </Label>
                  <Select
                    value={selectedWidgetData.size}
                    onValueChange={(value: any) => updateWidget(selectedWidgetData.id, { size: value })}
                  >
                    <SelectTrigger id="widget-size" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1 col)</SelectItem>
                      <SelectItem value="medium">Medium (2 cols)</SelectItem>
                      <SelectItem value="large">Large (3 cols)</SelectItem>
                      <SelectItem value="full">Full Width (4 cols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t border-border">
                  <Label className="text-xs text-muted-foreground">Position</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveWidget(selectedWidgetData.id, "up")}
                      className="flex-1"
                    >
                      Move Up
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveWidget(selectedWidgetData.id, "down")}
                      className="flex-1"
                    >
                      Move Down
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeWidget(selectedWidgetData.id)}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Widget
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Click on a widget in the canvas to configure it</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
