"use client"

import { useState } from "react"
import { EventCard } from "./event-card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import type { Event } from "@/lib/types"

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Tech Summit 2025: The Future of AI",
    slug: "tech-summit-2025",
    description: "Join industry leaders for an immersive experience exploring the latest in artificial intelligence.",
    startDate: "2025-03-15T09:00:00Z",
    endDate: "2025-03-15T18:00:00Z",
    timezone: "America/New_York",
    isVirtual: false,
    venueName: "Convention Center",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    coverImage: "/tech-conference-stage.jpg",
    capacity: 5000,
    isPrivate: false,
    requiresApproval: false,
    status: "APPROVED",
    category: "Technology",
    organizerId: "1",
    organizer: {
      id: "1",
      email: "",
      role: "ORGANIZER",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      organizationName: "TechCorp Events",
      createdAt: "",
      updatedAt: "",
    },
    ticketTypes: [
      {
        id: "1",
        eventId: "1",
        name: "General",
        category: "PAID",
        price: 299,
        currency: "USD",
        quantity: 1000,
        quantitySold: 450,
        maxPerOrder: 5,
        minPerOrder: 1,
        isVisible: true,
        isTransferable: true,
        hasSeating: false,
        sortOrder: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "2",
    title: "Summer Music Festival",
    slug: "summer-music-festival",
    description: "Three days of incredible music featuring top artists from around the world.",
    startDate: "2025-06-20T12:00:00Z",
    endDate: "2025-06-22T23:00:00Z",
    timezone: "America/Los_Angeles",
    isVirtual: false,
    venueName: "Sunset Park",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    coverImage: "/music-festival-crowd-lights.jpg",
    capacity: 50000,
    isPrivate: false,
    requiresApproval: false,
    status: "APPROVED",
    category: "Music",
    organizerId: "2",
    organizer: {
      id: "2",
      email: "",
      role: "ORGANIZER",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      organizationName: "Live Nation",
      createdAt: "",
      updatedAt: "",
    },
    ticketTypes: [
      {
        id: "2",
        eventId: "2",
        name: "GA",
        category: "PAID",
        price: 199,
        currency: "USD",
        quantity: 20000,
        quantitySold: 15000,
        maxPerOrder: 4,
        minPerOrder: 1,
        isVisible: true,
        isTransferable: true,
        hasSeating: false,
        sortOrder: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "3",
    title: "Virtual Design Workshop",
    slug: "virtual-design-workshop",
    description: "Learn the latest UI/UX design techniques from industry experts.",
    startDate: "2025-02-10T14:00:00Z",
    endDate: "2025-02-10T17:00:00Z",
    timezone: "UTC",
    isVirtual: true,
    virtualPlatform: "Zoom",
    coverImage: "/design-workshop-creative.jpg",
    capacity: 500,
    isPrivate: false,
    requiresApproval: false,
    status: "APPROVED",
    category: "Arts",
    organizerId: "3",
    organizer: {
      id: "3",
      email: "",
      role: "ORGANIZER",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      organizationName: "Design Academy",
      createdAt: "",
      updatedAt: "",
    },
    ticketTypes: [
      {
        id: "3",
        eventId: "3",
        name: "Free",
        category: "FREE",
        price: 0,
        currency: "USD",
        quantity: 500,
        quantitySold: 200,
        maxPerOrder: 1,
        minPerOrder: 1,
        isVisible: true,
        isTransferable: false,
        hasSeating: false,
        sortOrder: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "4",
    title: "Startup Pitch Night",
    slug: "startup-pitch-night",
    description: "Watch 10 innovative startups pitch to top VCs for funding.",
    startDate: "2025-02-28T18:00:00Z",
    endDate: "2025-02-28T21:00:00Z",
    timezone: "America/New_York",
    isVirtual: false,
    venueName: "Innovation Hub",
    city: "New York",
    state: "NY",
    country: "USA",
    coverImage: "/startup-pitch.png",
    capacity: 200,
    isPrivate: false,
    requiresApproval: false,
    status: "APPROVED",
    category: "Business",
    organizerId: "4",
    organizer: {
      id: "4",
      email: "",
      role: "ORGANIZER",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      organizationName: "NYC Startups",
      createdAt: "",
      updatedAt: "",
    },
    ticketTypes: [
      {
        id: "4",
        eventId: "4",
        name: "General",
        category: "PAID",
        price: 25,
        currency: "USD",
        quantity: 200,
        quantitySold: 150,
        maxPerOrder: 2,
        minPerOrder: 1,
        isVisible: true,
        isTransferable: true,
        hasSeating: false,
        sortOrder: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "5",
    title: "Marathon for Charity",
    slug: "marathon-charity",
    description: "Run for a cause. All proceeds go to local education programs.",
    startDate: "2025-04-12T06:00:00Z",
    endDate: "2025-04-12T14:00:00Z",
    timezone: "America/Chicago",
    isVirtual: false,
    venueName: "City Park",
    city: "Chicago",
    state: "IL",
    country: "USA",
    coverImage: "/marathon-running-event.png",
    capacity: 10000,
    isPrivate: false,
    requiresApproval: false,
    status: "APPROVED",
    category: "Sports",
    organizerId: "5",
    organizer: {
      id: "5",
      email: "",
      role: "ORGANIZER",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      organizationName: "Run Chicago",
      createdAt: "",
      updatedAt: "",
    },
    ticketTypes: [
      {
        id: "5",
        eventId: "5",
        name: "Registration",
        category: "DONATION",
        price: 50,
        currency: "USD",
        quantity: 10000,
        quantitySold: 3000,
        maxPerOrder: 5,
        minPerOrder: 1,
        isVisible: true,
        isTransferable: false,
        hasSeating: false,
        sortOrder: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "6",
    title: "Food & Wine Festival",
    slug: "food-wine-festival",
    description: "Taste cuisines from around the world paired with premium wines.",
    startDate: "2025-05-18T11:00:00Z",
    endDate: "2025-05-18T20:00:00Z",
    timezone: "America/Los_Angeles",
    isVirtual: false,
    venueName: "Wine Country Estate",
    city: "Napa Valley",
    state: "CA",
    country: "USA",
    coverImage: "/food-wine-festival-outdoor.jpg",
    capacity: 2000,
    isPrivate: false,
    requiresApproval: false,
    ageRestriction: 21,
    status: "APPROVED",
    category: "Food & Drink",
    organizerId: "6",
    organizer: {
      id: "6",
      email: "",
      role: "ORGANIZER",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      organizationName: "Napa Events",
      createdAt: "",
      updatedAt: "",
    },
    ticketTypes: [
      {
        id: "6",
        eventId: "6",
        name: "VIP",
        category: "PAID",
        price: 175,
        currency: "USD",
        quantity: 500,
        quantitySold: 400,
        maxPerOrder: 4,
        minPerOrder: 1,
        isVisible: true,
        isTransferable: true,
        hasSeating: false,
        sortOrder: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "",
    updatedAt: "",
  },
]

interface EventListProps {
  initialEvents?: Event[]
}

export function EventList({ initialEvents }: EventListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents || mockEvents)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = () => {
    // In real app, this would fetch more events from API
    setIsLoading(true)
    setTimeout(() => {
      setHasMore(false)
      setIsLoading(false)
    }, 1000)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load events</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No events found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={loadMore} variant="outline" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Events"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
