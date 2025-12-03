"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Database, Server, Zap, HardDrive } from "lucide-react";
import { toast } from "sonner";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  responseTime: number;
  uptime: number;
  lastChecked: Date;
}

export function SystemHealth() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "API Server", status: "operational", responseTime: 145, uptime: 99.9, lastChecked: new Date() },
    { name: "Database", status: "operational", responseTime: 28, uptime: 99.8, lastChecked: new Date() },
    { name: "Cache Server", status: "degraded", responseTime: 320, uptime: 98.5, lastChecked: new Date() },
    { name: "Storage", status: "operational", responseTime: 89, uptime: 99.9, lastChecked: new Date() },
    { name: "Email Service", status: "operational", responseTime: 156, uptime: 99.7, lastChecked: new Date() },
    { name: "Payment Gateway", status: "operational", responseTime: 245, uptime: 99.6, lastChecked: new Date() },
  ]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkIn: 125.5,
    networkOut: 98.3,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // TODO: Implement actual health checks
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("System health refreshed");
    } catch (error) {
      toast.error("Failed to refresh system health");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "down":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Degraded</Badge>;
      case "down":
        return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Down</Badge>;
    }
  };

  const overallHealth = (services.filter((s) => s.status === "operational").length / services.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitoring</h2>
          <p className="text-muted-foreground">Real-time infrastructure monitoring and status</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Overall System Health
            <Badge variant={overallHealth >= 90 ? "default" : overallHealth >= 70 ? "secondary" : "destructive"}>
              {overallHealth.toFixed(1)}%
            </Badge>
          </CardTitle>
          <CardDescription>
            {services.filter((s) => s.status === "operational").length} of {services.length} services operational
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallHealth} className="h-2" />
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Individual service health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Response: {service.responseTime}ms</span>
                      <span>•</span>
                      <span>Uptime: {service.uptime}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(service.status)}
                  <span className="text-xs text-muted-foreground">{service.lastChecked.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{systemMetrics.cpuUsage}%</div>
            <Progress value={systemMetrics.cpuUsage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {systemMetrics.cpuUsage < 70 ? "Normal" : systemMetrics.cpuUsage < 90 ? "High" : "Critical"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{systemMetrics.memoryUsage}%</div>
            <Progress value={systemMetrics.memoryUsage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {systemMetrics.memoryUsage < 70 ? "Normal" : systemMetrics.memoryUsage < 90 ? "High" : "Critical"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{systemMetrics.diskUsage}%</div>
            <Progress value={systemMetrics.diskUsage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {systemMetrics.diskUsage < 70 ? "Normal" : systemMetrics.diskUsage < 90 ? "High" : "Critical"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network Traffic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Network Traffic
          </CardTitle>
          <CardDescription>Current network throughput</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Inbound</span>
                <span className="text-2xl font-bold">{systemMetrics.networkIn} MB/s</span>
              </div>
              <Progress value={systemMetrics.networkIn} max={200} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Outbound</span>
                <span className="text-2xl font-bold">{systemMetrics.networkOut} MB/s</span>
              </div>
              <Progress value={systemMetrics.networkOut} max={200} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incident History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Last 7 days of system incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { service: "Cache Server", issue: "High latency detected", time: "2 hours ago", resolved: true },
              { service: "Database", issue: "Connection timeout", time: "1 day ago", resolved: true },
              { service: "API Server", issue: "Rate limit exceeded", time: "3 days ago", resolved: true },
            ].map((incident, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {incident.resolved ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{incident.service}</p>
                    <p className="text-xs text-muted-foreground">{incident.issue}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={incident.resolved ? "secondary" : "destructive"}>
                    {incident.resolved ? "Resolved" : "Active"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{incident.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
