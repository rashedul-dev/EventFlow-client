"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Users, DollarSign, Activity, Download } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { toast } from "sonner";

interface Cohort {
  cohort_date: string;
  cohort_size: number;
  retention: number[];
  ltv: number[];
  behavior_metrics: {
    week: number;
    active_users: number;
    events_per_user: number;
    revenue_per_user: number;
  }[];
}

interface CohortComparison {
  cohort1: string;
  cohort2: string;
  retention_diff: number[];
  ltv_diff: number[];
}

const COLORS = {
  primary: "#08CB00",
  secondary: "#253900",
  tertiary: "#FFA500",
  muted: "#6B7280",
};

const COHORT_TYPES = [
  { id: "signup", name: "Signup Date", description: "Group by user registration date" },
  { id: "first_purchase", name: "First Purchase", description: "Group by first ticket purchase" },
  { id: "first_event", name: "First Event Attended", description: "Group by first event attendance" },
];

const TIME_PERIODS = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
];

export const CohortAnalysis = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortType, setSelectedCohortType] = useState("signup");
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCohorts();
  }, [selectedCohortType, selectedPeriod]);

  const fetchCohorts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/analytics/cohorts?type=${selectedCohortType}&period=${selectedPeriod}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch cohort data");

      const data = await response.json();
      setCohorts(data.cohorts || []);
    } catch (err) {
      toast.error("Failed to load cohort analysis");
    } finally {
      setLoading(false);
    }
  };

  const exportCohortData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/analytics/cohorts/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: selectedCohortType,
          period: selectedPeriod,
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cohort_analysis_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Cohort data exported successfully");
    } catch (err) {
      toast.error("Failed to export cohort data");
    }
  };

  const retentionCurveData = cohorts.map((cohort) => {
    const data: any = { name: cohort.cohort_date };
    cohort.retention.forEach((retention, index) => {
      data[`Week ${index}`] = retention;
    });
    return data;
  });

  const ltvCurveData = cohorts.map((cohort) => {
    const data: any = { name: cohort.cohort_date };
    cohort.ltv.forEach((ltv, index) => {
      data[`Week ${index}`] = ltv;
    });
    return data;
  });

  // Heat map data for retention
  const retentionHeatmapData = cohorts.map((cohort) => ({
    cohort: cohort.cohort_date,
    size: cohort.cohort_size,
    retention: cohort.retention,
  }));

  const getRetentionColor = (value: number) => {
    if (value >= 80) return COLORS.primary;
    if (value >= 60) return COLORS.tertiary;
    if (value >= 40) return COLORS.secondary;
    return COLORS.muted;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" style={{ color: COLORS.primary }} />
                Cohort Analysis
              </CardTitle>
              <CardDescription>Track user behavior and retention over time</CardDescription>
            </div>
            <Button onClick={exportCohortData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Cohort Type</Label>
              <Select value={selectedCohortType} onValueChange={setSelectedCohortType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COHORT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">Analyzing cohorts...</p>
            </div>
          </CardContent>
        </Card>
      ) : cohorts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No cohort data available</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="retention" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="ltv">Lifetime Value</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
          </TabsList>

          <TabsContent value="retention" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" style={{ color: COLORS.primary }} />
                  Retention Curve by Cohort
                </CardTitle>
                <CardDescription>Percentage of users returning each week after joining</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={retentionCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      label={{ value: "Retention %", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    {cohorts[0]?.retention.map((_, index) => (
                      <Line
                        key={index}
                        type="monotone"
                        dataKey={`Week ${index}`}
                        stroke={[COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.muted][index % 4]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {cohorts.slice(0, 3).map((cohort, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{cohort.cohort_date}</span>
                            <Badge variant="outline">{cohort.cohort_size} users</Badge>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Week 1 Retention</Label>
                            <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                              {cohort.retention[1]?.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Current Retention</Label>
                            <p className="text-lg font-semibold">
                              {cohort.retention[cohort.retention.length - 1]?.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ltv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" style={{ color: COLORS.primary }} />
                  Lifetime Value by Cohort
                </CardTitle>
                <CardDescription>Cumulative revenue generated per user over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={ltvCurveData}>
                    <defs>
                      <linearGradient id="colorLTV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      label={{ value: "LTV ($)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                    {cohorts[0]?.ltv.map((_, index) => (
                      <Area
                        key={index}
                        type="monotone"
                        dataKey={`Week ${index}`}
                        stroke={[COLORS.primary, COLORS.secondary, COLORS.tertiary][index % 3]}
                        fill="url(#colorLTV)"
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {cohorts.slice(0, 3).map((cohort, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <span className="text-sm font-medium">{cohort.cohort_date}</span>
                          <div>
                            <Label className="text-xs text-muted-foreground">Current LTV</Label>
                            <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                              ${cohort.ltv[cohort.ltv.length - 1]?.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Projected 12-Month LTV</Label>
                            <p className="text-lg font-semibold">
                              ${(cohort.ltv[cohort.ltv.length - 1] * 1.5).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" style={{ color: COLORS.primary }} />
                  Behavioral Patterns
                </CardTitle>
                <CardDescription>How cohort behavior evolves over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {cohorts.slice(0, 3).map((cohort, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{cohort.cohort_date} Cohort</CardTitle>
                      <CardDescription>{cohort.cohort_size} users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {cohort.behavior_metrics.map((metric, weekIndex) => (
                          <div key={weekIndex} className="grid grid-cols-4 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Week {metric.week}</Label>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Active Users</Label>
                              <p className="font-semibold">{metric.active_users}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Events/User</Label>
                              <p className="font-semibold">{metric.events_per_user.toFixed(2)}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Revenue/User</Label>
                              <p className="font-semibold">${metric.revenue_per_user.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Retention Heat Map</CardTitle>
                <CardDescription>Visual representation of retention across all cohorts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-border p-2 text-left text-sm">Cohort</th>
                        <th className="border border-border p-2 text-center text-sm">Size</th>
                        {cohorts[0]?.retention.map((_, index) => (
                          <th key={index} className="border border-border p-2 text-center text-sm">
                            Week {index}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {retentionHeatmapData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="border border-border p-2 text-sm font-medium">{row.cohort}</td>
                          <td className="border border-border p-2 text-center text-sm">{row.size}</td>
                          {row.retention.map((value, colIndex) => (
                            <td
                              key={colIndex}
                              className="border border-border p-2 text-center text-sm font-semibold"
                              style={{
                                backgroundColor: `${getRetentionColor(value)}20`,
                                color: getRetentionColor(value),
                              }}
                            >
                              {value.toFixed(0)}%
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">Legend:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: `${COLORS.primary}40` }} />
                    <span>80%+ (Excellent)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: `${COLORS.tertiary}40` }} />
                    <span>60-80% (Good)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: `${COLORS.secondary}40` }} />
                    <span>40-60% (Fair)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: `${COLORS.muted}40` }} />
                    <span>&lt;40% (Needs Work)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
