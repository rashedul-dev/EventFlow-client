import { TicketCard } from "@/components/dashboard/ticket-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Ticket } from "@/lib/types"

// Mock tickets data
const mockTickets: Ticket[] = [
  {
    id: "tkt-001",
    eventId: "1",
    userId: "user-1",
    ticketTypeId: "tt-2",
    status: "active",
    purchaseDate: "2024-12-01T00:00:00Z",
    event: {
      id: "1",
      title: "Tech Summit 2025",
      slug: "tech-summit-2025",
      startDate: "2025-03-15T09:00:00Z",
      endDate: "2025-03-17T18:00:00Z",
      location: "San Francisco, CA",
      imageUrl: "/tech-conference-stage.jpg",
      category: "Technology",
      status: "published",
      featured: true,
      organizerId: "org-1",
      createdAt: "2024-11-01T00:00:00Z",
      updatedAt: "2024-12-01T00:00:00Z",
    },
    ticketType: {
      id: "tt-2",
      name: "VIP Pass",
      price: 799,
      quantity: 500,
      sold: 423,
    },
  },
  {
    id: "tkt-002",
    eventId: "2",
    userId: "user-1",
    ticketTypeId: "tt-1",
    status: "active",
    purchaseDate: "2024-11-15T00:00:00Z",
    event: {
      id: "2",
      title: "Design Systems Conference",
      slug: "design-systems-conf",
      startDate: "2025-04-22T09:00:00Z",
      endDate: "2025-04-22T18:00:00Z",
      location: "New York, NY",
      imageUrl: "/design-conference.png",
      category: "Design",
      status: "published",
      featured: false,
      organizerId: "org-2",
      createdAt: "2024-10-01T00:00:00Z",
      updatedAt: "2024-11-01T00:00:00Z",
    },
    ticketType: {
      id: "tt-1",
      name: "General Admission",
      price: 299,
      quantity: 1000,
      sold: 756,
    },
  },
  {
    id: "tkt-003",
    eventId: "3",
    userId: "user-1",
    ticketTypeId: "tt-1",
    status: "used",
    purchaseDate: "2024-06-01T00:00:00Z",
    event: {
      id: "3",
      title: "React Conf 2024",
      slug: "react-conf-2024",
      startDate: "2024-09-15T09:00:00Z",
      endDate: "2024-09-16T18:00:00Z",
      location: "Las Vegas, NV",
      imageUrl: "/react-developer-conference.jpg",
      category: "Technology",
      status: "completed",
      featured: false,
      organizerId: "org-3",
      createdAt: "2024-05-01T00:00:00Z",
      updatedAt: "2024-09-20T00:00:00Z",
    },
    ticketType: {
      id: "tt-1",
      name: "General Admission",
      price: 399,
      quantity: 2000,
      sold: 2000,
    },
  },
]

export default function TicketsPage() {
  const activeTickets = mockTickets.filter((t) => t.status === "active")
  const usedTickets = mockTickets.filter((t) => t.status === "used")
  const cancelledTickets = mockTickets.filter((t) => t.status === "cancelled")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Tickets</h1>
        <p className="text-foreground/60 mt-1">Manage your event tickets and access QR codes for entry.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="active">Active ({activeTickets.length})</TabsTrigger>
          <TabsTrigger value="used">Past ({usedTickets.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeTickets.length > 0 ? (
            activeTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          ) : (
            <div className="text-center py-12 text-foreground/60">
              <p>No active tickets</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="used" className="mt-6 space-y-4">
          {usedTickets.length > 0 ? (
            usedTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          ) : (
            <div className="text-center py-12 text-foreground/60">
              <p>No past tickets</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6 space-y-4">
          {cancelledTickets.length > 0 ? (
            cancelledTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          ) : (
            <div className="text-center py-12 text-foreground/60">
              <p>No cancelled tickets</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
