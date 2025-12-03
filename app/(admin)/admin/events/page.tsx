"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VerificationQueue, type PendingEvent } from "@/components/admin/events/VerificationQueue"
import { RefreshCw, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { EventReviewModal } from "@/components/admin/events/EventReviewModal"

export default function AdminEventsPage() {
  const [events, setEvents] = useState<PendingEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    avgReviewTime: 0,
  })

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const mockEvents: PendingEvent[] = [
        {
          id: "1",
          title: "Summer Music Festival 2025",
          organizer: {
            id: "org1",
            name: "John Events Co.",
            email: "john@events.com",
            totalEvents: 15,
            approvalRate: 95,
          },
          date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          venue: "Central Park, New York",
          capacity: 5000,
          ticketPrice: { min: 50, max: 200 },
          category: "Music",
          submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop",
        },
        {
          id: "2",
          title: "Tech Innovation Conference 2025",
          organizer: {
            id: "org2",
            name: "TechEvents Inc.",
            email: "info@techevents.com",
            totalEvents: 28,
            approvalRate: 98,
          },
          date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          venue: "Convention Center, San Francisco",
          capacity: 2000,
          ticketPrice: { min: 100, max: 500 },
          category: "Conference",
          submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
        },
        {
          id: "3",
          title: "Food & Wine Festival",
          organizer: {
            id: "org3",
            name: "Culinary Events",
            email: "contact@culinary.com",
            totalEvents: 8,
            approvalRate: 87,
          },
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          venue: "Downtown Plaza, Chicago",
          capacity: 3000,
          ticketPrice: { min: 40, max: 150 },
          category: "Festival",
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
        },
      ]

      setEvents(mockEvents)
      setStats({
        pending: mockEvents.length,
        approved: 148,
        rejected: 12,
        avgReviewTime: 2.4,
      })
    } catch (error) {
      toast.error("Failed to fetch events")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleReview = (event: PendingEvent) => {
    setSelectedEvent(event)
    setIsReviewModalOpen(true)
  }

  const handleApprove = async (eventId: string, comment?: string) => {
    // TODO: Implement API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setEvents(events.filter((e) => e.id !== eventId))
    toast.success("Event approved successfully")
  }

  const handleReject = async (eventId: string, reason: string) => {
    // TODO: Implement API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setEvents(events.filter((e) => e.id !== eventId))
    toast.success("Event rejected")
  }

  const handleQuickApprove = async (eventId: string) => {
    await handleApprove(eventId)
  }

  const handleQuickReject = async (eventId: string) => {
    // Show reason dialog in production
    await handleReject(eventId, "Quick reject")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Verification</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve event submissions
          </p>
        </div>
        <Button variant="outline" onClick={fetchEvents} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Review Time
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgReviewTime}h</div>
            <p className="text-xs text-muted-foreground mt-1">Average response</p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Queue */}
      <VerificationQueue
        events={events}
        isLoading={isLoading}
        onReview={handleReview}
        onQuickApprove={handleQuickApprove}
        onQuickReject={handleQuickReject}
        onRefresh={fetchEvents}
      />

      {/* Review Modal */}
      <EventReviewModal
        event={selectedEvent}
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
