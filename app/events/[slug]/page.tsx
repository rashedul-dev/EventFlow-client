import type { Event } from "@/lib/types"
import { EventDetailHero } from "@/components/events/event-detail-hero"
import { EventDetailContent } from "@/components/events/event-detail-content"
import { ErrorBoundary } from "@/components/ui/error-boundary"

// Mock data - in real app this would come from API
const mockEvent: Event = {
  id: "1",
  title: "Tech Summit 2025: The Future of Artificial Intelligence",
  slug: "tech-summit-2025",
  description: `Join us for the most anticipated technology conference of the year! Tech Summit 2025 brings together industry leaders, innovators, and visionaries to explore the cutting edge of artificial intelligence and its impact on our future.

What to Expect:
- Keynote speeches from top AI researchers and industry CEOs
- Hands-on workshops covering machine learning, neural networks, and more
- Networking opportunities with 5,000+ attendees
- Exhibition hall featuring the latest AI products and startups

Whether you're a seasoned professional or just starting your journey in tech, this event offers something for everyone. Don't miss this chance to be part of the conversation shaping our digital future.`,
  startDate: "2025-03-15T09:00:00Z",
  endDate: "2025-03-17T18:00:00Z",
  location: "San Francisco Convention Center",
  address: "747 Howard St, San Francisco, CA 94103",
  imageUrl: "/tech-conference-stage-with-screens.jpg",
  category: "Technology",
  status: "published",
  featured: true,
  organizerId: "org-1",
  organizer: {
    id: "org-1",
    name: "TechEvents Global",
    email: "contact@techevents.com",
    avatar: "/generic-company-logo.png",
  },
  ticketTypes: [
    {
      id: "tt-1",
      name: "General Admission",
      price: 299,
      quantity: 3000,
      sold: 2450,
      description: "Access to all main stage sessions and exhibition hall",
    },
    {
      id: "tt-2",
      name: "VIP Pass",
      price: 799,
      quantity: 500,
      sold: 423,
      description: "Priority seating, exclusive workshops, VIP lounge access, and networking dinner",
    },
    {
      id: "tt-3",
      name: "Workshop Only",
      price: 149,
      quantity: 1000,
      sold: 756,
      description: "Access to hands-on workshop sessions only",
    },
  ],
  createdAt: "2024-11-01T00:00:00Z",
  updatedAt: "2024-12-01T00:00:00Z",
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // In production, fetch from API:
  // const event = await api.events.getBySlug(slug)
  const event = mockEvent

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
          <p className="text-foreground/60">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <EventDetailHero event={event} />
        <EventDetailContent event={event} />
      </div>
    </ErrorBoundary>
  )
}
