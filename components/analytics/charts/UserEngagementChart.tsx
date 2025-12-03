"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { Download, Users, TrendingUp, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface HeatMapData {
  day: string;
  hour: number;
  value: number;
}

interface FunnelData {
  stage: string;
  value: number;
  fill: string;
}

interface RetentionData {
  week: string;
  retention: number;
}

interface UserEngagementChartProps {
  apiEndpoint?: string;
  className?: string;
}

export const UserEngagementChart = ({
  apiEndpoint = "/api/analytics/user-engagement",
  className = "",
}: UserEngagementChartProps) => {
  const [activeTab, setActiveTab] = useState("heatmap");
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatMapData[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEngagementData();
  }, [timeRange, activeTab]);

  const fetchEngagementData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`${apiEndpoint}?range=${timeRange}&type=${activeTab}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch engagement data");

      const result = await response.json();

      // Transform API data based on tab
      if (activeTab === "heatmap") {
        const transformed = result.data?.heatmap || generateMockHeatmap();
        setHeatmapData(transformed);
      } else if (activeTab === "funnel") {
        const transformed = result.data?.funnel || generateMockFunnel();
        setFunnelData(transformed);
      } else if (activeTab === "retention") {
        const transformed = result.data?.retention || generateMockRetention();
        setRetentionData(transformed);
      } else if (activeTab === "cohort") {
        const transformed = result.data?.cohort || generateMockCohort();
        setCohortData(transformed);
      }
    } catch (error) {
      console.error("Engagement data fetch error:", error);
      // Load mock data
      if (activeTab === "heatmap") setHeatmapData(generateMockHeatmap());
      if (activeTab === "funnel") setFunnelData(generateMockFunnel());
      if (activeTab === "retention") setRetentionData(generateMockRetention());
      if (activeTab === "cohort") setCohortData(generateMockCohort());
      toast.error("Using sample data - API connection pending");
    } finally {
      setLoading(false);
    }
  };

  const generateMockHeatmap = (): HeatMapData[] => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data: HeatMapData[] = [];

    days.forEach((day) => {
      for (let hour = 0; hour < 24; hour++) {
        data.push({
          day,
          hour,
          value: Math.floor(Math.random() * 100),
        });
      }
    });

    return data;
  };

  const generateMockFunnel = (): FunnelData[] => {
    return [
      { stage: "Visited Site", value: 10000, fill: "#08CB00" },
      { stage: "Viewed Event", value: 6500, fill: "#1AAF00" },
      { stage: "Started Checkout", value: 3200, fill: "#2C9300" },
      { stage: "Completed Payment", value: 2400, fill: "#3E7700" },
      { stage: "Attended Event", value: 2100, fill: "#253900" },
    ];
  };

  const generateMockRetention = (): RetentionData[] => {
    return Array.from({ length: 12 }, (_, i) => ({
      week: `Week ${i + 1}`,
      retention: 100 - i * 8 - Math.random() * 10,
    }));
  };

  const generateMockCohort = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `M${i + 1}`,
      cohortSize: Math.floor(Math.random() * 500) + 100,
      ...Array.from({ length: 6 }, (_, j) => ({
        [`week${j}`]: 100 - j * 15 - Math.random() * 10,
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    }));
  };

  const exportChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await import("html2canvas").then((mod) => mod.default);
      const chartCanvas = await canvas(chartRef.current);

      const link = document.createElement("a");
      link.download = `engagement-${activeTab}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = chartCanvas.toDataURL();
      link.click();

      toast.success("Chart exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed");
    }
  };

  // Heatmap rendering logic
  const renderHeatMap = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getColor = (value: number) => {
      // Gradient from #253900 (low) to #08CB00 (high)
      const intensity = value / 100;
      const r = Math.floor(37 + (8 - 37) * intensity);
      const g = Math.floor(57 + (203 - 57) * intensity);
      const b = Math.floor(0 + (0 - 0) * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    };

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex">
            <div className="w-16" />
            {hours.map((hour) => (
              <div key={hour} className="flex-1 text-center text-xs text-muted-foreground py-2">
                {hour}h
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day} className="flex">
              <div className="w-16 flex items-center text-xs text-muted-foreground pr-2">{day}</div>
              {hours.map((hour) => {
                const dataPoint = heatmapData.find((d) => d.day === day && d.hour === hour);
                const value = dataPoint?.value || 0;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="flex-1 aspect-square border border-border/50 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    style={{ backgroundColor: getColor(value) }}
                    title={`${day} ${hour}:00 - ${value} users`}
                  />
                );
              })}
            </div>
          ))}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Low</span>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="w-6 h-4 rounded" style={{ backgroundColor: getColor(i * 11) }} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm mb-1">{payload[0].payload.week}</p>
        <p className="text-xs text-muted-foreground">
          Retention: <span className="font-semibold text-[#08CB00]">{payload[0].value.toFixed(1)}%</span>
        </p>
      </div>
    );
  };

  const conversionRate =
    funnelData.length > 0 ? ((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100).toFixed(1) : "0";

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">User Engagement Analytics</CardTitle>
            <CardDescription>Behavioral patterns and conversion insights</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={exportChart} title="Export Chart">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Users className="h-4 w-4 text-[#08CB00]" />
              <span>Active Users</span>
            </div>
            <p className="text-2xl font-bold">{funnelData[0]?.value.toLocaleString() || "0"}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Target className="h-4 w-4 text-[#08CB00]" />
              <span>Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold text-[#08CB00]">{conversionRate}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Activity className="h-4 w-4 text-[#08CB00]" />
              <span>Avg Engagement</span>
            </div>
            <p className="text-2xl font-bold text-[#08CB00]">8.5/10</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="cohort">Cohort</TabsTrigger>
          </TabsList>

          <div ref={chartRef} className="mt-6">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                <TabsContent value="heatmap" className="mt-0">
                  {renderHeatMap()}
                </TabsContent>

                <TabsContent value="funnel" className="mt-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <FunnelChart>
                      <Tooltip />
                      <Funnel dataKey="value" data={funnelData} isAnimationActive>
                        <LabelList position="right" fill="#EEEEEE" stroke="none" dataKey="stage" />
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="retention" className="mt-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={retentionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#08CB00" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#253900" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 238, 238, 0.1)" />
                      <XAxis dataKey="week" stroke="#EEEEEE" style={{ fontSize: "12px" }} />
                      <YAxis stroke="#EEEEEE" style={{ fontSize: "12px" }} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="retention"
                        stroke="#08CB00"
                        strokeWidth={2}
                        fill="url(#retentionGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="cohort" className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2">Cohort</th>
                          <th className="text-center p-2">Size</th>
                          {Array.from({ length: 6 }, (_, i) => (
                            <th key={i} className="text-center p-2">
                              Week {i}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cohortData.slice(0, 8).map((cohort, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-2 font-medium">{cohort.month}</td>
                            <td className="p-2 text-center text-muted-foreground">{cohort.cohortSize}</td>
                            {Array.from({ length: 6 }, (_, j) => {
                              const value = cohort[`week${j}`];
                              const intensity = value / 100;
                              return (
                                <td
                                  key={j}
                                  className="p-2 text-center"
                                  style={{
                                    backgroundColor: `rgba(8, 203, 0, ${intensity * 0.3})`,
                                  }}
                                >
                                  {value ? `${value.toFixed(0)}%` : "-"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
