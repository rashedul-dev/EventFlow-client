"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { Calendar, MapPin, Users, MoreHorizontal, Edit, Eye, Trash2, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EventCardDashboardProps {
  event: {
    id: string
    title: string
    slug: string
    image?: string
    date: string
    time: string
    location: string
    status: "published" | "draft" | "cancelled" | "completed" | "sold-out"
    ticketsSold: number
    totalTickets: number
    revenue: number
  }
}

export function EventCardDashboard({ event }: EventCardDashboardProps) {
  const soldPercentage = (event.ticketsSold / event.totalTickets) * 100

  return (
    <Card className="bg-background border-primary/20 hover:border-primary/40 transition-all duration-200 group overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-secondary/50 flex-shrink-0">
            {event.image ? (
              <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-foreground/20" />
              </div>
            )}
            {/* Status badge overlay */}
            <div className="absolute top-2 left-2">
              <StatusBadge status={event.status} size="sm" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-secondary border-foreground/10">
                    <DropdownMenuItem className="gap-2">
                      <Eye className="h-4 w-4" /> View Event
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Edit className="h-4 w-4" /> Edit Event
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Copy className="h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-foreground/10" />
                    <DropdownMenuItem className="gap-2 text-red-400">
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/60 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {event.date} at {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between pt-3 border-t border-foreground/10">
              <div className="flex items-center gap-4">
                {/* Tickets progress */}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-foreground/40" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {event.ticketsSold} / {event.totalTickets}
                    </span>
                    <div className="w-20 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${soldPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Revenue */}
                <div className="hidden sm:block">
                  <span className="text-sm text-foreground/50">Revenue</span>
                  <p className="text-sm font-semibold text-primary">${event.revenue.toLocaleString()}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/organizer/events/${event.slug}`}>Manage</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
