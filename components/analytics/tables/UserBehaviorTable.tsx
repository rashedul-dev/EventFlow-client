"use client";

import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  MousePointer,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface UserBehavior {
  userId: string;
  userName: string;
  email: string;
  sessionDuration: number; // minutes
  pageViews: number;
  eventsViewed: number;
  ticketsPurchased: number;
  cartAbandonment: number; // count
  conversionRate: number; // percentage
  lifetimeValue: number; // dollars
  churnRisk: "low" | "medium" | "high";
  lastActive: string;
  actionFrequency: number; // actions per session
}

interface UserBehaviorTableProps {
  apiEndpoint?: string;
  className?: string;
}

export const UserBehaviorTable = ({
  apiEndpoint = "/api/analytics/user-behavior",
  className = "",
}: UserBehaviorTableProps) => {
  const [data, setData] = useState<UserBehavior[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [churnFilter, setChurnFilter] = useState("all");
  const [maskSensitive, setMaskSensitive] = useState(true);

  useEffect(() => {
    fetchUserBehavior();
  }, []);

  const fetchUserBehavior = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user behavior data");

      const result = await response.json();

      // Transform API data
      const users =
        result.data?.map((item: any) => ({
          userId: item.id || item.userId,
          userName: item.name || item.userName || "Unknown User",
          email: item.email || "user@example.com",
          sessionDuration: item.avgSessionDuration || item.sessionDuration || 0,
          pageViews: item.pageViews || item.totalPageViews || 0,
          eventsViewed: item.eventsViewed || item.eventPageViews || 0,
          ticketsPurchased: item.ticketsPurchased || item.totalTickets || 0,
          cartAbandonment: item.cartAbandonment || item.abandonedCarts || 0,
          conversionRate: item.conversionRate || 0,
          lifetimeValue: item.ltv || item.lifetimeValue || 0,
          churnRisk: item.churnRisk || calculateChurnRisk(item),
          lastActive: item.lastActive || item.lastSeen || new Date().toISOString(),
          actionFrequency: item.actionFrequency || 0,
        })) || generateMockData(100);

      setData(users);
    } catch (error) {
      console.error("User behavior fetch error:", error);
      setData(generateMockData(100));
      toast.error("Using sample data - API connection pending");
    } finally {
      setLoading(false);
    }
  };

  const calculateChurnRisk = (user: any): "low" | "medium" | "high" => {
    const daysSinceActive = user.lastActive
      ? Math.floor((Date.now() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceActive > 30 || (user.conversionRate || 0) < 5) return "high";
    if (daysSinceActive > 14 || (user.conversionRate || 0) < 15) return "medium";
    return "low";
  };

  const generateMockData = (count: number): UserBehavior[] => {
    const churnRisks: ("low" | "medium" | "high")[] = ["low", "medium", "high"];

    return Array.from({ length: count }, (_, i) => {
      const purchases = Math.floor(Math.random() * 20);
      const views = Math.floor(Math.random() * 100) + 10;

      return {
        userId: `USR-${10000 + i}`,
        userName: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        sessionDuration: Math.floor(Math.random() * 60) + 5,
        pageViews: views,
        eventsViewed: Math.floor(Math.random() * 30) + 1,
        ticketsPurchased: purchases,
        cartAbandonment: Math.floor(Math.random() * 5),
        conversionRate: views > 0 ? (purchases / views) * 100 : 0,
        lifetimeValue: purchases * (Math.random() * 100 + 20),
        churnRisk: churnRisks[Math.floor(Math.random() * churnRisks.length)],
        lastActive: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        actionFrequency: Math.random() * 10 + 1,
      };
    });
  };

  const maskEmail = (email: string) => {
    if (!maskSensitive) return email;
    const [user, domain] = email.split("@");
    return `${user.substring(0, 2)}***@${domain}`;
  };

  const columns = useMemo<ColumnDef<UserBehavior>[]>(
    () => [
      {
        accessorKey: "userId",
        header: "User ID",
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("userId")}</span>,
      },
      {
        accessorKey: "userName",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-sm">{row.getValue("userName")}</div>
            <div className="text-xs text-muted-foreground">{maskEmail(row.original.email)}</div>
          </div>
        ),
      },
      {
        accessorKey: "sessionDuration",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0"
          >
            Avg Session
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{row.getValue<number>("sessionDuration")} min</span>
          </div>
        ),
      },
      {
        accessorKey: "pageViews",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0"
          >
            Page Views
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <MousePointer className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{row.getValue<number>("pageViews")}</span>
          </div>
        ),
      },
      {
        accessorKey: "eventsViewed",
        header: "Events Viewed",
        cell: ({ row }) => <span className="text-sm">{row.getValue<number>("eventsViewed")}</span>,
      },
      {
        accessorKey: "ticketsPurchased",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0"
          >
            Purchases
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3 text-[#08CB00]" />
            <span className="text-sm font-medium">{row.getValue<number>("ticketsPurchased")}</span>
          </div>
        ),
      },
      {
        accessorKey: "cartAbandonment",
        header: "Cart Abandoned",
        cell: ({ row }) => {
          const count = row.getValue<number>("cartAbandonment");
          return (
            <div className="flex items-center gap-1">
              {count > 0 && <AlertTriangle className="h-3 w-3 text-[#FFA500]" />}
              <span className="text-sm">{count}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "conversionRate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0"
          >
            Conversion
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const rate = row.getValue<number>("conversionRate");
          const color = rate >= 15 ? "#08CB00" : rate >= 5 ? "#FFA500" : "#FF4444";
          return (
            <span className="text-sm font-medium" style={{ color }}>
              {rate.toFixed(1)}%
            </span>
          );
        },
      },
      {
        accessorKey: "lifetimeValue",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0"
          >
            LTV
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-semibold" style={{ color: "#08CB00" }}>
            $
            {row.getValue<number>("lifetimeValue").toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "churnRisk",
        header: "Churn Risk",
        cell: ({ row }) => {
          const risk = row.getValue<string>("churnRisk");
          const riskStyles = {
            low: "bg-[#08CB00]/20 text-[#08CB00] border-[#08CB00]/50",
            medium: "bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/50",
            high: "bg-destructive/20 text-destructive border-destructive/50",
          };
          return (
            <Badge variant="outline" className={riskStyles[risk as keyof typeof riskStyles]}>
              {risk}
            </Badge>
          );
        },
      },
      {
        accessorKey: "actionFrequency",
        header: "Activity Score",
        cell: ({ row }) => {
          const score = row.getValue<number>("actionFrequency");
          return (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.min((score / 10) * 100, 100)}%`,
                    backgroundColor: "#08CB00",
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{score.toFixed(1)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "lastActive",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0"
          >
            Last Active
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("lastActive"));
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div className="text-sm">
              <div>{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
              <div className="text-xs text-muted-foreground">{diffDays === 0 ? "Today" : `${diffDays}d ago`}</div>
            </div>
          );
        },
      },
    ],
    [maskSensitive]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const exportToCSV = () => {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Session Duration",
      "Page Views",
      "Events Viewed",
      "Tickets Purchased",
      "Cart Abandonment",
      "Conversion Rate",
      "Lifetime Value",
      "Churn Risk",
      "Last Active",
    ];

    const rows = data.map((row) =>
      [
        row.userId,
        row.userName,
        maskSensitive ? maskEmail(row.email) : row.email,
        row.sessionDuration,
        row.pageViews,
        row.eventsViewed,
        row.ticketsPurchased,
        row.cartAbandonment,
        row.conversionRate,
        row.lifetimeValue,
        row.churnRisk,
        row.lastActive,
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `user-behavior-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("User behavior data exported to CSV");
  };

  const filteredData = useMemo(() => {
    if (churnFilter === "all") return data;
    return data.filter((user) => user.churnRisk === churnFilter);
  }, [data, churnFilter]);

  // Calculate aggregates
  const avgLTV = data.reduce((sum, user) => sum + user.lifetimeValue, 0) / data.length;
  const highRiskCount = data.filter((user) => user.churnRisk === "high").length;
  const avgConversion = data.reduce((sum, user) => sum + user.conversionRate, 0) / data.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">User Behavior Analytics</CardTitle>
            <CardDescription>Session tracking, conversion metrics, and churn risk analysis</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMaskSensitive(!maskSensitive)}
              title={maskSensitive ? "Show Sensitive Data" : "Hide Sensitive Data"}
            >
              {maskSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm" disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4 text-[#08CB00]" />
              <span>Avg LTV</span>
            </div>
            <p className="text-2xl font-bold text-[#08CB00]">
              ${avgLTV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span>High Churn Risk</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{highRiskCount} users</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <ShoppingCart className="h-4 w-4 text-[#08CB00]" />
              <span>Avg Conversion</span>
            </div>
            <p className="text-2xl font-bold text-[#08CB00]">{avgConversion.toFixed(1)}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={churnFilter} onValueChange={setChurnFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Risk Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} of {data.length} users
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="bg-muted/50">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="hover:bg-muted/50">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
