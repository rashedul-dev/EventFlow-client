"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRealtimeSeats } from "@/lib/websocket/realtimeHooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Seat {
  id: string;
  row: string;
  number: string;
  label: string;
  status: "available" | "reserved" | "sold" | "blocked";
  price: number;
  section: string;
}

interface SeatMapProps {
  eventId: string;
  onSeatsSelected?: (seats: Seat[]) => void;
  maxSelection?: number;
}

export function SeatMap({ eventId, onSeatsSelected, maxSelection = 10 }: SeatMapProps) {
  const { seats, loading } = useRealtimeSeats(eventId);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Group seats by section and row
  const seatsBySection = seats.reduce((acc: any, seat: Seat) => {
    if (!acc[seat.section]) acc[seat.section] = {};
    if (!acc[seat.section][seat.row]) acc[seat.section][seat.row] = [];
    acc[seat.section][seat.row].push(seat);
    return acc;
  }, {});

  const handleSeatClick = useCallback(
    (seat: Seat) => {
      if (seat.status !== "available") {
        toast.error("This seat is not available", {
          style: {
            background: "#0a0a0a",
            border: "1px solid #dc2626",
            color: "#EEEEEE",
          },
        });
        return;
      }

      setSelectedSeats((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(seat.id)) {
          newSet.delete(seat.id);
        } else {
          if (newSet.size >= maxSelection) {
            toast.warning(`Maximum ${maxSelection} seats can be selected`, {
              style: {
                background: "#0a0a0a",
                border: "1px solid #f59e0b",
                color: "#EEEEEE",
              },
            });
            return prev;
          }
          newSet.add(seat.id);
        }
        return newSet;
      });
    },
    [maxSelection]
  );

  useEffect(() => {
    if (onSeatsSelected) {
      const selected = seats.filter((s: Seat) => selectedSeats.has(s.id));
      onSeatsSelected(selected);
    }
  }, [selectedSeats, seats, onSeatsSelected]);

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.has(seat.id)) {
      return "bg-[#dc2626] hover:bg-[#b91c1c] border-[#dc2626]";
    }
    switch (seat.status) {
      case "available":
        return "bg-[#08CB00] hover:bg-[#06a800] border-[#08CB00]";
      case "reserved":
      case "sold":
        return "bg-[#253900] border-[#253900] cursor-not-allowed opacity-50";
      case "blocked":
        return "bg-muted border-muted cursor-not-allowed opacity-30";
      default:
        return "bg-muted border-border";
    }
  };

  const totalPrice = seats
    .filter((s: Seat) => selectedSeats.has(s.id))
    .reduce((sum: number, seat: Seat) => sum + seat.price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#08CB00] border-2 border-[#08CB00]" />
            <span className="text-sm text-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#dc2626] border-2 border-[#dc2626]" />
            <span className="text-sm text-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#253900] border-2 border-[#253900] opacity-50" />
            <span className="text-sm text-foreground">Taken</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-muted border-2 border-muted opacity-30" />
            <span className="text-sm text-foreground">Blocked</span>
          </div>
        </div>
      </Card>

      {/* Stage */}
      <div className="relative">
        <div className="w-full h-16 bg-linear-to-b from-[#253900] to-[#253900]/50 rounded-t-2xl flex items-center justify-center">
          <span className="text-foreground font-semibold text-lg">STAGE</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-8">
        {Object.entries(seatsBySection).map(([section, rows]: [string, any]) => (
          <div key={section} className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{section}</h3>
            <div className="space-y-2">
              {Object.entries(rows).map(([row, rowSeats]: [string, any]) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-8 text-sm font-medium text-muted-foreground">{row}</span>
                  <div className="flex flex-wrap gap-2">
                    {rowSeats.map((seat: Seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        onMouseEnter={() => setHoveredSeat(seat.id)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={seat.status !== "available"}
                        className={cn(
                          "relative w-10 h-10 rounded border-2 transition-all duration-200",
                          "flex items-center justify-center text-xs font-medium",
                          "hover:scale-110 active:scale-95",
                          getSeatColor(seat),
                          seat.status === "available" ? "text-black" : "text-foreground/50"
                        )}
                        title={`${seat.label} - $${seat.price}`}
                      >
                        {seat.number}
                        {selectedSeats.has(seat.id) && (
                          <Check className="absolute -top-1 -right-1 h-4 w-4 text-white bg-[#dc2626] rounded-full p-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedSeats.size > 0 && (
        <Card className="p-6 bg-card border-primary/20 sticky bottom-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Selected Seats</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {selectedSeats.size} {selectedSeats.size === 1 ? "seat" : "seats"}
                </Badge>
                <span className="text-2xl font-bold text-foreground">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedSeats(new Set())} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
              <Button className="gap-2">
                <Check className="h-4 w-4" />
                Continue
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
