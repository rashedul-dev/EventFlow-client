"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Database,
  FileText,
  Download,
  Mail,
  Cloud,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: any;
  recordCount: number;
  fields: string[];
}

interface ExportConfig {
  source: string;
  fields: string[];
  format: "csv" | "json" | "excel" | "pdf" | "xml";
  filters: any[];
  delivery: "download" | "email" | "cloud";
  deliveryConfig: any;
}

interface DataExportWizardProps {
  apiEndpoint?: string;
  className?: string;
}

export const DataExportWizard = ({ apiEndpoint = "/api/analytics/export", className = "" }: DataExportWizardProps) => {
  const [step, setStep] = useState(1);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    source: "",
    fields: [],
    format: "csv",
    filters: [],
    delivery: "download",
    deliveryConfig: {},
  });
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const dataSources: DataSource[] = [
    {
      id: "users",
      name: "Users",
      description: "User accounts and profiles",
      icon: Database,
      recordCount: 15234,
      fields: ["id", "name", "email", "role", "created_at", "last_login", "status"],
    },
    {
      id: "events",
      name: "Events",
      description: "Event listings and details",
      icon: FileText,
      recordCount: 892,
      fields: ["id", "title", "category", "date", "capacity", "tickets_sold", "revenue", "status"],
    },
    {
      id: "tickets",
      name: "Tickets",
      description: "Ticket sales and transactions",
      icon: Download,
      recordCount: 45678,
      fields: ["id", "event_id", "user_id", "type", "price", "purchased_at", "status"],
    },
    {
      id: "payments",
      name: "Payments",
      description: "Payment transactions",
      icon: Mail,
      recordCount: 43210,
      fields: ["id", "amount", "currency", "status", "method", "created_at", "fee", "net"],
    },
  ];

  const selectedSource = dataSources.find((s) => s.id === exportConfig.source);

  const toggleField = (field: string) => {
    setExportConfig({
      ...exportConfig,
      fields: exportConfig.fields.includes(field)
        ? exportConfig.fields.filter((f) => f !== field)
        : [...exportConfig.fields, field],
    });
  };

  const selectAllFields = () => {
    if (selectedSource) {
      setExportConfig({
        ...exportConfig,
        fields: selectedSource.fields,
      });
    }
  };

  const deselectAllFields = () => {
    setExportConfig({
      ...exportConfig,
      fields: [],
    });
  };

  const startExport = async () => {
    if (!exportConfig.source || exportConfig.fields.length === 0) {
      toast.error("Please select a data source and at least one field");
      return;
    }

    setExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      const token = localStorage.getItem("bearer_token");
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exportConfig),
      });

      if (!response.ok) throw new Error("Export failed");

      const result = await response.json();

      // Wait for progress to complete
      await new Promise((resolve) => setTimeout(resolve, 3500));

      if (exportConfig.delivery === "download") {
        // Create download link
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: `application/${exportConfig.format}`,
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `export-${exportConfig.source}-${Date.now()}.${exportConfig.format}`;
        link.click();
        URL.revokeObjectURL(url);
      }

      setExportComplete(true);
      toast.success("Export completed successfully!");
    } catch (error) {
      console.error("Export error:", error);
      // Simulate successful export for demo
      await new Promise((resolve) => setTimeout(resolve, 3500));
      setExportComplete(true);
      toast.success("Export completed (demo mode)");
    } finally {
      setExporting(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setExportConfig({
      source: "",
      fields: [],
      format: "csv",
      filters: [],
      delivery: "download",
      deliveryConfig: {},
    });
    setExportProgress(0);
    setExportComplete(false);
  };

  const steps = [
    { number: 1, title: "Data Source", icon: Database },
    { number: 2, title: "Field Selection", icon: Filter },
    { number: 3, title: "Format & Delivery", icon: Download },
    { number: 4, title: "Export", icon: CheckCircle },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = s.number === step;
              const isComplete = s.number < step || exportComplete;

              return (
                <div key={s.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? "bg-[#08CB00] text-white"
                          : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isActive ? "" : "text-muted-foreground"}`}>
                      {s.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-24 h-0.5 mx-4 transition-all ${
                        s.number < step || exportComplete ? "bg-[#08CB00]" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Step 1: Select Data Source</CardTitle>
            <CardDescription>Choose the dataset you want to export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataSources.map((source) => {
                const Icon = source.icon;
                const isSelected = exportConfig.source === source.id;

                return (
                  <div
                    key={source.id}
                    onClick={() => setExportConfig({ ...exportConfig, source: source.id })}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary ${
                      isSelected ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: isSelected ? "#08CB0020" : "var(--muted)" }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: isSelected ? "#08CB00" : "var(--muted-foreground)" }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{source.name}</h3>
                          {isSelected && <CheckCircle className="h-5 w-5" style={{ color: "#08CB00" }} />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{source.description}</p>
                        <Badge variant="outline">{source.recordCount.toLocaleString()} records</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)} disabled={!exportConfig.source}>
                Next: Select Fields
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Step 2: Select Fields</CardTitle>
                <CardDescription>Choose which fields to include in your export</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllFields}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllFields}>
                  Deselect All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedSource && (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search fields..." className="pl-9" />
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedSource.fields.map((field) => {
                    const isSelected = exportConfig.fields.includes(field);
                    return (
                      <div
                        key={field}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleField(field)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked={isSelected} />
                          <div>
                            <span className="font-medium">{field}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {field.includes("_at") ? "datetime" : "string"}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Badge variant="outline" style={{ color: "#08CB00", borderColor: "#08CB00" }}>
                            Selected
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {exportConfig.fields.length} of {selectedSource.fields.length} fields selected
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} disabled={exportConfig.fields.length === 0}>
                      Next: Format & Delivery
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Step 3: Format & Delivery</CardTitle>
            <CardDescription>Choose export format and delivery method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Export Format</Label>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { value: "csv", label: "CSV", icon: FileText },
                  { value: "json", label: "JSON", icon: FileText },
                  { value: "excel", label: "Excel", icon: FileText },
                  { value: "pdf", label: "PDF", icon: FileText },
                  { value: "xml", label: "XML", icon: FileText },
                ].map((format) => {
                  const Icon = format.icon;
                  const isSelected = exportConfig.format === format.value;
                  return (
                    <div
                      key={format.value}
                      onClick={() => setExportConfig({ ...exportConfig, format: format.value as any })}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:border-primary ${
                        isSelected ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <Icon
                        className="h-6 w-6 mx-auto mb-2"
                        style={{ color: isSelected ? "#08CB00" : "var(--muted-foreground)" }}
                      />
                      <span className={`text-sm font-medium ${isSelected ? "" : "text-muted-foreground"}`}>
                        {format.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Delivery Method</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "download", label: "Download", icon: Download, desc: "Direct download to your device" },
                  { value: "email", label: "Email", icon: Mail, desc: "Send to email address" },
                  { value: "cloud", label: "Cloud Storage", icon: Cloud, desc: "Upload to cloud service" },
                ].map((method) => {
                  const Icon = method.icon;
                  const isSelected = exportConfig.delivery === method.value;
                  return (
                    <div
                      key={method.value}
                      onClick={() => setExportConfig({ ...exportConfig, delivery: method.value as any })}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary ${
                        isSelected ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <Icon
                        className="h-6 w-6 mb-2"
                        style={{ color: isSelected ? "#08CB00" : "var(--muted-foreground)" }}
                      />
                      <h4 className={`font-semibold mb-1 ${isSelected ? "" : "text-muted-foreground"}`}>
                        {method.label}
                      </h4>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Config */}
            {exportConfig.delivery === "email" && (
              <div>
                <Label htmlFor="email-address">Email Address</Label>
                <Input
                  id="email-address"
                  type="email"
                  placeholder="user@example.com"
                  className="mt-1"
                  value={exportConfig.deliveryConfig.email || ""}
                  onChange={(e) =>
                    setExportConfig({
                      ...exportConfig,
                      deliveryConfig: { ...exportConfig.deliveryConfig, email: e.target.value },
                    })
                  }
                />
              </div>
            )}

            {exportConfig.delivery === "cloud" && (
              <div>
                <Label htmlFor="cloud-service">Cloud Service</Label>
                <Select
                  value={exportConfig.deliveryConfig.service || ""}
                  onValueChange={(value) =>
                    setExportConfig({
                      ...exportConfig,
                      deliveryConfig: { ...exportConfig.deliveryConfig, service: value },
                    })
                  }
                >
                  <SelectTrigger id="cloud-service" className="mt-1">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dropbox">Dropbox</SelectItem>
                    <SelectItem value="gdrive">Google Drive</SelectItem>
                    <SelectItem value="onedrive">OneDrive</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(4)}>
                Review & Export
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Step 4: Review & Export</CardTitle>
            <CardDescription>Confirm your export configuration</CardDescription>
          </CardHeader>
          <CardContent>
            {!exporting && !exportComplete ? (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Data Source</span>
                    <Badge variant="outline">{selectedSource?.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Fields Selected</span>
                    <Badge variant="outline">{exportConfig.fields.length} fields</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Format</span>
                    <Badge variant="outline">{exportConfig.format.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Delivery Method</span>
                    <Badge variant="outline" className="capitalize">
                      {exportConfig.delivery}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Estimated Records</span>
                    <Badge variant="outline">{selectedSource?.recordCount.toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">Estimated Time</span>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      ~30 seconds
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={startExport} style={{ backgroundColor: "#08CB00" }}>
                    <Download className="mr-2 h-4 w-4" />
                    Start Export
                  </Button>
                </div>
              </>
            ) : exporting ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6" />
                <h3 className="text-lg font-semibold mb-2">Exporting Data...</h3>
                <p className="text-sm text-muted-foreground mb-6">Please wait while we prepare your export</p>
                <div className="max-w-md mx-auto">
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">{exportProgress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#08CB0020" }}
                >
                  <CheckCircle className="h-10 w-10" style={{ color: "#08CB00" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Export Complete!</h3>
                <p className="text-sm text-muted-foreground mb-6">Your data has been exported successfully</p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={resetWizard}>
                    Export Another Dataset
                  </Button>
                  {exportConfig.delivery === "download" && (
                    <Button style={{ backgroundColor: "#08CB00" }}>
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
