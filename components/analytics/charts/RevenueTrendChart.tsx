"use client"

import { useState, useEffect, useRef } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Download, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface RevenueData {
  month: string
  platformCommission: number
  organizerRevenue: number
  goalLine?: number
  growth?: number
}

interface RevenueTrendChartProps {
  apiEndpoint?: string
  className?: string
}

export const RevenueTrendChart = ({ 
  apiEndpoint = "/api/analytics/revenue-trends",
  className = "" 
}: RevenueTrendChartProps) => {
  const [data, setData] = useState<RevenueData[]>([])
  const [timeRange, setTimeRange] = useState("12months")
  const [loading, setLoading] = useState(true)
  const [goalValue, setGoalValue] = useState(50000)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchRevenueData()
  }, [timeRange])

  const fetchRevenueData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`${apiEndpoint}?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch revenue data")

      const result = await response.json()
      
      // Transform API data to chart format
      const chartData = result.data?.map((item: any) => ({
        month: item.month || item.period,
        platformCommission: item.commission || item.platformRevenue || 0,
        organizerRevenue: item.organizerRevenue || item.hostRevenue || 0,
        growth: item.growthRate || 0,
      })) || generateMockData()

      // Add goal line to each data point
      const dataWithGoal = chartData.map((item: RevenueData) => ({
        ...item,
        goalLine: goalValue,
      }))

      setData(dataWithGoal)
    } catch (error) {
      console.error("Revenue data fetch error:", error)
      // Fallback to mock data for development
      setData(generateMockData())
      toast.error("Using sample data - API connection pending")
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (): RevenueData[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map((month, i) => ({
      month,
      platformCommission: 15000 + Math.random() * 20000 + i * 2000,
      organizerRevenue: 35000 + Math.random() * 40000 + i * 3000,
      goalLine: goalValue,
      growth: Math.random() * 20 - 5,
    }))
  }

  const exportChartAsPNG = async () => {
    if (!chartRef.current) return

    try {
      // Use html2canvas for export functionality
      const canvas = await import("html2canvas").then((mod) => mod.default)
      const chartCanvas = await canvas(chartRef.current)
      
      const link = document.createElement("a")
      link.download = `revenue-trends-${new Date().toISOString().split("T")[0]}.png`
      link.href = chartCanvas.toDataURL()
      link.click()
      
      toast.success("Chart exported as PNG")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Export failed - html2canvas library needed")
    }
  }

  const exportChartAsSVG = () => {
    const svgElement = chartRef.current?.querySelector("svg")
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.download = `revenue-trends-${new Date().toISOString().split("T")[0]}.svg`
    link.href = url
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success("Chart exported as SVG")
  }

  const totalPlatformRevenue = data.reduce((sum, item) => sum + item.platformCommission, 0)
  const totalOrganizerRevenue = data.reduce((sum, item) => sum + item.organizerRevenue, 0)
  const avgGrowth = data.reduce((sum, item) => sum + (item.growth || 0), 0) / data.length

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload) return null

    const data = payload[0]?.payload
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">{data.month}</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Platform Commission:</span>
            <span className="font-semibold" style={{ color: "#08CB00" }}>
              ${data.platformCommission.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Organizer Revenue:</span>
            <span className="font-semibold" style={{ color: "#253900" }}>
              ${data.organizerRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">
              ${(data.platformCommission + data.organizerRevenue).toLocaleString()}
            </span>
          </div>
          {data.growth !== undefined && (
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
              <span className="text-muted-foreground">Growth:</span>
              <span className={data.growth >= 0 ? "text-[#08CB00]" : "text-destructive"}>
                {data.growth >= 0 ? "+" : ""}{data.growth.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Revenue Trends</CardTitle>
            <CardDescription>Platform commission vs organizer revenue split</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="24months">Last 24 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={exportChartAsPNG}
              title="Export as PNG"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={exportChartAsSVG}
              title="Export as SVG"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" style={{ color: "#08CB00" }} />
              <span>Platform Commission</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#08CB00" }}>
              ${totalPlatformRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" style={{ color: "#253900" }} />
              <span>Organizer Revenue</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#253900" }}>
              ${totalOrganizerRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4 text-[#08CB00]" />
              <span>Avg Growth</span>
            </div>
            <p className="text-2xl font-bold text-[#08CB00]">
              {avgGrowth >= 0 ? "+" : ""}{avgGrowth.toFixed(1)}%
            </p>
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
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 238, 238, 0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="#EEEEEE"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="#EEEEEE"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                />
                
                {/* Goal Line */}
                <ReferenceLine 
                  y={goalValue} 
                  stroke="#FFA500" 
                  strokeDasharray="5 5"
                  label={{ value: "Goal", position: "insideTopRight", fill: "#FFA500" }}
                />
                
                {/* Revenue Lines */}
                <Line
                  type="monotone"
                  dataKey="platformCommission"
                  stroke="#08CB00"
                  strokeWidth={3}
                  name="Platform Commission"
                  dot={{ fill: "#08CB00", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="organizerRevenue"
                  stroke="#253900"
                  strokeWidth={3}
                  name="Organizer Revenue"
                  dot={{ fill: "#253900", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
