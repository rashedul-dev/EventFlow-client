"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  LogIn,
  LogOut,
  Calendar as CalendarIcon,
  Mail,
  UserCheck,
  CreditCard,
  Edit,
  Trash2,
  Download,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  id: string;
  action: string;
  type: "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "PAYMENT" | "EMAIL";
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

interface UserActivityLogProps {
  userId: string;
}

export function UserActivityLog({ userId }: UserActivityLogProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: "1",
      action: "User Login",
      type: "LOGIN",
      description: "Successfully logged in",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    },
    {
      id: "2",
      action: "Profile Updated",
      type: "UPDATE",
      description: "Updated personal information",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    },
    {
      id: "3",
      action: "Event Created",
      type: "CREATE",
      description: "Created new event 'Summer Music Festival'",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    },
    {
      id: "4",
      action: "Payment Processed",
      type: "PAYMENT",
      description: "Ticket purchase for $150.00",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      metadata: { amount: 150, currency: "USD" },
    },
    {
      id: "5",
      action: "Email Sent",
      type: "EMAIL",
      description: "Verification email sent",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: "System",
      userAgent: "System",
    },
  ]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const getIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "LOGIN":
        return <LogIn className="w-4 h-4" />;
      case "LOGOUT":
        return <LogOut className="w-4 h-4" />;
      case "CREATE":
        return <CalendarIcon className="w-4 h-4" />;
      case "UPDATE":
        return <Edit className="w-4 h-4" />;
      case "DELETE":
        return <Trash2 className="w-4 h-4" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4" />;
      case "EMAIL":
        return <Mail className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: ActivityLog["type"]) => {
    switch (type) {
      case "LOGIN":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "LOGOUT":
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
      case "CREATE":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "UPDATE":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      case "DELETE":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "PAYMENT":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      case "EMAIL":
        return "bg-cyan-500/10 text-cyan-700 border-cyan-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleExport = () => {
    const csv = [
      ["Timestamp", "Action", "Type", "Description", "IP Address"],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.type,
        log.description,
        log.ipAddress,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${userId}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="PAYMENT">Payment</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Export</label>
              <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>{filteredLogs.length} activities found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <div key={log.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn("w-10 h-10 rounded-full flex items-center justify-center", getTypeColor(log.type))}
                  >
                    {getIcon(log.type)}
                  </div>
                  {index < filteredLogs.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{log.action}</h4>
                        <Badge variant="outline" className={getTypeColor(log.type)}>
                          {log.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>IP: {log.ipAddress}</span>
                      </div>
                      {log.metadata && (
                        <div className="mt-2 p-2 rounded bg-muted text-xs font-mono">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No activity logs found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
