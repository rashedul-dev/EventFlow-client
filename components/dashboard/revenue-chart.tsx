"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { month: "Jan", revenue: 12500 },
  { month: "Feb", revenue: 18200 },
  { month: "Mar", revenue: 15800 },
  { month: "Apr", revenue: 22100 },
  { month: "May", revenue: 19500 },
  { month: "Jun", revenue: 28700 },
]

export function RevenueChart() {
  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader>
        <CardTitle className="text-foreground">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-48">
          {data.map((item) => {
            const height = (item.revenue / maxRevenue) * 100
            return (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs text-foreground/60 mb-2">${(item.revenue / 1000).toFixed(1)}k</span>
                  <div
                    className="w-full max-w-12 bg-primary/80 rounded-t-md transition-all hover:bg-primary"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs text-foreground/60 mt-2">{item.month}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
