import Link from "next/link"
import { OrganizerStats } from "@/components/dashboard/organizer-stats"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { EventsTable } from "@/components/dashboard/events-table"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function OrganizerDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Organizer Dashboard</h1>
        <p className="text-foreground/60 mt-1">Manage your events, track sales, and grow your audience.</p>
      </div>

      <OrganizerStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <Card className="bg-secondary/30 border-foreground/10 p-6">
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <Link href="/dashboard/organizer/create">Create Event</Link>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <Link href="/dashboard/organizer/attendees">View Attendees</Link>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <Link href="/dashboard/organizer/analytics">Analytics</Link>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <Link href="/dashboard/organizer/promo">Promo Codes</Link>
            </Button>
          </div>
        </Card>
      </div>

      <EventsTable />
    </div>
  )
}
