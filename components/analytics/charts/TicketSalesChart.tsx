"use client"

import { useState, useEffect, useRef } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell,
} from "recharts"
import { Download, Ticket, DollarSign, ZoomIn, ZoomOut, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface TicketSalesData {
  period: string
  freeTickets: number
  paidTickets: number
  donationTickets: number
  averagePrice: number
  totalVolume?: number
}

interface TicketSalesChartProps {
  apiEndpoint?: string
  className?: string
  compareEvents?: string[]
}

export const TicketSalesChart = ({ 
  apiEndpoint = "/api/analytics/ticket-sales",
  className = "",
  compareEvents = []
}: TicketSalesChartProps) => {
  const [data, setData] = useState<TicketSalesData[]>([])
  const [viewMode, setViewMode] = useState<"stacked" | "grouped">("stacked")
  const [timeRange, setTimeRange] = useState("30days")
  const [loading, setLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showAverageLine, setShowAverageLine] = useState(true)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTicketSalesData()
  }, [timeRange, compareEvents])

  const fetchTicketSalesData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const params = new URLSearchParams({
        range: timeRange,
        ...(compareEvents.length > 0 && { events: compareEvents.join(",") })
      })
      
      const response = await fetch(`${apiEndpoint}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch ticket sales data")

      const result = await response.json()
      
      // Transform API data
      const chartData = result.data?.map((item: any) => ({
        period: item.date || item.period,
        freeTickets: item.free || item.freeTickets || 0,
        paidTickets: item.paid || item.paidTickets || 0,
        donationTickets: item.donation || item.donationTickets || 0,
        averagePrice: item.avgPrice || item.averagePrice || 0,
        totalVolume: (item.free || 0) + (item.paid || 0) + (item.donation || 0),
      })) || generateMockData()

      setData(chartData)
    } catch (error) {
      console.error("Ticket sales data fetch error:", error)
      setData(generateMockData())
      toast.error("Using sample data - API connection pending")
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (): TicketSalesData[] => {
    const periods = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    })

    return periods.map((period) => {
      const paid = Math.floor(Math.random() * 200) + 50
      const free = Math.floor(Math.random() * 100) + 20
      const donation = Math.floor(Math.random() * 30) + 5
      
      return {
        period,
        freeTickets: free,
        paidTickets: paid,
        donationTickets: donation,
        averagePrice: Math.random() * 50 + 25,
        totalVolume: paid + free + donation,
      }
    })
  }

  const exportChart = async (format: "png" | "svg") => {
    if (!chartRef.current) return

    try {
      if (format === "png") {
        const canvas = await import("html2canvas").then((mod) => mod.default)
        const chartCanvas = await canvas(chartRef.current)
        
        const link = document.createElement("a")
        link.download = `ticket-sales-${new Date().toISOString().split("T")[0]}.png`
        link.href = chartCanvas.toDataURL()
        link.click()
      } else {
        const svgElement = chartRef.current.querySelector("svg")
        if (!svgElement) return

        const svgData = new XMLSerializer().serializeToString(svgElement)
        const blob = new Blob([svgData], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement("a")
        link.download = `ticket-sales-${new Date().toISOString().split("T")[0]}.svg`
        link.href = url
        link.click()
        
        URL.revokeObjectURL(url)
      }
      
      toast.success(`Chart exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Export failed")
    }
  }

  const totalTickets = data.reduce((sum, item) => 
    sum + item.freeTickets + item.paidTickets + item.donationTickets, 0
  )
  const totalPaid = data.reduce((sum, item) => sum + item.paidTickets, 0)
  const totalFree = data.reduce((sum, item) => sum + item.freeTickets, 0)
  const totalDonation = data.reduce((sum, item) => sum + item.donationTickets, 0)
  const avgPrice = data.reduce((sum, item) => sum + item.averagePrice, 0) / data.length

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null

    const data = payload[0].payload
    const total = data.freeTickets + data.paidTickets + data.donationTickets

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">{data.period}</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#08CB00" }} />
              <span className="text-muted-foreground">Paid:</span>
            </div>
            <span className="font-semibold">{data.paidTickets.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#253900" }} />
              <span className="text-muted-foreground">Free:</span>
            </div>
            <span className="font-semibold">{data.freeTickets.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FFA500" }} />
              <span className="text-muted-foreground">Donation:</span>
            </div>
            <span className="font-semibold">{data.donationTickets.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
            <span className="text-muted-foreground">Total Volume:</span>
            <span className="font-semibold">{total.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Avg Price:</span>
            <span className="font-semibold text-[#08CB00]">${data.averagePrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }

  const zoomedData = data.slice(
    Math.floor((data.length * (1 - zoomLevel)) / 2),
    Math.ceil(data.length - (data.length * (1 - zoomLevel)) / 2)
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Ticket Sales Analytics</CardTitle>
            <CardDescription>Volume breakdown by ticket type with pricing trends</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1))}
              disabled={zoomLevel >= 1}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.2))}
              disabled={zoomLevel <= 0.2}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => exportChart("png")}
              title="Export as PNG"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Ticket className="h-4 w-4" />
              <span>Total Tickets</span>
            </div>
            <p className="text-2xl font-bold">{totalTickets.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#08CB00" }} />
              <span>Paid</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "#08CB00" }}>
              {totalPaid.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {((totalPaid / totalTickets) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#253900" }} />
              <span>Free</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "#253900" }}>
              {totalFree.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {((totalFree / totalTickets) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4 text-[#08CB00]" />
              <span>Avg Price</span>
            </div>
            <p className="text-xl font-bold text-[#08CB00]">
              ${avgPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="view-mode" className="text-sm">View:</Label>
            <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
              <SelectTrigger id="view-mode" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stacked">Stacked</SelectItem>
                <SelectItem value="grouped">Grouped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="show-avg" 
              checked={showAverageLine} 
              onCheckedChange={(checked) => setShowAverageLine(!!checked)}
            />
            <Label htmlFor="show-avg" className="text-sm cursor-pointer">
              Show Average Price
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div ref={chartRef} className="w-full">
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={zoomedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 238, 238, 0.1)" />
                <XAxis 
                  dataKey="period" 
                  stroke="#EEEEEE"
                  style={{ fontSize: "10px" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#EEEEEE"
                  style={{ fontSize: "12px" }}
                  label={{ value: "Ticket Volume", angle: -90, position: "insideLeft", fill: "#EEEEEE" }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#08CB00"
                  style={{ fontSize: "12px" }}
                  label={{ value: "Avg Price ($)", angle: 90, position: "insideRight", fill: "#08CB00" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="rect"
                />
                
                {/* Bars */}
                <Bar 
                  yAxisId="left"
                  dataKey="paidTickets" 
                  stackId={viewMode === "stacked" ? "tickets" : undefined}
                  fill="#08CB00"
                  name="Paid Tickets"
                  radius={viewMode === "stacked" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="freeTickets" 
                  stackId={viewMode === "stacked" ? "tickets" : undefined}
                  fill="#253900"
                  name="Free Tickets"
                  radius={viewMode === "stacked" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="donationTickets" 
                  stackId={viewMode === "stacked" ? "tickets" : undefined}
                  fill="#FFA500"
                  name="Donation Tickets"
                  radius={viewMode === "stacked" ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                />
                
                {/* Average Price Line */}
                {showAverageLine && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="averagePrice"
                    stroke="#08CB00"
                    strokeWidth={2}
                    name="Avg Price"
                    dot={{ fill: "#08CB00", r: 3 }}
                    strokeDasharray="5 5"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
