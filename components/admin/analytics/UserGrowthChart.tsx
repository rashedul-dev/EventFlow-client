"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, UserPlus, TrendingUp, Target } from "lucide-react";
import { useState } from "react";

interface UserGrowthChartProps {
  timeRange?: "7d" | "30d" | "90d" | "1y";
}

export function UserGrowthChart({ timeRange = "30d" }: UserGrowthChartProps) {
  const [selectedRange, setSelectedRange] = useState(timeRange);

  // Mock data
  const userGrowth = [
    { date: "Jan", total: 8500, new: 1200, active: 3400, churned: 200 },
    { date: "Feb", total: 9650, new: 1350, active: 3800, churned: 200 },
    { date: "Mar", total: 10900, new: 1450, active: 4200, churned: 200 },
    { date: "Apr", total: 12400, new: 1700, active: 4800, churned: 200 },
    { date: "May", total: 13900, new: 1750, active: 5200, churned: 250 },
    { date: "Jun", total: 15500, new: 1850, active: 5800, churned: 250 },
  ];

  const userByRole = [
    { role: "Attendee", count: 12000, percentage: 77 },
    { role: "Organizer", count: 2500, percentage: 16 },
    { role: "Admin", count: 800, percentage: 5 },
    { role: "Moderator", count: 200, percentage: 2 },
  ];

  const retentionData = [
    { month: "Month 1", retention: 100 },
    { month: "Month 2", retention: 85 },
    { month: "Month 3", retention: 72 },
    { month: "Month 4", retention: 65 },
    { month: "Month 5", retention: 60 },
    { month: "Month 6", retention: 58 },
  ];

  const geographicData = [
    { country: "United States", users: 6200, percentage: 40 },
    { country: "United Kingdom", users: 3100, percentage: 20 },
    { country: "Canada", users: 2325, percentage: 15 },
    { country: "Germany", users: 1860, percentage: 12 },
    { country: "Others", users: 2015, percentage: 13 },
  ];

  const stats = {
    totalUsers: 15500,
    newUsers: 1850,
    activeUsers: 5800,
    growthRate: 12.5,
    retentionRate: 58,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Growth Analytics</h2>
          <p className="text-muted-foreground">User acquisition, retention, and engagement metrics</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+{stats.growthRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.growthRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">Month over month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retentionRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">6-month cohort</p>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Trend */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
          <CardDescription>Total users and new registrations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total Users"
              />
              <Area
                type="monotone"
                dataKey="new"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorNew)"
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Distribution and Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution by Role */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
            <CardDescription>Breakdown of users by role type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userByRole.map((role) => (
                <div key={role.role} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{role.role}</span>
                    <span className="text-muted-foreground">
                      {role.count.toLocaleString()} ({role.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${role.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Retention Cohort */}
        <Card>
          <CardHeader>
            <CardTitle>User Retention Cohort</CardTitle>
            <CardDescription>User retention over 6-month period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="retention" stroke="#8884d8" strokeWidth={2} name="Retention %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Users by country</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={geographicData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="country" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#8884d8" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity & Engagement</CardTitle>
          <CardDescription>Active users vs churned users</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="active" fill="#82ca9d" name="Active Users" />
              <Bar dataKey="churned" fill="#ff8042" name="Churned Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
