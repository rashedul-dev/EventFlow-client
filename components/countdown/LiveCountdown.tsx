"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Zap } from "lucide-react"
import { toast } from "sonner"

interface LiveCountdownProps {
  eventDate: string
  eventTitle: string
  eventLocation?: string
  timezone?: string
  compact?: boolean
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function LiveCountdown({
  eventDate,
  eventTitle,
  eventLocation,
  timezone = "UTC",
  compact = false,
}: LiveCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [hasNotified, setHasNotified] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const target = new Date(eventDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference,
      }
    }

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining())

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining()
      setTimeRemaining(remaining)

      // Notify when event is starting (within 5 minutes)
      if (!hasNotified && remaining.total > 0 && remaining.total <= 5 * 60 * 1000) {
        setHasNotified(true)
        toast.success(`${eventTitle} is starting soon!`, {
          style: {
            background: "#0a0a0a",
            border: "1px solid #08CB00",
            color: "#EEEEEE",
          },
          duration: 10000,
        })

        // Play notification sound
        try {
          const audio = new Audio("/notification.mp3")
          audio.volume = 0.5
          audio.play().catch(() => {})
        } catch {}
      }

      // Clear interval when event starts
      if (remaining.total <= 0) {
        clearInterval(interval)
        toast.info(`${eventTitle} has started!`, {
          style: {
            background: "#0a0a0a",
            border: "1px solid #08CB00",
            color: "#EEEEEE",
          },
          duration: 0,
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [eventDate, eventTitle, hasNotified])

  if (!timeRemaining) {
    return null
  }

  const isStartingSoon = timeRemaining.total > 0 && timeRemaining.total <= 60 * 60 * 1000 // 1 hour
  const hasStarted = timeRemaining.total <= 0

  // Calculate progress (assuming 30 days until event as 100%)
  const totalDuration = 30 * 24 * 60 * 60 * 1000
  const elapsed = totalDuration - timeRemaining.total
  const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

  // Compact view
  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className={cn("h-5 w-5", hasStarted ? "text-muted-foreground" : "text-primary")} />
          <div className="flex items-center gap-1">
            {timeRemaining.days > 0 && (
              <span className="text-sm font-medium text-foreground">
                {timeRemaining.days}d
              </span>
            )}
            <span className="text-sm font-medium text-foreground">
              {String(timeRemaining.hours).padStart(2, "0")}:
              {String(timeRemaining.minutes).padStart(2, "0")}:
              {String(timeRemaining.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
        {isStartingSoon && !hasStarted && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
            <Zap className="h-3 w-3" />
            Starting Soon
          </Badge>
        )}
        {hasStarted && (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            Live Now
          </Badge>
        )}
      </div>
    )
  }

  // Full view
  return (
    <Card className="p-6 bg-card border-border overflow-hidden relative">
      {/* Animated background effect for starting soon */}
      {isStartingSoon && !hasStarted && (
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
      )}

      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">{eventTitle}</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(eventDate).toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {new Date(eventDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {eventLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {eventLocation}
                </div>
              )}
            </div>
          </div>
          {isStartingSoon && !hasStarted && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-2 px-3 py-1">
              <Zap className="h-4 w-4 animate-pulse" />
              Starting Soon
            </Badge>
          )}
          {hasStarted && (
            <Badge className="bg-destructive gap-2 px-3 py-1 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white animate-ping absolute" />
              <div className="w-2 h-2 rounded-full bg-white" />
              Live Now
            </Badge>
          )}
        </div>

        {/* Countdown */}
        {!hasStarted ? (
          <>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Days", value: timeRemaining.days },
                { label: "Hours", value: timeRemaining.hours },
                { label: "Minutes", value: timeRemaining.minutes },
                { label: "Seconds", value: timeRemaining.seconds },
              ].map((unit) => (
                <div
                  key={unit.label}
                  className={cn(
                    "text-center p-4 rounded-xl border transition-all",
                    "bg-muted/30 border-border",
                    isStartingSoon && "bg-primary/5 border-primary/20",
                  )}
                >
                  <div
                    className={cn(
                      "text-4xl font-bold mb-1",
                      isStartingSoon ? "text-primary" : "text-foreground",
                    )}
                  >
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">{unit.label}</div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Until Event</span>
                <span className="text-foreground font-medium">{progressPercentage.toFixed(0)}% elapsed</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border-4 border-destructive/20 mb-4">
              <Zap className="h-10 w-10 text-destructive animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">Event is Live!</p>
            <p className="text-muted-foreground">Join the event now</p>
          </div>
        )}
      </div>
    </Card>
  )
}