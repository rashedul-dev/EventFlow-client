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
import { Calendar, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { useState } from "react";

interface EventMetricsProps {
  timeRange?: "7d" | "30d" | "90d" | "1y";
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B9D"];

export function EventMetrics({ timeRange = "30d" }: EventMetricsProps) {
  const [selectedRange, setSelectedRange] = useState(timeRange);

  // Mock data
  const eventTrends = [
    { month: "Jan", created: 45, published: 42, completed: 38, cancelled: 4 },
    { month: "Feb", created: 52, published: 48, completed: 44, cancelled: 4 },
    { month: "Mar", created: 58, published: 54, completed: 50, cancelled: 4 },
    { month: "Apr", created: 65, published: 60, completed: 55, cancelled: 5 },
    { month: "May", created: 72, published: 68, completed: 62, cancelled: 6 },
    { month: "Jun", created: 78, published: 75, completed: 68, cancelled: 7 },
  ];

  const categoryPerformance = [
    { category: "Music", events: 145, tickets: 52000, revenue: 780000 },
    { category: "Conference", events: 98, tickets: 28000, revenue: 560000 },
    { category: "Sports", events: 67, tickets: 34000, revenue: 425000 },
    { category: "Festival", events: 54, tickets: 41000, revenue: 615000 },
    { category: "Workshop", events: 89, tickets: 12000, revenue: 180000 },
  ];

  const categoryDistribution = [
    { name: "Music", value: 145, percentage: 32 },
    { name: "Conference", value: 98, percentage: 22 },
    { name: "Sports", value: 67, percentage: 15 },
    { name: "Festival", value: 54, percentage: 12 },
    { name: "Workshop", value: 89, percentage: 19 },
  ];

  const capacityUtilization = [
    { month: "Jan", avgUtilization: 72, avgCapacity: 850 },
    { month: "Feb", avgUtilization: 75, avgCapacity: 920 },
    { month: "Mar", avgUtilization: 78, avgCapacity: 1050 },
    { month: "Apr", avgUtilization: 82, avgCapacity: 1180 },
    { month: "May", avgUtilization: 85, avgCapacity: 1250 },
    { month: "Jun", avgUtilization: 88, avgCapacity: 1320 },
  ];

  const popularVenues = [
    { name: "Central Park NY", events: 28, avgAttendance: 2400 },
    { name: "Convention Center SF", events: 24, avgAttendance: 1800 },
    { name: "Sports Arena LA", events: 18, avgAttendance: 3200 },
    { name: "Music Hall Chicago", events: 22, avgAttendance: 1500 },
    { name: "Festival Grounds Austin", events: 15, avgAttendance: 2800 },
  ];

  const stats = {
    totalEvents: 453,
    activeEvents: 127,
    completedEvents: 298,
    avgTicketsSold: 850,
    capacityUtilization: 88,
    successRate: 94,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Performance Metrics</h2>
          <p className="text-muted-foreground">Event analytics, capacity utilization, and trends</p>
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground mt-2">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedEvents}</div>
            <p className="text-xs text-muted-foreground mt-2">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTicketsSold}</div>
            <p className="text-xs text-muted-foreground mt-2">Per event</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capacity Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.capacityUtilization}%</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+6%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Event Creation & Completion Trends</CardTitle>
          <CardDescription>Events created, published, completed, and cancelled over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={eventTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#8884d8" strokeWidth={2} name="Created" />
              <Line type="monotone" dataKey="published" stroke="#82ca9d" strokeWidth={2} name="Published" />
              <Line type="monotone" dataKey="completed" stroke="#ffc658" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="cancelled" stroke="#ff8042" strokeWidth={2} name="Cancelled" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>Events, tickets sold, and revenue by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryPerformance.map((cat, index) => (
              <div key={cat.category} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{cat.category}</h4>
                  <Badge variant="outline">{cat.events} events</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tickets Sold:</span>
                    <span className="ml-2 font-medium">{cat.tickets.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="ml-2 font-medium">${(cat.revenue / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution and Capacity Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Category Distribution</CardTitle>
            <CardDescription>Breakdown of events by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} (${entry.percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Capacity Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Capacity Utilization Trend</CardTitle>
            <CardDescription>Average capacity usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={capacityUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgUtilization"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Utilization %"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgCapacity"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Avg Capacity"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Venues */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Venues</CardTitle>
          <CardDescription>Top venues by event count and attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularVenues} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={180} />
              <Tooltip />
              <Legend />
              <Bar dataKey="events" fill="#8884d8" name="Events" />
              <Bar dataKey="avgAttendance" fill="#82ca9d" name="Avg Attendance" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
