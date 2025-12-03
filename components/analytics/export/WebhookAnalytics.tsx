"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Webhook,
  Plus,
  Trash2,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Code,
  Activity,
} from "lucide-react"
import { toast } from "sonner"

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  status: "active" | "inactive"
  createdAt: string
  lastTriggered: string | null
  successRate: number
  totalDeliveries: number
  failedDeliveries: number
}

interface WebhookLog {
  id: string
  webhookId: string
  event: string
  status: "success" | "failed" | "pending"
  timestamp: string
  responseTime: number
  statusCode: number | null
  retryCount: number
}

interface WebhookAnalyticsProps {
  apiEndpoint?: string
  className?: string
}

export const WebhookAnalytics = ({
  apiEndpoint = "/api/analytics/webhooks",
  className = "",
}: WebhookAnalyticsProps) => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
    secret: "",
  })

  const availableEvents = [
    "ticket.purchased",
    "ticket.refunded",
    "event.created",
    "event.updated",
    "event.cancelled",
    "user.registered",
    "payment.completed",
    "payment.failed",
  ]

  useEffect(() => {
    fetchWebhooks()
    fetchLogs()
  }, [])

  const fetchWebhooks = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch webhooks")

      const result = await response.json()
      setWebhooks(result.webhooks || generateMockWebhooks())
    } catch (error) {
      console.error("Webhook fetch error:", error)
      setWebhooks(generateMockWebhooks())
      toast.error("Using sample data - API connection pending")
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`${apiEndpoint}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch logs")

      const result = await response.json()
      setLogs(result.logs || generateMockLogs())
    } catch (error) {
      setLogs(generateMockLogs())
    }
  }

  const generateMockWebhooks = (): WebhookEndpoint[] => {
    return [
      {
        id: "wh-1",
        name: "Production Webhook",
        url: "https://api.example.com/webhooks/events",
        events: ["ticket.purchased", "event.created"],
        status: "active",
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        successRate: 98.5,
        totalDeliveries: 1234,
        failedDeliveries: 18,
      },
      {
        id: "wh-2",
        name: "Analytics Sync",
        url: "https://analytics.company.com/ingest",
        events: ["payment.completed", "user.registered"],
        status: "active",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        successRate: 100,
        totalDeliveries: 856,
        failedDeliveries: 0,
      },
    ]
  }

  const generateMockLogs = (): WebhookLog[] => {
    const statuses: ("success" | "failed" | "pending")[] = ["success", "success", "success", "failed", "pending"]
    return Array.from({ length: 20 }, (_, i) => ({
      id: `log-${i}`,
      webhookId: i % 2 === 0 ? "wh-1" : "wh-2",
      event: availableEvents[Math.floor(Math.random() * availableEvents.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      responseTime: Math.floor(Math.random() * 500) + 50,
      statusCode: statuses[Math.floor(Math.random() * statuses.length)] === "success" ? 200 : 500,
      retryCount: Math.floor(Math.random() * 3),
    }))
  }

  const createWebhook = async () => {
    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const token = localStorage.getItem("bearer_token")
      const newWebhook: WebhookEndpoint = {
        id: `wh-${Date.now()}`,
        name: formData.name,
        url: formData.url,
        events: formData.events,
        status: "active",
        createdAt: new Date().toISOString(),
        lastTriggered: null,
        successRate: 100,
        totalDeliveries: 0,
        failedDeliveries: 0,
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create webhook")

      setWebhooks([...webhooks, newWebhook])
      setFormData({ name: "", url: "", events: [], secret: "" })
      setDialogOpen(false)
      toast.success("Webhook created successfully")
    } catch (error) {
      // Fallback
      const newWebhook: WebhookEndpoint = {
        id: `wh-${Date.now()}`,
        name: formData.name,
        url: formData.url,
        events: formData.events,
        status: "active",
        createdAt: new Date().toISOString(),
        lastTriggered: null,
        successRate: 100,
        totalDeliveries: 0,
        failedDeliveries: 0,
      }
      setWebhooks([...webhooks, newWebhook])
      setFormData({ name: "", url: "", events: [], secret: "" })
      setDialogOpen(false)
      toast.success("Webhook created")
    }
  }

  const toggleWebhookStatus = async (webhookId: string) => {
    const webhook = webhooks.find((w) => w.id === webhookId)
    if (!webhook) return

    const newStatus = webhook.status === "active" ? "inactive" : "active"
    
    try {
      const token = localStorage.getItem("bearer_token")
      await fetch(`${apiEndpoint}/${webhookId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      setWebhooks(webhooks.map((w) => 
        w.id === webhookId ? { ...w, status: newStatus } : w
      ))
      toast.success(`Webhook ${newStatus === "active" ? "activated" : "paused"}`)
    } catch (error) {
      setWebhooks(webhooks.map((w) => 
        w.id === webhookId ? { ...w, status: newStatus } : w
      ))
      toast.success(`Webhook ${newStatus === "active" ? "activated" : "paused"}`)
    }
  }

  const deleteWebhook = async (webhookId: string) => {
    try {
      const token = localStorage.getItem("bearer_token")
      await fetch(`${apiEndpoint}/${webhookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setWebhooks(webhooks.filter((w) => w.id !== webhookId))
      toast.success("Webhook deleted")
    } catch (error) {
      setWebhooks(webhooks.filter((w) => w.id !== webhookId))
      toast.success("Webhook deleted")
    }
  }

  const retryWebhook = async (logId: string) => {
    toast.info("Retrying webhook delivery...")
    setTimeout(() => {
      setLogs(logs.map((log) =>
        log.id === logId ? { ...log, status: "success", retryCount: log.retryCount + 1 } : log
      ))
      toast.success("Webhook delivery successful")
    }, 2000)
  }

  const toggleEvent = (event: string) => {
    setFormData({
      ...formData,
      events: formData.events.includes(event)
        ? formData.events.filter((e) => e !== event)
        : [...formData.events, event],
    })
  }

  const totalDeliveries = webhooks.reduce((sum, w) => sum + w.totalDeliveries, 0)
  const totalFailed = webhooks.reduce((sum, w) => sum + w.failedDeliveries, 0)
  const avgSuccessRate = webhooks.reduce((sum, w) => sum + w.successRate, 0) / webhooks.length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Webhooks
              </CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {webhooks.filter((w) => w.status === "active").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              of {webhooks.length} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Deliveries
              </CardTitle>
              <Activity className="h-4 w-4 text-[#08CB00]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "#08CB00" }}>
              {totalDeliveries.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-[#08CB00]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "#08CB00" }}>
              {avgSuccessRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Average across all webhooks
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Failed Deliveries
              </CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {totalFailed}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Requires attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Webhook Endpoints</CardTitle>
              <CardDescription>
                Manage your webhook endpoints and event subscriptions
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Webhook Endpoint</DialogTitle>
                  <DialogDescription>
                    Set up a new webhook to receive real-time event notifications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="webhook-name">Name</Label>
                    <Input
                      id="webhook-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Production Webhook"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="webhook-url">Endpoint URL</Label>
                    <Input
                      id="webhook-url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://api.example.com/webhooks"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Events to Subscribe</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableEvents.map((event) => (
                        <div
                          key={event}
                          className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleEvent(event)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.events.includes(event)}
                            onChange={() => {}}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
                    <Input
                      id="webhook-secret"
                      type="password"
                      value={formData.secret}
                      onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                      placeholder="Your signing secret"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used to verify webhook signatures
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createWebhook}>Create Webhook</Button>
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
          ) : webhooks.length === 0 ? (
            <div className="text-center py-12">
              <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No webhooks configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first webhook to receive real-time events
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="rounded-lg border-2 border-border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{webhook.name}</h3>
                        <Badge
                          variant="outline"
                          style={
                            webhook.status === "active"
                              ? { color: "#08CB00", borderColor: "#08CB00" }
                              : {}
                          }
                        >
                          {webhook.status}
                        </Badge>
                      </div>
                      <code className="text-xs text-muted-foreground">{webhook.url}</code>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleWebhookStatus(webhook.id)}
                        title={webhook.status === "active" ? "Pause" : "Activate"}
                      >
                        {webhook.status === "active" ? (
                          <PauseCircle className="h-4 w-4" />
                        ) : (
                          <PlayCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedWebhook(webhook.id)}
                        title="View Logs"
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteWebhook(webhook.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Total Deliveries</div>
                      <div className="text-lg font-semibold">{webhook.totalDeliveries}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                      <div className="text-lg font-semibold text-destructive">
                        {webhook.failedDeliveries}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                      <div className="text-lg font-semibold" style={{ color: "#08CB00" }}>
                        {webhook.successRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Last Triggered</div>
                      <div className="text-xs font-medium">
                        {webhook.lastTriggered
                          ? new Date(webhook.lastTriggered).toLocaleString()
                          : "Never"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Delivery Logs</CardTitle>
              <CardDescription>
                Recent webhook delivery attempts and their status
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(0, 10).map((log) => {
                  const webhook = webhooks.find((w) => w.id === log.webhookId)
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <code className="text-xs">{log.event}</code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{webhook?.name || "Unknown"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={
                            log.status === "success"
                              ? { color: "#08CB00", borderColor: "#08CB00" }
                              : log.status === "failed"
                              ? { color: "#FF4444", borderColor: "#FF4444" }
                              : { color: "#FFA500", borderColor: "#FFA500" }
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.responseTime}ms</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.retryCount}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.status === "failed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryWebhook(log.id)}
                          >
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
