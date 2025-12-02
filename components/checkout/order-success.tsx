"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Check, Download, Share2, Calendar, MapPin, Clock, ExternalLink } from "lucide-react"
import QRCode from "react-qr-code"

interface OrderSuccessProps {
  orderNumber: string
  tickets: {
    id: string
    ticketNumber: string
    eventTitle: string
    eventDate: string
    eventTime: string
    eventLocation: string
    ticketType: string
    attendeeName: string
  }[]
  className?: string
}

export function OrderSuccess({ orderNumber, tickets, className }: OrderSuccessProps) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const addToCalendar = (ticket: (typeof tickets)[0]) => {
    const startDate = new Date(ticket.eventDate).toISOString().replace(/-|:|\.\d{3}/g, "")
    const endDate = new Date(new Date(ticket.eventDate).getTime() + 2 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d{3}/g, "")

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      ticket.eventTitle,
    )}&dates=${startDate}/${endDate}&location=${encodeURIComponent(
      ticket.eventLocation,
    )}&details=${encodeURIComponent(`Ticket: ${ticket.ticketNumber}`)}`

    window.open(calendarUrl, "_blank")
  }

  const shareTicket = async (ticket: (typeof tickets)[0]) => {
    if (navigator.share) {
      await navigator.share({
        title: `My ticket for ${ticket.eventTitle}`,
        text: `I'm attending ${ticket.eventTitle}!`,
        url: window.location.href,
      })
    }
  }

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6">
          <Check className="h-10 w-10 text-black" />
          {showConfetti && <div className="absolute inset-0 animate-ping rounded-full bg-primary/50" />}
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Order #{orderNumber} has been successfully placed.</p>
        <p className="text-sm text-muted-foreground mt-2">A confirmation email has been sent to your email address.</p>
      </div>

      {/* Tickets */}
      <div className="space-y-6">
        {tickets.map((ticket, index) => (
          <div key={ticket.id} className="relative overflow-hidden rounded-2xl border-2 border-primary bg-black">
            {/* Ticket Stub Cutouts */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background" />

            {/* Top Section */}
            <div className="p-6 border-b border-dashed border-secondary">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-primary font-medium mb-1">
                    TICKET {index + 1} OF {tickets.length}
                  </p>
                  <h2 className="text-xl font-bold text-foreground mb-3">{ticket.eventTitle}</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        {new Date(ticket.eventDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{ticket.eventTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{ticket.eventLocation}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex-shrink-0 p-3 bg-white rounded-xl">
                  <QRCode value={ticket.ticketNumber} size={100} />
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">TICKET TYPE</p>
                  <p className="font-semibold text-foreground">{ticket.ticketType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ATTENDEE</p>
                  <p className="font-semibold text-foreground">{ticket.attendeeName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TICKET #</p>
                  <p className="font-mono text-sm text-primary">{ticket.ticketNumber}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => addToCalendar(ticket)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-secondary text-foreground hover:bg-secondary/20 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Add to Calendar
                </button>
                <button
                  onClick={() => shareTicket(ticket)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-secondary text-foreground hover:bg-secondary/20 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-black font-medium hover:bg-primary/90 transition-colors">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <a
          href="/dashboard/tickets"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-secondary text-foreground hover:bg-secondary/20 transition-colors"
        >
          View All Tickets
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href="/events"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black font-semibold hover:bg-primary/90 transition-colors"
        >
          Discover More Events
        </a>
      </div>
    </div>
  )
}
