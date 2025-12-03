"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Award, Target, Lightbulb, Users, DollarSign, Star, Download } from "lucide-react";
import { toast } from "sonner";

interface BenchmarkData {
  metric: string;
  yourValue: number;
  industryAverage: number;
  topPerformer: number;
  percentile: number;
  recommendation: string;
}

interface CompetitorData {
  category: string;
  yourEvent: number;
  competitor1: number;
  competitor2: number;
  industryAvg: number;
}

interface BestPractice {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  implemented: boolean;
  estimatedImprovement: string;
}

interface BenchmarkingReportsProps {
  eventId?: string;
  apiEndpoint?: string;
  className?: string;
}

export const BenchmarkingReports = ({
  eventId,
  apiEndpoint = "/api/analytics/organizer/benchmarking",
  className = "",
}: BenchmarkingReportsProps) => {
  const [loading, setLoading] = useState(true);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [comparisons, setComparisons] = useState<CompetitorData[]>([]);
  const [bestPractices, setBestPractices] = useState<BestPractice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("music");

  useEffect(() => {
    fetchBenchmarkData();
  }, [selectedCategory, eventId]);

  const fetchBenchmarkData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`${apiEndpoint}?category=${selectedCategory}&eventId=${eventId || ""}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch benchmark data");

      const result = await response.json();
      setBenchmarks(result.benchmarks || generateMockBenchmarks());
      setComparisons(result.comparisons || generateMockComparisons());
      setBestPractices(result.bestPractices || generateMockBestPractices());
    } catch (error) {
      console.error("Benchmark fetch error:", error);
      setBenchmarks(generateMockBenchmarks());
      setComparisons(generateMockComparisons());
      setBestPractices(generateMockBestPractices());
      toast.error("Using sample data - API connection pending");
    } finally {
      setLoading(false);
    }
  };

  const generateMockBenchmarks = (): BenchmarkData[] => {
    return [
      {
        metric: "Ticket Sales Rate",
        yourValue: 75,
        industryAverage: 68,
        topPerformer: 92,
        percentile: 65,
        recommendation: "Increase marketing reach to boost sales velocity",
      },
      {
        metric: "Revenue per Attendee",
        yourValue: 85,
        industryAverage: 72,
        topPerformer: 110,
        percentile: 72,
        recommendation: "Consider upselling VIP packages and merchandise",
      },
      {
        metric: "Attendee Satisfaction",
        yourValue: 88,
        industryAverage: 82,
        topPerformer: 95,
        percentile: 78,
        recommendation: "Maintain current service quality and enhance food options",
      },
      {
        metric: "Social Engagement",
        yourValue: 65,
        industryAverage: 78,
        topPerformer: 90,
        percentile: 45,
        recommendation: "Increase social media presence and influencer partnerships",
      },
      {
        metric: "Repeat Attendance",
        yourValue: 42,
        industryAverage: 55,
        topPerformer: 75,
        percentile: 35,
        recommendation: "Launch loyalty program and early bird discounts for returning attendees",
      },
    ];
  };

  const generateMockComparisons = (): CompetitorData[] => {
    return [
      { category: "Capacity Utilization", yourEvent: 75, competitor1: 82, competitor2: 68, industryAvg: 72 },
      { category: "Avg Ticket Price", yourEvent: 85, competitor1: 95, competitor2: 70, industryAvg: 80 },
      { category: "Marketing ROI", yourEvent: 3.2, competitor1: 4.1, competitor2: 2.8, industryAvg: 3.5 },
      { category: "Net Promoter Score", yourEvent: 65, competitor1: 72, competitor2: 58, industryAvg: 63 },
      { category: "Customer Acquisition Cost", yourEvent: 12, competitor1: 15, competitor2: 10, industryAvg: 13 },
    ];
  };

  const generateMockBestPractices = (): BestPractice[] => {
    return [
      {
        id: "bp-1",
        title: "Early Bird Pricing Strategy",
        description:
          "Offer tiered pricing with significant discounts for early purchasers to accelerate sales momentum",
        impact: "high",
        implemented: false,
        estimatedImprovement: "+15% early sales",
      },
      {
        id: "bp-2",
        title: "Influencer Partnership Program",
        description: "Partner with 5-10 micro-influencers in your niche for authentic promotion",
        impact: "high",
        implemented: false,
        estimatedImprovement: "+25% reach",
      },
      {
        id: "bp-3",
        title: "Post-Event Survey with Incentive",
        description: "Send surveys within 24 hours with 10% discount code for next event",
        impact: "medium",
        implemented: true,
        estimatedImprovement: "+20% feedback rate",
      },
      {
        id: "bp-4",
        title: "VIP Experience Upsell",
        description: "Create exclusive VIP packages with meet-and-greet, premium seating, and merchandise",
        impact: "high",
        implemented: false,
        estimatedImprovement: "+$50 per attendee",
      },
      {
        id: "bp-5",
        title: "Social Media Contest",
        description: "Run weekly contests leading up to event with free ticket giveaways",
        impact: "medium",
        implemented: true,
        estimatedImprovement: "+35% engagement",
      },
      {
        id: "bp-6",
        title: "Email Drip Campaign",
        description: "Automated 6-email sequence from registration to post-event follow-up",
        impact: "medium",
        implemented: false,
        estimatedImprovement: "+12% conversions",
      },
    ];
  };

  const exportReport = () => {
    const report = {
      category: selectedCategory,
      benchmarks,
      comparisons,
      bestPractices: bestPractices.filter((bp) => !bp.implemented),
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `benchmarking-report-${selectedCategory}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Benchmarking report exported");
  };

  const radarData = benchmarks.slice(0, 5).map((b) => ({
    metric: b.metric.split(" ").slice(0, 2).join(" "),
    yourScore: (b.yourValue / b.topPerformer) * 100,
    avgScore: (b.industryAverage / b.topPerformer) * 100,
  }));

  const implementedCount = bestPractices.filter((bp) => bp.implemented).length;
  const implementationRate = (implementedCount / bestPractices.length) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold">Competitive Benchmarking</CardTitle>
              <CardDescription>Compare your performance against industry standards and competitors</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="music">Music Events</SelectItem>
                  <SelectItem value="sports">Sports Events</SelectItem>
                  <SelectItem value="tech">Tech Conferences</SelectItem>
                  <SelectItem value="arts">Arts & Culture</SelectItem>
                  <SelectItem value="food">Food Festivals</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={exportReport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="h-[600px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Percentile</CardTitle>
                  <Award className="h-4 w-4 text-[#08CB00]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#08CB00" }}>
                  {Math.round(benchmarks.reduce((sum, b) => sum + b.percentile, 0) / benchmarks.length)}th
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Above {Math.round(benchmarks.reduce((sum, b) => sum + b.percentile, 0) / benchmarks.length)}% of
                  events
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Best Practices</CardTitle>
                  <Lightbulb className="h-4 w-4 text-[#FFA500]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {implementedCount}/{bestPractices.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {implementationRate.toFixed(0)}% implementation rate
                </div>
                <Progress value={implementationRate} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Improvement Areas</CardTitle>
                  <Target className="h-4 w-4 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  {benchmarks.filter((b) => b.yourValue < b.industryAverage).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Metrics below industry average</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="recommendations">Best Practices</TabsTrigger>
            </TabsList>

            {/* Performance Radar */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Performance Radar</CardTitle>
                    <CardDescription>Multi-dimensional performance vs industry benchmark</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(238, 238, 238, 0.2)" />
                        <PolarAngleAxis dataKey="metric" stroke="#EEEEEE" style={{ fontSize: "12px" }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#EEEEEE" />
                        <Radar
                          name="Your Event"
                          dataKey="yourScore"
                          stroke="#08CB00"
                          fill="#08CB00"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Industry Avg"
                          dataKey="avgScore"
                          stroke="#253900"
                          fill="#253900"
                          fillOpacity={0.1}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Detailed Metrics</CardTitle>
                    <CardDescription>Performance breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {benchmarks.map((benchmark, i) => {
                      const aboveAvg = benchmark.yourValue >= benchmark.industryAverage;
                      const Icon = aboveAvg ? TrendingUp : TrendingDown;
                      const color = aboveAvg ? "#08CB00" : "#FF4444";

                      return (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" style={{ color }} />
                              <span className="text-sm font-medium">{benchmark.metric}</span>
                            </div>
                            <Badge
                              variant="outline"
                              style={aboveAvg ? { color: "#08CB00", borderColor: "#08CB00" } : {}}
                            >
                              {benchmark.percentile}th percentile
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <div className="text-muted-foreground">Your Value</div>
                              <div className="font-semibold" style={{ color }}>
                                {benchmark.yourValue}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Industry Avg</div>
                              <div className="font-semibold">{benchmark.industryAverage}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Top 10%</div>
                              <div className="font-semibold" style={{ color: "#08CB00" }}>
                                {benchmark.topPerformer}
                              </div>
                            </div>
                          </div>
                          <Progress value={(benchmark.yourValue / benchmark.topPerformer) * 100} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Competitive Comparison */}
            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Competitive Analysis</CardTitle>
                  <CardDescription>Anonymous comparison with similar events in your category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={comparisons}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 238, 238, 0.1)" />
                      <XAxis dataKey="category" stroke="#EEEEEE" style={{ fontSize: "12px" }} />
                      <YAxis stroke="#EEEEEE" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="yourEvent" fill="#08CB00" name="Your Event" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="competitor1" fill="#253900" name="Competitor A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="competitor2" fill="#FFA500" name="Competitor B" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="industryAvg"
                        fill="rgba(238, 238, 238, 0.3)"
                        name="Industry Avg"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Your Ranking</div>
                      <p className="text-2xl font-bold">#2</p>
                      <p className="text-xs text-muted-foreground mt-1">of 4 analyzed</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Strengths</div>
                      <p className="text-2xl font-bold" style={{ color: "#08CB00" }}>
                        3
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">areas leading</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Opportunities</div>
                      <p className="text-2xl font-bold" style={{ color: "#FFA500" }}>
                        2
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">areas to improve</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Market Share</div>
                      <p className="text-2xl font-bold">28%</p>
                      <p className="text-xs text-muted-foreground mt-1">of analyzed market</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Best Practices */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    <Lightbulb className="inline h-5 w-5 mr-2 text-[#FFA500]" />
                    Best Practice Recommendations
                  </CardTitle>
                  <CardDescription>Proven strategies from top-performing events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bestPractices.map((practice) => {
                      const impactColors = {
                        high: { bg: "#08CB00", text: "#08CB00" },
                        medium: { bg: "#FFA500", text: "#FFA500" },
                        low: { bg: "#9333EA", text: "#9333EA" },
                      };
                      const colors = impactColors[practice.impact];

                      return (
                        <div
                          key={practice.id}
                          className={`rounded-lg border-2 p-4 transition-all ${
                            practice.implemented
                              ? "border-[#08CB00]/50 bg-[#08CB00]/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{practice.title}</h4>
                                <Badge variant="outline" style={{ color: colors.text, borderColor: colors.text }}>
                                  {practice.impact} impact
                                </Badge>
                                {practice.implemented && (
                                  <Badge variant="outline" style={{ color: "#08CB00", borderColor: "#08CB00" }}>
                                    ✓ Implemented
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{practice.description}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <Target className="h-4 w-4 text-[#08CB00]" />
                                <span className="font-medium">Expected improvement:</span>
                                <span style={{ color: "#08CB00" }}>{practice.estimatedImprovement}</span>
                              </div>
                            </div>
                            {!practice.implemented && (
                              <Button size="sm" variant="outline">
                                Learn More
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
