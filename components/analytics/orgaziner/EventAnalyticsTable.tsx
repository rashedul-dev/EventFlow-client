"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, DollarSign, Ticket, MapPin, Share2, Target } from "lucide-react";
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

interface EventInsights {
  eventId: string;
  eventName: string;
  ticketsSold: number;
  totalCapacity: number;
  revenue: number;
  averageTicketPrice: number;
  demographics: {
    ageGroups: { range: string; count: number; percentage: number }[];
    genderDistribution: { gender: string; count: number; percentage: number }[];
  };
  geography: {
    city: string;
    state: string;
    count: number;
    percentage: number;
  }[];
  referrals: {
    source: string;
    count: number;
    percentage: number;
  }[];
  roi: {
    costs: number;
    revenue: number;
    profit: number;
    roiPercentage: number;
  };
  salesTrend: {
    date: string;
    sold: number;
    revenue: number;
  }[];
}

interface Props {
  eventId: string;
}

const COLORS = {
  primary: "#08CB00",
  secondary: "#253900",
  tertiary: "#FFA500",
  muted: "#6B7280",
};

export const EventInsightsDashboard = ({ eventId }: Props) => {
  const [insights, setInsights] = useState<EventInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
    // Real-time updates every 30 seconds
    const interval = setInterval(fetchInsights, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/analytics/organizer/events/${eventId}/insights`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch insights");

      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !insights) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error || "No data available"}</p>
        </CardContent>
      </Card>
    );
  }

  const capacityPercentage = (insights.ticketsSold / insights.totalCapacity) * 100;
  const profitMargin = insights.roi.revenue > 0 ? (insights.roi.profit / insights.roi.revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4" style={{ color: COLORS.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.ticketsSold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{capacityPercentage.toFixed(1)}% of capacity</p>
            <div className="mt-2 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(capacityPercentage, 100)}%`,
                  backgroundColor: COLORS.primary,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: COLORS.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${insights.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Avg: ${insights.averageTicketPrice.toFixed(2)} per ticket</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <Target
              className="h-4 w-4"
              style={{ color: insights.roi.roiPercentage >= 0 ? COLORS.primary : "#EF4444" }}
            />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {insights.roi.roiPercentage >= 0 ? "+" : ""}
                {insights.roi.roiPercentage.toFixed(1)}%
              </div>
              {insights.roi.roiPercentage >= 0 ? (
                <TrendingUp className="h-4 w-4" style={{ color: COLORS.primary }} />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Profit: ${insights.roi.profit.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: COLORS.secondary }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Costs: ${insights.roi.costs.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Demographics & Geography */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Attendee Demographics
            </CardTitle>
            <CardDescription>Age distribution of ticket buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={insights.demographics.ageGroups}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill={COLORS.primary}
                  dataKey="count"
                >
                  {insights.demographics.ageGroups.map((entry, index) => (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Top locations of attendees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.geography.slice(0, 5).map((location, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {location.city}, {location.state}
                    </span>
                    <span className="text-muted-foreground">{location.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${location.percentage}%`,
                        backgroundColor: COLORS.primary,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{location.count.toLocaleString()} attendees</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals & Sales Trend */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Where your attendees found you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.referrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.muted][index % 4],
                      }}
                    >
                      {referral.source}
                    </Badge>
                    <span className="text-sm font-medium">{referral.count.toLocaleString()}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{referral.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Ticket sales over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={insights.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="sold" fill={COLORS.primary} name="Tickets Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
