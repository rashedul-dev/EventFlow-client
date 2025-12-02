import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ArrowRight } from "lucide-react"

const upcomingEvents = [
  {
    id: "1",
    title: "Tech Summit 2025",
    date: "Mar 15, 2025",
    location: "San Francisco, CA",
    ticketType: "VIP Pass",
    image: "/tech-conference.png",
  },
  {
    id: "2",
    title: "Design Systems Conference",
    date: "Apr 22, 2025",
    location: "New York, NY",
    ticketType: "General Admission",
    image: "/design-conference.png",
  },
  {
    id: "3",
    title: "Startup Weekend",
    date: "May 10, 2025",
    location: "Austin, TX",
    ticketType: "Early Bird",
    image: "/startup-event.png",
  },
]

export function UpcomingEvents() {
  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Upcoming Events</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/upcoming" className="text-primary hover:text-primary/80">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
          >
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{event.title}</h4>
              <div className="flex items-center gap-4 mt-1 text-sm text-foreground/60">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                {event.ticketType}
              </span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/tickets/${event.id}`}>View Ticket</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
