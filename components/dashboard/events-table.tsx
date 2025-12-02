import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const events = [
  {
    id: "1",
    title: "Tech Summit 2025",
    date: "Mar 15, 2025",
    status: "published",
    tickets: "2,873 / 4,500",
    revenue: "$89,450",
  },
  {
    id: "2",
    title: "AI Workshop Series",
    date: "Apr 5, 2025",
    status: "draft",
    tickets: "0 / 200",
    revenue: "$0",
  },
  {
    id: "3",
    title: "Developer Meetup",
    date: "Feb 20, 2025",
    status: "published",
    tickets: "156 / 300",
    revenue: "$7,800",
  },
  {
    id: "4",
    title: "Startup Pitch Night",
    date: "Mar 1, 2025",
    status: "published",
    tickets: "89 / 150",
    revenue: "$4,450",
  },
]

export function EventsTable() {
  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Your Events</CardTitle>
        <Button size="sm" asChild>
          <Link href="/dashboard/organizer/create">Create Event</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Event</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Tickets</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-foreground/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-foreground/5 hover:bg-foreground/5">
                  <td className="py-4 px-4">
                    <span className="font-medium text-foreground">{event.title}</span>
                  </td>
                  <td className="py-4 px-4 text-foreground/70">{event.date}</td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={event.status === "published" ? "default" : "secondary"}
                      className={
                        event.status === "published"
                          ? "bg-primary/20 text-primary hover:bg-primary/30"
                          : "bg-foreground/20 text-foreground/60"
                      }
                    >
                      {event.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-foreground/70">{event.tickets}</td>
                  <td className="py-4 px-4 text-foreground font-medium">{event.revenue}</td>
                  <td className="py-4 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-secondary border-foreground/10">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-400">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
