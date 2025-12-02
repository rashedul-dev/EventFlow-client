import { TicketCard } from "@/components/dashboard/ticket-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Ticket } from "@/lib/types";

// Mock tickets data
const mockTickets: Ticket[] = [
  {
    id: "tkt-001",
    ticketNumber: "TN-123456",
    ticketTypeId: "tt-789",
    eventId: "evt-123",
    userId: "usr-456",
    status: "ACTIVE",
    pricePaid: 299,
    currency: "USD",
    createdAt: "2024-12-03T00:00:00Z",
    updatedAt: "2024-12-03T00:00:00Z",
    event: {
      id: "evt-123",
      title: "Tech Summit 2025",
      slug: "tech-summit-2025",
      description: "Leading tech conference of the year.",
      startDate: "2025-03-15T09:00:00Z",
      endDate: "2025-03-17T18:00:00Z",
      timezone: "America/Los_Angeles",
      isVirtual: false,
      venueName: "Moscone Center",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      status: "PENDING_APPROVAL",
      isPrivate: false,
      requiresApproval: false,
      organizerId: "org-1",
      createdAt: "2024-11-01T00:00:00Z",
      updatedAt: "2024-12-01T00:00:00Z",
    },
    ticketType: {
      id: "tt-2",
      eventId: "1",
      currency: "USD",
      category: "PAID",
      maxPerOrder: 10,
      minPerOrder: 1,
      isVisible: true,
      isTransferable: true,
      hasSeating: false,
      name: "VIP Pass",
      price: 799,
      quantity: 500,
      quantitySold: 423,
      sortOrder: 1,
      createdAt: "2024-11-01T00:00:00Z",
      updatedAt: "2024-12-01T00:00:00Z",
    },
  },
  {
    id: "tkt-001",
    ticketNumber: "TN-123456",
    ticketTypeId: "tt-789",
    eventId: "evt-123",
    userId: "usr-456",
    status: "ACTIVE",
    pricePaid: 299,
    currency: "USD",
    createdAt: "2024-12-03T00:00:00Z",
    updatedAt: "2024-12-03T00:00:00Z",
    event: {
      id: "evt-123",
      title: "Tech Summit 2025",
      slug: "tech-summit-2025",
      description: "Leading tech conference of the year.",
      startDate: "2025-03-15T09:00:00Z",
      endDate: "2025-03-17T18:00:00Z",
      timezone: "America/Los_Angeles",
      isVirtual: false,
      venueName: "Moscone Center",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      status: "DRAFT",
      isPrivate: false,
      requiresApproval: false,
      organizerId: "org-1",
      createdAt: "2024-11-01T00:00:00Z",
      updatedAt: "2024-12-01T00:00:00Z",
    },
    ticketType: {
      id: "tt-3",
      eventId: "1",
      currency: "USD",
      category: "PAID",
      maxPerOrder: 10,
      minPerOrder: 1,
      isVisible: true,
      isTransferable: true,
      hasSeating: false,
      name: "VIP Pass",
      price: 799,
      quantity: 500,
      quantitySold: 423,
      sortOrder: 1,
      createdAt: "2024-11-01T00:00:00Z",
      updatedAt: "2024-12-01T00:00:00Z",
    },
  },
  {
    id: "tkt-001",
    ticketNumber: "TN-123456",
    ticketTypeId: "tt-789",
    eventId: "evt-123",
    userId: "usr-456",
    status: "ACTIVE",
    pricePaid: 299,
    currency: "USD",
    createdAt: "2024-12-03T00:00:00Z",
    updatedAt: "2024-12-03T00:00:00Z",
    event: {
      id: "evt-123",
      title: "Tech Summit 2025",
      slug: "tech-summit-2025",
      description: "Leading tech conference of the year.",
      startDate: "2025-03-15T09:00:00Z",
      endDate: "2025-03-17T18:00:00Z",
      timezone: "America/Los_Angeles",
      isVirtual: false,
      venueName: "Moscone Center",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      status: "REJECTED",
      isPrivate: false,
      requiresApproval: false,
      organizerId: "org-1",
      createdAt: "2024-11-01T00:00:00Z",
      updatedAt: "2024-12-01T00:00:00Z",
    },
    ticketType: {
      id: "tt-2",
      eventId: "1",
      currency: "USD",
      category: "PAID",
      maxPerOrder: 10,
      minPerOrder: 1,
      isVisible: true,
      isTransferable: true,
      hasSeating: false,
      name: "VIP Pass",
      price: 799,
      quantity: 500,
      quantitySold: 423,
      sortOrder: 1,
      createdAt: "2024-11-01T00:00:00Z",
      updatedAt: "2024-12-01T00:00:00Z",
    },
  },
];

export default function TicketsPage() {
  const activeTickets = mockTickets.filter((t) => t.status === "ACTIVE");
  const usedTickets = mockTickets.filter((t) => t.status === "USED");
  const cancelledTickets = mockTickets.filter((t) => t.status === "CANCELLED");

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
  );
}
