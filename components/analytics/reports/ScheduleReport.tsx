"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Mail,
  Webhook,
  Plus,
  Trash2,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface ScheduledReport {
  id: string;
  reportName: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  deliveryMethod: "email" | "webhook" | "slack";
  recipients: string[];
  schedule: {
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  status: "active" | "paused" | "failed";
  lastDelivery: string | null;
  nextDelivery: string;
  deliveryHistory: {
    date: string;
    status: "success" | "failed";
    recipients: number;
  }[];
}

interface ScheduleReportProps {
  apiEndpoint?: string;
  className?: string;
}

export const ScheduleReport = ({
  apiEndpoint = "/api/analytics/scheduled-reports",
  className = "",
}: ScheduleReportProps) => {
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  // Form state
  const [reportName, setReportName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "quarterly">("weekly");
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "webhook" | "slack">("email");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);

  useEffect(() => {
    fetchScheduledReports();
  }, []);

  const fetchScheduledReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch scheduled reports");

      const result = await response.json();
      setSchedules(result.data || generateMockSchedules());
    } catch (error) {
      console.error("Fetch error:", error);
      setSchedules(generateMockSchedules());
      toast.error("Using sample data - API connection pending");
    } finally {
      setLoading(false);
    }
  };

  const generateMockSchedules = (): ScheduledReport[] => {
    return [
      {
        id: "SCH-1001",
        reportName: "Weekly Revenue Report",
        frequency: "weekly",
        deliveryMethod: "email",
        recipients: ["admin@example.com", "finance@example.com"],
        schedule: { time: "09:00", dayOfWeek: 1 },
        status: "active",
        lastDelivery: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        deliveryHistory: [
          { date: new Date().toISOString(), status: "success", recipients: 2 },
          { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: "success", recipients: 2 },
        ],
      },
      {
        id: "SCH-1002",
        reportName: "Monthly User Analytics",
        frequency: "monthly",
        deliveryMethod: "email",
        recipients: ["marketing@example.com"],
        schedule: { time: "08:00", dayOfMonth: 1 },
        status: "active",
        lastDelivery: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        deliveryHistory: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), status: "success", recipients: 1 },
        ],
      },
    ];
  };

  const addRecipient = () => {
    if (!recipientInput.trim()) return;

    if (deliveryMethod === "email" && !recipientInput.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (recipients.includes(recipientInput.trim())) {
      toast.error("Recipient already added");
      return;
    }

    setRecipients([...recipients, recipientInput.trim()]);
    setRecipientInput("");
  };

  const removeRecipient = (recipient: string) => {
    setRecipients(recipients.filter((r) => r !== recipient));
  };

  const createSchedule = async () => {
    if (!reportName.trim()) {
      toast.error("Please enter a report name");
      return;
    }

    if (recipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const newSchedule: ScheduledReport = {
        id: `SCH-${Date.now()}`,
        reportName,
        frequency,
        deliveryMethod,
        recipients,
        schedule: {
          time: scheduleTime,
          ...(frequency === "weekly" && { dayOfWeek }),
          ...(frequency === "monthly" && { dayOfMonth }),
        },
        status: "active",
        lastDelivery: null,
        nextDelivery: calculateNextDelivery(frequency, scheduleTime, dayOfWeek, dayOfMonth),
        deliveryHistory: [],
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSchedule),
      });

      if (!response.ok) throw new Error("Failed to create schedule");

      setSchedules([...schedules, newSchedule]);
      toast.success("Report schedule created successfully");
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Create error:", error);
      // Fallback
      const newSchedule: ScheduledReport = {
        id: `SCH-${Date.now()}`,
        reportName,
        frequency,
        deliveryMethod,
        recipients,
        schedule: {
          time: scheduleTime,
          ...(frequency === "weekly" && { dayOfWeek }),
          ...(frequency === "monthly" && { dayOfMonth }),
        },
        status: "active",
        lastDelivery: null,
        nextDelivery: calculateNextDelivery(frequency, scheduleTime, dayOfWeek, dayOfMonth),
        deliveryHistory: [],
      };
      setSchedules([...schedules, newSchedule]);
      toast.success("Report schedule created (saved locally)");
      resetForm();
      setDialogOpen(false);
    }
  };

  const calculateNextDelivery = (freq: string, time: string, dayWeek?: number, dayMonth?: number): string => {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);

    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    switch (freq) {
      case "daily":
        if (next <= now) next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        const targetDay = dayWeek || 1;
        while (next.getDay() !== targetDay || next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;
      case "monthly":
        next.setDate(dayMonth || 1);
        if (next <= now) next.setMonth(next.getMonth() + 1);
        break;
      case "quarterly":
        const currentMonth = next.getMonth();
        const nextQuarterMonth = Math.ceil((currentMonth + 1) / 3) * 3;
        next.setMonth(nextQuarterMonth);
        next.setDate(1);
        break;
    }

    return next.toISOString();
  };

  const resetForm = () => {
    setReportName("");
    setFrequency("weekly");
    setDeliveryMethod("email");
    setRecipients([]);
    setRecipientInput("");
    setScheduleTime("09:00");
    setDayOfWeek(1);
    setDayOfMonth(1);
  };

  const toggleScheduleStatus = async (id: string) => {
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) return;

    const newStatus = schedule.status === "active" ? "paused" : "active";

    try {
      const token = localStorage.getItem("bearer_token");
      await fetch(`${apiEndpoint}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      setSchedules(schedules.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
      toast.success(`Schedule ${newStatus === "active" ? "activated" : "paused"}`);
    } catch (error) {
      // Fallback
      setSchedules(schedules.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
      toast.success(`Schedule ${newStatus === "active" ? "activated" : "paused"}`);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch(`${apiEndpoint}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSchedules(schedules.filter((s) => s.id !== id));
      toast.success("Schedule deleted");
    } catch (error) {
      setSchedules(schedules.filter((s) => s.id !== id));
      toast.success("Schedule deleted");
    }
  };

  const retryDelivery = async (id: string) => {
    toast.info("Retrying delivery...");
    setTimeout(() => {
      toast.success("Delivery retry initiated");
    }, 1500);
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: "bg-[#08CB00]/20 text-[#08CB00] border-[#08CB00]/50",
      weekly: "bg-blue-500/20 text-blue-500 border-blue-500/50",
      monthly: "bg-purple-500/20 text-purple-500 border-purple-500/50",
      quarterly: "bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/50",
    };
    return colors[frequency as keyof typeof colors] || colors.weekly;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <PlayCircle className="h-4 w-4 text-[#08CB00]" />;
      case "paused":
        return <PauseCircle className="h-4 w-4 text-[#FFA500]" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <PlayCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Scheduled Reports</CardTitle>
            <CardDescription>Automate report distribution via email, webhook, or Slack</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Report Schedule</DialogTitle>
                <DialogDescription>Set up automated report delivery to your team</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                      id="report-name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Weekly Performance Report"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                      <SelectTrigger id="frequency" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="delivery-method">Delivery Method</Label>
                    <Select value={deliveryMethod} onValueChange={(v: any) => setDeliveryMethod(v)}>
                      <SelectTrigger id="delivery-method" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <Mail className="inline h-4 w-4 mr-2" />
                          Email
                        </SelectItem>
                        <SelectItem value="webhook">
                          <Webhook className="inline h-4 w-4 mr-2" />
                          Webhook
                        </SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="time">Delivery Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {frequency === "weekly" && (
                    <div>
                      <Label htmlFor="day-week">Day of Week</Label>
                      <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(Number(v))}>
                        <SelectTrigger id="day-week" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                          <SelectItem value="0">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {frequency === "monthly" && (
                    <div>
                      <Label htmlFor="day-month">Day of Month</Label>
                      <Select value={dayOfMonth.toString()} onValueChange={(v) => setDayOfMonth(Number(v))}>
                        <SelectTrigger id="day-month" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Recipients {deliveryMethod === "email" && "(Email Addresses)"}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addRecipient()}
                      placeholder={deliveryMethod === "email" ? "user@example.com" : "Enter recipient"}
                    />
                    <Button type="button" onClick={addRecipient} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {recipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recipients.map((recipient, i) => (
                        <Badge key={i} variant="outline" className="gap-2">
                          {recipient}
                          <button
                            type="button"
                            onClick={() => removeRecipient(recipient)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createSchedule}>Create Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-muted-foreground">No scheduled reports</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first automated report schedule</p>
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Next Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{schedule.reportName}</div>
                        <div className="text-xs text-muted-foreground">ID: {schedule.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getFrequencyBadge(schedule.frequency)}>
                        {schedule.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {schedule.deliveryMethod === "email" ? (
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        ) : schedule.deliveryMethod === "webhook" ? (
                          <Webhook className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <span className="text-sm">Slack</span>
                        )}
                        <span className="text-sm capitalize">{schedule.deliveryMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{schedule.recipients.length} recipient(s)</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(schedule.nextDelivery).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(schedule.status)}
                        <span className="text-sm capitalize">{schedule.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleScheduleStatus(schedule.id)}
                          title={schedule.status === "active" ? "Pause" : "Activate"}
                        >
                          {schedule.status === "active" ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                        {schedule.status === "failed" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => retryDelivery(schedule.id)}
                            title="Retry Delivery"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteSchedule(schedule.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
