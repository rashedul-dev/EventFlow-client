import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EventCardDashboard } from "@/components/dashboard/event-card-dashboard"

const events = [
  {
    id: "1",
    title: "Tech Summit 2025",
    slug: "tech-summit-2025",
    date: "Mar 15-17, 2025",
    time: "9:00 AM",
    location: "San Francisco, CA",
    status: "published" as const,
    ticketsSold: 2873,
    totalTickets: 4500,
    revenue: 89450,
    image: "/tech-conference-stage.jpg",
  },
  {
    id: "2",
    title: "AI Workshop Series",
    slug: "ai-workshop-series",
    date: "Apr 5, 2025",
    time: "2:00 PM",
    location: "Online",
    status: "draft" as const,
    ticketsSold: 0,
    totalTickets: 200,
    revenue: 0,
    image: "/ai-workshop-virtual.jpg",
  },
  {
    id: "3",
    title: "Developer Meetup",
    slug: "developer-meetup",
    date: "Feb 20, 2025",
    time: "6:30 PM",
    location: "Austin, TX",
    status: "published" as const,
    ticketsSold: 156,
    totalTickets: 300,
    revenue: 7800,
    image: "/developer-meetup-networking.jpg",
  },
  {
    id: "4",
    title: "Startup Pitch Night",
    slug: "startup-pitch-night",
    date: "Mar 1, 2025",
    time: "7:00 PM",
    location: "New York, NY",
    status: "sold-out" as const,
    ticketsSold: 150,
    totalTickets: 150,
    revenue: 7500,
    image: "/startup-pitch-investors.jpg",
  },
  {
    id: "5",
    title: "Design Systems Conference",
    slug: "design-systems-conference",
    date: "May 10, 2025",
    time: "10:00 AM",
    location: "Seattle, WA",
    status: "published" as const,
    ticketsSold: 423,
    totalTickets: 800,
    revenue: 21150,
    image: "/design-conference-ux-ui.jpg",
  },
  {
    id: "6",
    title: "Blockchain Summit",
    slug: "blockchain-summit",
    date: "Jun 15, 2025",
    time: "9:00 AM",
    location: "Miami, FL",
    status: "cancelled" as const,
    ticketsSold: 89,
    totalTickets: 500,
    revenue: 4450,
    image: "/blockchain-crypto-conference.jpg",
  },
]

export default function OrganizerEventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Events</h1>
          <p className="text-foreground/60 mt-1">Manage and monitor all your events.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/organizer/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => (
          <EventCardDashboard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
