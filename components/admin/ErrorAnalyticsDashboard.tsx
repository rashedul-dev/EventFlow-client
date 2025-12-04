"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { AnalyticsTracker, ErrorImpact } from "@/lib/monitoring/AnalyticsTracker";
import { AlertManager, Alert } from "@/lib/monitoring/AlertManager";
import { PerformanceMonitor } from "@/lib/monitoring/PerformanceMonitor";

/**
 * Error Analytics Dashboard for admins
 *
 * Features:
 * - Real-time error monitoring panel
 * - Error rate by type, route, and user segment
 * - Affected user count and revenue impact
 * - Error trend analysis (increasing/decreasing)
 * - Most common user actions before errors
 * - Resolution time tracking
 */

export function ErrorAnalyticsDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [webVitals, setWebVitals] = useState<any>(null);

  useEffect(() => {
    // Load initial data
    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setSummary(AnalyticsTracker.getSummary());
    setAlerts(AlertManager.getAlerts({ resolved: false }));
    setWebVitals(PerformanceMonitor.getWebVitals());
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Analytics</h1>
          <p className="text-muted-foreground mt-1">Monitor and analyze application errors in real-time</p>
        </div>
        <Button onClick={loadData}>Refresh</Button>
      </div>

      {/* SLA Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">SLA Compliance</h3>
            <p className="text-sm text-muted-foreground mt-1">Target: Error rate &lt; 0.1%</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold">{(summary.sla.currentRate * 100).toFixed(3)}%</div>
              <div className="text-sm text-muted-foreground">Current Rate</div>
            </div>
            <div>
              {summary.sla.compliant ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Errors in window:</span>
            <span className="ml-2 font-semibold">{summary.sla.errorsInWindow}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total requests:</span>
            <span className="ml-2 font-semibold">{summary.sla.totalInWindow}</span>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Errors"
          value={summary.errorImpact.totalErrors}
          icon={AlertTriangle}
          trend={summary.errorImpact.unresolvedErrors > 0 ? "up" : "down"}
          color="red"
        />
        <StatCard title="Unresolved" value={summary.errorImpact.unresolvedErrors} icon={Clock} color="orange" />
        <StatCard title="Affected Users" value={summary.errorImpact.totalAffectedUsers} icon={Users} color="blue" />
        <StatCard
          title="Recovery Rate"
          value={`${(summary.userBehavior.recoveryRate * 100).toFixed(1)}%`}
          icon={TrendingUp}
          trend={summary.userBehavior.recoveryRate > 0.5 ? "up" : "down"}
          color="green"
        />
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </Card>
      )}

      {/* Top Errors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Errors by Impact</h3>
        <div className="space-y-3">
          {summary.topErrors.map((error: ErrorImpact) => (
            <ErrorImpactItem key={error.errorId} error={error} />
          ))}
          {summary.topErrors.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No errors recorded 🎉</p>
          )}
        </div>
      </Card>

      {/* Web Vitals */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <WebVitalCard
            name="LCP"
            value={webVitals.LCP}
            unit="ms"
            threshold={2500}
            description="Largest Contentful Paint"
          />
          <WebVitalCard name="FID" value={webVitals.FID} unit="ms" threshold={100} description="First Input Delay" />
          <WebVitalCard
            name="CLS"
            value={webVitals.CLS}
            unit=""
            threshold={0.1}
            description="Cumulative Layout Shift"
          />
          <WebVitalCard
            name="FCP"
            value={webVitals.FCP}
            unit="ms"
            threshold={1500}
            description="First Contentful Paint"
          />
          <WebVitalCard name="TTFB" value={webVitals.TTFB} unit="ms" threshold={600} description="Time to First Byte" />
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colorClasses: Record<string, string> = {
    red: "text-red-600 bg-red-50",
    orange: "text-orange-600 bg-orange-50",
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <TrendingUp className={`w-3 h-3 ${trend === "up" ? "text-green-600" : "text-red-600 rotate-180"}`} />
          <span className={trend === "up" ? "text-green-600" : "text-red-600"}>
            {trend === "up" ? "Improving" : "Needs attention"}
          </span>
        </div>
      )}
    </Card>
  );
}

function AlertItem({ alert }: { alert: Alert }) {
  const severityColors: Record<string, string> = {
    critical: "border-red-500 bg-red-50",
    high: "border-orange-500 bg-orange-50",
    medium: "border-yellow-500 bg-yellow-50",
    low: "border-blue-500 bg-blue-50",
  };

  return (
    <div className={`border-l-4 p-3 rounded ${severityColors[alert.severity]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase">{alert.severity}</span>
            <span className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</span>
          </div>
          <p className="font-semibold mt-1">{alert.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => AlertManager.acknowledgeAlert(alert.id)}>
          Acknowledge
        </Button>
      </div>
    </div>
  );
}

function ErrorImpactItem({ error }: { error: ErrorImpact }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{error.errorId}</span>
          {error.resolved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Resolved</span>}
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span>{error.affectedUsers} users affected</span>
          <span>{error.occurences} occurrences</span>
          <span>First seen: {new Date(error.firstSeen).toLocaleDateString()}</span>
        </div>
      </div>
      {!error.resolved && (
        <Button size="sm" variant="outline" onClick={() => AnalyticsTracker.markErrorResolved(error.errorId)}>
          Mark Resolved
        </Button>
      )}
    </div>
  );
}

function WebVitalCard({ name, value, unit, threshold, description }: any) {
  if (value === null) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="text-lg font-semibold">{name}</div>
        <div className="text-sm text-muted-foreground mt-1">No data</div>
      </div>
    );
  }

  const isGood = value <= threshold;
  const color = isGood ? "text-green-600" : "text-red-600";

  return (
    <div className="p-4 border rounded-lg">
      <div className="text-lg font-semibold">{name}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>
        {value.toFixed(0)}
        {unit}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
      <div className="text-xs mt-1">
        Target: &le; {threshold}
        {unit}
      </div>
    </div>
  );
}
