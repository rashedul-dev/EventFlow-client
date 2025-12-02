import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, DollarSign, TrendingUp, Ticket, Eye } from "lucide-react"

const stats = [
  {
    label: "Total Events",
    value: "8",
    change: "+2 this month",
    icon: Calendar,
  },
  {
    label: "Total Attendees",
    value: "4,523",
    change: "+847 this month",
    icon: Users,
  },
  {
    label: "Revenue",
    value: "$127,450",
    change: "+$23,100 this month",
    icon: DollarSign,
  },
  {
    label: "Tickets Sold",
    value: "5,129",
    change: "+912 this month",
    icon: Ticket,
  },
  {
    label: "Page Views",
    value: "45.2K",
    change: "+12% vs last month",
    icon: Eye,
  },
  {
    label: "Conversion Rate",
    value: "11.3%",
    change: "+2.1% vs last month",
    icon: TrendingUp,
  },
]

export function OrganizerStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="bg-secondary/30 border-foreground/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-foreground/60">{stat.label}</p>
                <p className="text-xs text-primary">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
