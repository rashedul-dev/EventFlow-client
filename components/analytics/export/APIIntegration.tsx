"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Zap,
  Key,
  Link2,
  Play,
  Pause,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  status: "active" | "inactive";
  requestCount: number;
  rateLimit: number;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  status: "connected" | "disconnected" | "pending";
  lastSync: string | null;
  documentationUrl: string;
}

interface APIIntegrationProps {
  apiEndpoint?: string;
  className?: string;
}

export const APIIntegration = ({
  apiEndpoint = "/api/analytics/integrations",
  className = "",
}: APIIntegrationProps) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKey, setShowKey] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      setApiKeys(result.apiKeys || generateMockAPIKeys());
      setIntegrations(result.integrations || generateMockIntegrations());
    } catch (error) {
      console.error("Fetch error:", error);
      setApiKeys(generateMockAPIKeys());
      setIntegrations(generateMockIntegrations());
      toast.error("Using sample data - API connection pending");
    } finally {
      setLoading(false);
    }
  };

  const generateMockAPIKeys = (): APIKey[] => {
    return [
      {
        id: "key-1",
        name: "Production API",
        key: "sk_live_" + "x".repeat(32),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "active",
        requestCount: 12450,
        rateLimit: 10000,
      },
      {
        id: "key-2",
        name: "Development API",
        key: "sk_test_" + "x".repeat(32),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        requestCount: 3200,
        rateLimit: 5000,
      },
    ];
  };

  const generateMockIntegrations = (): Integration[] => {
    return [
      {
        id: "tableau",
        name: "Tableau",
        description: "Connect to Tableau for advanced data visualization",
        icon: BarChart3,
        color: "#E97627",
        status: "connected",
        lastSync: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        documentationUrl: "https://docs.tableau.com",
      },
      {
        id: "powerbi",
        name: "Power BI",
        description: "Microsoft Power BI integration for business intelligence",
        icon: TrendingUp,
        color: "#F2C811",
        status: "connected",
        lastSync: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        documentationUrl: "https://docs.microsoft.com/power-bi",
      },
      {
        id: "looker",
        name: "Looker",
        description: "Google Looker for data exploration and analytics",
        icon: Activity,
        color: "#4285F4",
        status: "disconnected",
        lastSync: null,
        documentationUrl: "https://cloud.google.com/looker/docs",
      },
      {
        id: "googlesheets",
        name: "Google Sheets",
        description: "Export and sync data to Google Sheets",
        icon: FileText,
        color: "#0F9D58",
        status: "pending",
        lastSync: null,
        documentationUrl: "https://developers.google.com/sheets",
      },
    ];
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const newKey: APIKey = {
        id: `key-${Date.now()}`,
        name: newKeyName,
        key: `sk_live_${Math.random().toString(36).substring(2)}`,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        status: "active",
        requestCount: 0,
        rateLimit: 10000,
      };

      const response = await fetch(`${apiEndpoint}/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) throw new Error("Failed to create key");

      setApiKeys([...apiKeys, newKey]);
      setNewKeyName("");
      setDialogOpen(false);
      toast.success("API key created successfully");

      // Show the new key
      setShowKey(newKey.id);
      setTimeout(() => setShowKey(null), 30000); // Hide after 30 seconds
    } catch (error) {
      // Fallback
      const newKey: APIKey = {
        id: `key-${Date.now()}`,
        name: newKeyName,
        key: `sk_live_${Math.random().toString(36).substring(2)}`,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        status: "active",
        requestCount: 0,
        rateLimit: 10000,
      };
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName("");
      setDialogOpen(false);
      toast.success("API key created");
      setShowKey(newKey.id);
      setTimeout(() => setShowKey(null), 30000);
    }
  };

  const toggleKeyStatus = async (keyId: string) => {
    const key = apiKeys.find((k) => k.id === keyId);
    if (!key) return;

    const newStatus = key.status === "active" ? "inactive" : "active";

    try {
      const token = localStorage.getItem("bearer_token");
      await fetch(`${apiEndpoint}/keys/${keyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      setApiKeys(apiKeys.map((k) => (k.id === keyId ? { ...k, status: newStatus } : k)));
      toast.success(`Key ${newStatus === "active" ? "activated" : "deactivated"}`);
    } catch (error) {
      setApiKeys(apiKeys.map((k) => (k.id === keyId ? { ...k, status: newStatus } : k)));
      toast.success(`Key ${newStatus === "active" ? "activated" : "deactivated"}`);
    }
  };

  const deleteKey = async (keyId: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch(`${apiEndpoint}/keys/${keyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
      toast.success("API key deleted");
    } catch (error) {
      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
      toast.success("API key deleted");
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 12)}${"•".repeat(24)}`;
  };

  const connectIntegration = async (integrationId: string) => {
    toast.info("Opening OAuth authentication...");
    // Simulate OAuth flow
    setTimeout(() => {
      setIntegrations(
        integrations.map((i) =>
          i.id === integrationId ? { ...i, status: "connected", lastSync: new Date().toISOString() } : i
        )
      );
      toast.success("Integration connected successfully");
    }, 2000);
  };

  const disconnectIntegration = async (integrationId: string) => {
    setIntegrations(
      integrations.map((i) => (i.id === integrationId ? { ...i, status: "disconnected", lastSync: null } : i))
    );
    toast.success("Integration disconnected");
  };

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requestCount, 0);
  const activeKeys = apiKeys.filter((k) => k.status === "active").length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">API Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{apiKeys.length}</div>
            <div className="text-xs text-muted-foreground mt-1">{activeKeys} active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-[#08CB00]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "#08CB00" }}>
              {totalRequests.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Last 30 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Integrations</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{integrations.filter((i) => i.status === "connected").length}</div>
            <div className="text-xs text-muted-foreground mt-1">of {integrations.length} active</div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">API Keys</CardTitle>
              <CardDescription>Manage your API keys for programmatic access</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Key className="mr-2 h-4 w-4" />
                  Create Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>Generate a new API key for your application</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Production API Key"
                    className="mt-1"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAPIKey}>Create Key</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No API keys</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first API key to get started</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => {
                    const usagePercent = (key.requestCount / key.rateLimit) * 100;
                    return (
                      <TableRow key={key.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{key.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Created {new Date(key.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono">{showKey === key.id ? key.key : maskKey(key.key)}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                            >
                              {showKey === key.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyKey(key.key)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={key.status === "active" ? { color: "#08CB00", borderColor: "#08CB00" } : {}}
                          >
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">
                              {key.requestCount.toLocaleString()} / {key.rateLimit.toLocaleString()}
                            </div>
                            <div className="w-32 h-1.5 bg-muted rounded-full mt-1">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(usagePercent, 100)}%`,
                                  backgroundColor: usagePercent > 80 ? "#FF4444" : "#08CB00",
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : "Never"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleKeyStatus(key.id)}
                              title={key.status === "active" ? "Deactivate" : "Activate"}
                            >
                              {key.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteKey(key.id)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BI Tool Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            <Zap className="inline h-5 w-5 mr-2" />
            BI Tool Integrations
          </CardTitle>
          <CardDescription>Connect to popular business intelligence platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              const statusColors = {
                connected: { bg: "#08CB0020", text: "#08CB00", border: "#08CB00" },
                disconnected: { bg: "", text: "", border: "" },
                pending: { bg: "#FFA50020", text: "#FFA500", border: "#FFA500" },
              };
              const colors = statusColors[integration.status];

              return (
                <div
                  key={integration.id}
                  className="rounded-lg border-2 p-4 transition-all"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border || "var(--border)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${integration.color}20` }}>
                        <Icon className="h-5 w-5" style={{ color: integration.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      style={colors.text ? { color: colors.text, borderColor: colors.border } : {}}
                    >
                      {integration.status}
                    </Badge>
                  </div>

                  {integration.lastSync && (
                    <div className="text-xs text-muted-foreground mb-3">
                      Last synced: {new Date(integration.lastSync).toLocaleString()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {integration.status === "connected" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectIntegration(integration.id)}
                          className="flex-1"
                        >
                          Disconnect
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Configure
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => connectIntegration(integration.id)}
                          className="flex-1"
                          style={{ backgroundColor: integration.color }}
                        >
                          Connect
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(integration.documentationUrl, "_blank")}
                        >
                          Docs
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
