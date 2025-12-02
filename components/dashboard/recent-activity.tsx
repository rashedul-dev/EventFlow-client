import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, CreditCard, Bell, Heart } from "lucide-react"

const activities = [
  {
    id: "1",
    type: "purchase",
    title: "Purchased VIP Pass",
    description: "Tech Summit 2025",
    time: "2 hours ago",
    icon: CreditCard,
  },
  {
    id: "2",
    type: "ticket",
    title: "Ticket Confirmed",
    description: "Design Systems Conference",
    time: "1 day ago",
    icon: Ticket,
  },
  {
    id: "3",
    type: "notification",
    title: "Event Reminder",
    description: "Startup Weekend starts in 5 days",
    time: "2 days ago",
    icon: Bell,
  },
  {
    id: "4",
    type: "favorite",
    title: "Added to Favorites",
    description: "AI & Machine Learning Summit",
    time: "3 days ago",
    icon: Heart,
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-foreground/60 truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-foreground/40 shrink-0">{activity.time}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
