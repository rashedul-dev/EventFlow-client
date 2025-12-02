"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Ticket, Calendar, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

const stats = [
  {
    label: "Total Tickets",
    value: "12",
    change: "+3",
    changeLabel: "this month",
    icon: Ticket,
    trend: "up" as const,
    chartData: [30, 45, 35, 50, 60, 55, 70],
  },
  {
    label: "Upcoming Events",
    value: "4",
    change: "5",
    changeLabel: "days to next",
    icon: Calendar,
    trend: "neutral" as const,
    chartData: [1, 1, 2, 2, 3, 3, 4],
  },
  {
    label: "Total Spent",
    value: "$1,247",
    change: "+$299",
    changeLabel: "this month",
    icon: DollarSign,
    trend: "up" as const,
    chartData: [200, 350, 400, 500, 700, 900, 1247],
  },
  {
    label: "Events Attended",
    value: "8",
    change: "+2",
    changeLabel: "from last year",
    icon: TrendingUp,
    trend: "up" as const,
    chartData: [1, 2, 3, 4, 5, 6, 8],
  },
]

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon fill={`url(#gradient-${color})`} points={`0,100 ${points} 100,100`} />
      {/* Line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : null

        return (
          <Card
            key={stat.label}
            className="bg-secondary/30 border-foreground/10 hover:border-primary/30 transition-colors group"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {TrendIcon && stat.trend !== "neutral" && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === "up" ? "text-primary" : "text-red-400"
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {stat.change}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <MiniChart
                  data={stat.chartData}
                  color={stat.trend === "up" ? "#08CB00" : stat.trend === "down" ? "#ef4444" : "#666"}
                />
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-foreground/60">{stat.label}</p>
                <p className="text-xs text-foreground/40">{stat.changeLabel}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
