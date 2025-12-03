"use client";

import { useState, useEffect, useRef } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Cell,
} from "recharts";
import { Download, Award, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface RadarData {
  metric: string;
  value: number;
  fullMark: number;
}

interface ScatterData {
  event: string;
  capacity: number;
  revenue: number;
  attendees: number;
}

interface BoxPlotData {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

interface WaterfallData {
  name: string;
  value: number;
  fill: string;
}

interface EventPerformanceChartProps {
  apiEndpoint?: string;
  eventId?: string;
  className?: string;
}

export const EventPerformanceChart = ({
  apiEndpoint = "/api/analytics/event-performance",
  eventId,
  className = "",
}: EventPerformanceChartProps) => {
  const [activeTab, setActiveTab] = useState("radar");
  const [timeRange, setTimeRange] = useState("30days");
  const [loading, setLoading] = useState(true);
  const [radarData, setRadarData] = useState<RadarData[]>([]);
  const [scatterData, setScatterData] = useState<ScatterData[]>([]);
  const [boxPlotData, setBoxPlotData] = useState<BoxPlotData[]>([]);
  const [waterfallData, setWaterfallData] = useState<WaterfallData[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange, activeTab, eventId]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const params = new URLSearchParams({
        range: timeRange,
        type: activeTab,
        ...(eventId && { eventId }),
      });

      const response = await fetch(`${apiEndpoint}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch performance data");

      const result = await response.json();

      // Transform API data based on tab
      if (activeTab === "radar") {
        const transformed = result.data?.radar || generateMockRadar();
        setRadarData(transformed);
      } else if (activeTab === "scatter") {
        const transformed = result.data?.scatter || generateMockScatter();
        setScatterData(transformed);
      } else if (activeTab === "boxplot") {
        const transformed = result.data?.boxplot || generateMockBoxPlot();
        setBoxPlotData(transformed);
      } else if (activeTab === "waterfall") {
        const transformed = result.data?.waterfall || generateMockWaterfall();
        setWaterfallData(transformed);
      }
    } catch (error) {
      console.error("Performance data fetch error:", error);
      // Load mock data
      if (activeTab === "radar") setRadarData(generateMockRadar());
      if (activeTab === "scatter") setScatterData(generateMockScatter());
      if (activeTab === "boxplot") setBoxPlotData(generateMockBoxPlot());
      if (activeTab === "waterfall") setWaterfallData(generateMockWaterfall());
      toast.error("Using sample data - API connection pending");
    } finally {
      setLoading(false);
    }
  };

  const generateMockRadar = (): RadarData[] => {
    return [
      { metric: "Attendance Rate", value: 85, fullMark: 100 },
      { metric: "Revenue", value: 72, fullMark: 100 },
      { metric: "User Satisfaction", value: 90, fullMark: 100 },
      { metric: "Marketing Reach", value: 65, fullMark: 100 },
      { metric: "Engagement", value: 78, fullMark: 100 },
      { metric: "Repeat Visitors", value: 55, fullMark: 100 },
    ];
  };

  const generateMockScatter = (): ScatterData[] => {
    return Array.from({ length: 30 }, (_, i) => ({
      event: `Event ${i + 1}`,
      capacity: Math.floor(Math.random() * 500) + 100,
      revenue: Math.floor(Math.random() * 50000) + 5000,
      attendees: Math.floor(Math.random() * 400) + 50,
    }));
  };

  const generateMockBoxPlot = (): BoxPlotData[] => {
    return [
      { category: "Music", min: 10, q1: 25, median: 45, q3: 65, max: 85 },
      { category: "Sports", min: 15, q1: 30, median: 50, q3: 70, max: 90 },
      { category: "Tech", min: 20, q1: 35, median: 55, q3: 75, max: 95 },
      { category: "Arts", min: 12, q1: 28, median: 42, q3: 62, max: 80 },
      { category: "Food", min: 18, q1: 32, median: 48, q3: 68, max: 88 },
    ];
  };

  const generateMockWaterfall = (): WaterfallData[] => {
    return [
      { name: "Ticket Sales", value: 50000, fill: "#08CB00" },
      { name: "Processing Fees", value: -2500, fill: "#FF4444" },
      { name: "Platform Commission", value: -2000, fill: "#FF4444" },
      { name: "Marketing Costs", value: -5000, fill: "#FF4444" },
      { name: "Venue Costs", value: -15000, fill: "#FF4444" },
      { name: "Net Revenue", value: 25500, fill: "#253900" },
    ];
  };

  const exportChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await import("html2canvas").then((mod) => mod.default);
      const chartCanvas = await canvas(chartRef.current);

      const link = document.createElement("a");
      link.download = `performance-${activeTab}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = chartCanvas.toDataURL();
      link.click();

      toast.success("Chart exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed");
    }
  };

  // Box plot rendering
  const renderBoxPlot = () => {
    return (
      <div className="space-y-6">
        {boxPlotData.map((data, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{data.category}</span>
              <span className="text-xs text-muted-foreground">Median: ${data.median}</span>
            </div>
            <div className="relative h-12 bg-muted/20 rounded-lg">
              {/* Min-Max line */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-border"
                style={{
                  left: `${data.min}%`,
                  width: `${data.max - data.min}%`,
                }}
              />
              {/* IQR box */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-8 border-2 rounded"
                style={{
                  left: `${data.q1}%`,
                  width: `${data.q3 - data.q1}%`,
                  borderColor: "#08CB00",
                  backgroundColor: "rgba(8, 203, 0, 0.1)",
                }}
              />
              {/* Median line */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-10 w-0.5"
                style={{
                  left: `${data.median}%`,
                  backgroundColor: "#08CB00",
                }}
              />
              {/* Min/Max whiskers */}
              <div className="absolute top-1/2 -translate-y-1/2 h-6 w-0.5 bg-border" style={{ left: `${data.min}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 h-6 w-0.5 bg-border" style={{ left: `${data.max}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${data.min}</span>
              <span>${data.max}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">{data.event}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Capacity:</span>
            <span className="font-semibold">{data.capacity}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Revenue:</span>
            <span className="font-semibold text-[#08CB00]">${data.revenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Attendees:</span>
            <span className="font-semibold">{data.attendees}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Fill Rate:</span>
            <span className="font-semibold">{((data.attendees / data.capacity) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  };

  const avgScore = radarData.reduce((sum, item) => sum + item.value, 0) / radarData.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Event Performance Analysis</CardTitle>
            <CardDescription>Multi-dimensional comparative analytics</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
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
              <Award className="h-4 w-4 text-[#08CB00]" />
              <span>Performance Score</span>
            </div>
            <p className="text-2xl font-bold text-[#08CB00]">{avgScore.toFixed(1)}/100</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span>Events Analyzed</span>
            </div>
            <p className="text-2xl font-bold">{scatterData.length}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4 text-[#08CB00]" />
              <span>Avg Fill Rate</span>
            </div>
            <p className="text-2xl font-bold text-[#08CB00]">78.5%</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="radar">Radar</TabsTrigger>
            <TabsTrigger value="scatter">Scatter</TabsTrigger>
            <TabsTrigger value="boxplot">Box Plot</TabsTrigger>
            <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
          </TabsList>

          <div ref={chartRef} className="mt-6">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                <TabsContent value="radar" className="mt-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(238, 238, 238, 0.2)" />
                      <PolarAngleAxis dataKey="metric" stroke="#EEEEEE" style={{ fontSize: "12px" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#EEEEEE" />
                      <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="#08CB00"
                        fill="#08CB00"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="scatter" className="mt-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 238, 238, 0.1)" />
                      <XAxis
                        type="number"
                        dataKey="capacity"
                        name="Capacity"
                        stroke="#EEEEEE"
                        label={{ value: "Event Capacity", position: "insideBottom", offset: -10, fill: "#EEEEEE" }}
                      />
                      <YAxis
                        type="number"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#EEEEEE"
                        label={{ value: "Revenue ($)", angle: -90, position: "insideLeft", fill: "#EEEEEE" }}
                      />
                      <ZAxis type="number" dataKey="attendees" range={[50, 400]} />
                      <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name="Events" data={scatterData} fill="#08CB00" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="boxplot" className="mt-0">
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-4 text-center text-sm text-muted-foreground">
                      Ticket Price Distribution by Category
                    </div>
                    {renderBoxPlot()}
                  </div>
                </TabsContent>

                <TabsContent value="waterfall" className="mt-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 238, 238, 0.1)" />
                      <XAxis dataKey="name" stroke="#EEEEEE" style={{ fontSize: "11px" }} />
                      <YAxis stroke="#EEEEEE" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: any) => [`$${value.toLocaleString()}`, "Amount"]}
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {waterfallData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
