import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-foreground/60 mt-1">Welcome back! Here's what's happening with your events.</p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingEvents />
        <RecentActivity />
      </div>
    </div>
  )
}
