"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Download, QrCode, Share2 } from "lucide-react"
import type { Ticket } from "@/lib/types"

interface TicketCardProps {
  ticket: Ticket
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false)

  return (
    <Card className="bg-secondary/30 border-foreground/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Event Image */}
          <div className="md:w-48 h-32 md:h-auto relative">
            <img
              src={ticket.event?.imageUrl || "/placeholder.svg?height=200&width=200&query=event"}
              alt={ticket.event?.title || "Event"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-secondary/50" />
          </div>

          {/* Ticket Details */}
          <div className="flex-1 p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                  {ticket.ticketType?.name || "General"}
                </span>
                <h3 className="text-xl font-bold text-foreground">{ticket.event?.title || "Event Title"}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {ticket.event?.startDate
                      ? new Date(ticket.event.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Date TBD"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {ticket.event?.location || "Location TBD"}
                  </span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center gap-2">
                {showQR ? (
                  <div className="p-4 bg-foreground rounded-lg">
                    <div className="w-24 h-24 bg-background grid grid-cols-5 gap-0.5 p-2">
                      {/* Simplified QR pattern */}
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square ${Math.random() > 0.5 ? "bg-foreground" : "bg-background"}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setShowQR(true)} className="gap-2">
                    <QrCode className="h-4 w-4" />
                    Show QR
                  </Button>
                )}
                <span className="text-xs text-foreground/40 font-mono">{ticket.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-foreground/10">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <span
                className={`ml-auto px-2 py-1 text-xs rounded-full ${
                  ticket.status === "active"
                    ? "bg-primary/20 text-primary"
                    : ticket.status === "used"
                      ? "bg-foreground/20 text-foreground/60"
                      : "bg-red-500/20 text-red-400"
                }`}
              >
                {ticket.status}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
