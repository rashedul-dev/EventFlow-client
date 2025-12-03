"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useState } from "react";

interface RevenueAnalyticsProps {
  timeRange?: "7d" | "30d" | "90d" | "1y";
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function RevenueAnalytics({ timeRange = "30d" }: RevenueAnalyticsProps) {
  const [selectedRange, setSelectedRange] = useState(timeRange);

  // Mock data - replace with actual API data
  const revenueOverTime = [
    { date: "Jan", revenue: 12500, commission: 625, payout: 11875 },
    { date: "Feb", revenue: 18200, commission: 910, payout: 17290 },
    { date: "Mar", revenue: 22300, commission: 1115, payout: 21185 },
    { date: "Apr", revenue: 28400, commission: 1420, payout: 26980 },
    { date: "May", revenue: 32100, commission: 1605, payout: 30495 },
    { date: "Jun", revenue: 35800, commission: 1790, payout: 34010 },
  ];

  const categoryRevenue = [
    { name: "Music", value: 45000, percentage: 35 },
    { name: "Conference", value: 38000, percentage: 30 },
    { name: "Sports", value: 25000, percentage: 20 },
    { name: "Festival", value: 19000, percentage: 15 },
  ];

  const topOrganizers = [
    { name: "John Events Co.", revenue: 28500, events: 12, commission: 1425 },
    { name: "TechEvents Inc.", revenue: 24200, events: 8, commission: 1210 },
    { name: "Music Makers", revenue: 21800, events: 15, commission: 1090 },
    { name: "Sports Arena", revenue: 18600, events: 6, commission: 930 },
    { name: "Festival Pro", revenue: 16400, events: 9, commission: 820 },
  ];

  const stats = {
    totalRevenue: 284750,
    growth: 15.2,
    platformCommission: 14238,
    organizerPayout: 270512,
    avgTransactionValue: 125.5,
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-muted-foreground">Platform revenue and commission tracking</p>
        </div>
        <Select value={selectedRange} onValueChange={(value: any) => setSelectedRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalRevenue / 1000).toFixed(1)}K</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+{stats.growth}%</span>
              <span className="text-xs text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.platformCommission / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground mt-2">5% average commission rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Organizer Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.organizerPayout / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground mt-2">Paid to event organizers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgTransactionValue}</div>
            <p className="text-xs text-muted-foreground mt-2">Per ticket purchase</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Total revenue, commission, and payouts over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Total Revenue" />
              <Line type="monotone" dataKey="commission" stroke="#82ca9d" strokeWidth={2} name="Commission" />
              <Line type="monotone" dataKey="payout" stroke="#ffc658" strokeWidth={2} name="Payout" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown and Top Organizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Distribution across event categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryRevenue.map((cat, index) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium">${(cat.value / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Organizers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Organizers</CardTitle>
            <CardDescription>Highest revenue generating organizers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOrganizers.map((org, index) => (
                <div key={org.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{org.name}</p>
                      <p className="text-xs text-muted-foreground">{org.events} events</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${(org.revenue / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground">${org.commission} commission</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Commission Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown</CardTitle>
          <CardDescription>Platform commission by month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="commission" fill="#82ca9d" name="Platform Commission" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
