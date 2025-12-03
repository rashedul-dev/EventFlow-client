"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Plus, Download, Share2, TrendingUp, Target, Layers, Mail, Edit, Trash2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { toast } from "sonner";

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: any;
  user_count: number;
  created_at: string;
  last_updated: string;
  color: string;
}

interface SegmentOverlap {
  segment1: string;
  segment2: string;
  overlap_count: number;
  overlap_percentage: number;
}

const COLORS = {
  primary: "#08CB00",
  secondary: "#253900",
  tertiary: "#FFA500",
  muted: "#6B7280",
};

const SEGMENT_CRITERIA = [
  { id: "total_spent", name: "Total Spent", type: "number" },
  { id: "events_attended", name: "Events Attended", type: "number" },
  { id: "last_activity", name: "Days Since Last Activity", type: "number" },
  { id: "signup_date", name: "Signup Date", type: "date" },
  { id: "location", name: "Location", type: "string" },
  { id: "favorite_category", name: "Favorite Event Category", type: "string" },
];

export const UserSegmentationTool = () => {
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [overlaps, setOverlaps] = useState<SegmentOverlap[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    criteria: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  useEffect(() => {
    fetchSegments();
    fetchOverlaps();
  }, []);

  const fetchSegments = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/analytics/segments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch segments");

      const data = await response.json();
      setSegments(data.segments || []);
    } catch (err) {
      toast.error("Failed to load segments");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverlaps = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/analytics/segments/overlaps", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch overlaps");

      const data = await response.json();
      setOverlaps(data.overlaps || []);
    } catch (err) {
      console.error("Failed to load segment overlaps");
    }
  };

  const createSegment = async () => {
    if (!newSegment.name.trim()) {
      toast.error("Please enter a segment name");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/analytics/segments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSegment),
      });

      if (!response.ok) throw new Error("Failed to create segment");

      const data = await response.json();
      setSegments([...segments, data.segment]);
      toast.success(`Segment created: ${data.segment.user_count} users`);
      setShowCreateDialog(false);
      setNewSegment({ name: "", description: "", criteria: {} });
    } catch (err) {
      toast.error("Failed to create segment");
    }
  };

  const deleteSegment = async (segmentId: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/analytics/segments/${segmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete segment");

      setSegments(segments.filter((s) => s.id !== segmentId));
      toast.success("Segment deleted");
    } catch (err) {
      toast.error("Failed to delete segment");
    }
  };

  const exportSegment = async (segmentId: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/analytics/segments/${segmentId}/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `segment_${segmentId}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Segment exported successfully");
    } catch (err) {
      toast.error("Failed to export segment");
    }
  };

  const toggleSegmentSelection = (segmentId: string) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentId) ? prev.filter((id) => id !== segmentId) : [...prev, segmentId]
    );
  };

  const totalUsers = segments.reduce((sum, segment) => sum + segment.user_count, 0);
  const segmentDistribution = segments.map((segment) => ({
    name: segment.name,
    value: segment.user_count,
    percentage: totalUsers > 0 ? ((segment.user_count / totalUsers) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="segments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="overlaps">Overlaps</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" style={{ color: COLORS.primary }} />
                    User Segments
                  </CardTitle>
                  <CardDescription>Create and manage user segments based on behavior and attributes</CardDescription>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} style={{ backgroundColor: COLORS.primary }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Segment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                  <p className="text-sm text-muted-foreground">Loading segments...</p>
                </div>
              ) : segments.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No segments created yet</p>
                  <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                    Create Your First Segment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {segments.map((segment) => (
                    <Card key={segment.id} className="border-l-4" style={{ borderLeftColor: segment.color }}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{segment.name}</h3>
                                <Badge variant="outline" style={{ borderColor: segment.color }}>
                                  {segment.user_count.toLocaleString()} users
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{segment.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Last updated: {new Date(segment.last_updated).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => exportSegment(segment.id)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => toast.info("Share segment feature")}>
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteSegment(segment.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => toggleSegmentSelection(segment.id)}>
                              {selectedSegments.includes(segment.id) ? "Deselect" : "Select"} for Comparison
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toast.info("Email campaign feature")}>
                              <Mail className="h-4 w-4 mr-2" />
                              Create Campaign
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" style={{ color: COLORS.primary }} />
                Segment Distribution
              </CardTitle>
              <CardDescription>Visual breakdown of your user segments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Segment Sizes</Label>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={segmentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill={COLORS.primary}
                        dataKey="value"
                      >
                        {segmentDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.muted][index % 4]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString()}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block">Segment Comparison</Label>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={segmentDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="value" fill={COLORS.primary} name="Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Segment Details</Label>
                {segments.map((segment, index) => (
                  <Card key={segment.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                            <span className="font-medium">{segment.name}</span>
                          </div>
                          <span className="text-sm font-bold">{segment.user_count.toLocaleString()}</span>
                        </div>
                        <Progress
                          value={totalUsers > 0 ? (segment.user_count / totalUsers) * 100 : 0}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {totalUsers > 0 ? ((segment.user_count / totalUsers) * 100).toFixed(1) : 0}% of total users
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overlaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" style={{ color: COLORS.primary }} />
                Segment Overlap Analysis
              </CardTitle>
              <CardDescription>Understand how your segments intersect</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSegments.length < 2 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Select at least 2 segments to analyze overlaps</p>
                  <p className="text-sm text-muted-foreground">
                    Use the "Select for Comparison" button in the Segments tab
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {overlaps
                      .filter(
                        (overlap) =>
                          selectedSegments.includes(overlap.segment1) && selectedSegments.includes(overlap.segment2)
                      )
                      .map((overlap, index) => {
                        const segment1 = segments.find((s) => s.id === overlap.segment1);
                        const segment2 = segments.find((s) => s.id === overlap.segment2);

                        return (
                          <Card key={index}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{segment1?.name}</Badge>
                                  <span className="text-muted-foreground">∩</span>
                                  <Badge variant="outline">{segment2?.name}</Badge>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted-foreground">Overlap</span>
                                    <span className="font-bold">{overlap.overlap_count.toLocaleString()}</span>
                                  </div>
                                  <Progress value={overlap.overlap_percentage} className="h-2" />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {overlap.overlap_percentage.toFixed(1)}% overlap
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>

                  <Card className="border-l-4" style={{ borderLeftColor: COLORS.primary }}>
                    <CardContent className="pt-4">
                      <div className="text-sm">
                        <p className="font-medium mb-2">Insights</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• High overlap may indicate similar user characteristics</li>
                          <li>• Low overlap suggests distinct user groups</li>
                          <li>• Use overlaps to refine segment criteria</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Segment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User Segment</DialogTitle>
            <DialogDescription>Define criteria to group users into a segment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="segment-name">Segment Name</Label>
              <Input
                id="segment-name"
                placeholder="e.g., High-Value Customers"
                value={newSegment.name}
                onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segment-description">Description</Label>
              <Input
                id="segment-description"
                placeholder="What defines this segment?"
                value={newSegment.description}
                onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Criteria (Optional - Configure in advanced editor)</Label>
              <p className="text-xs text-muted-foreground">Use the filter builder to define complex criteria</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createSegment} style={{ backgroundColor: COLORS.primary }}>
              Create Segment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
