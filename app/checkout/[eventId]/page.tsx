"use client"

import { useState, use } from "react"
import { cn } from "@/lib/utils"
import { TicketSelector } from "@/components/checkout/ticket-selector"
import { PaymentForm } from "@/components/checkout/payment-form"
import { OrderSuccess } from "@/components/checkout/order-success"
import { CalendarIntegration } from "@/components/checkout/calendar-integration"
import { ArrowLeft, Ticket, CreditCard, CheckCircle, Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import type { TicketType } from "@/lib/types"

// Mock data - replace with actual API call
const mockEvent = {
  id: "1",
  title: "TechConf 2025",
  slug: "techconf-2025",
  startDate: "2025-03-15T09:00:00Z",
  endDate: "2025-03-15T18:00:00Z",
  location: "San Francisco Convention Center",
  coverImage: "/tech-conference-stage.jpg",
  ticketTypes: [
    {
      id: "1",
      eventId: "1",
      name: "General Admission",
      description: "Access to all main conference sessions and networking areas",
      category: "PAID" as const,
      price: 199,
      originalPrice: 249,
      currency: "USD",
      quantity: 500,
      quantitySold: 342,
      maxPerOrder: 5,
      minPerOrder: 1,
      isVisible: true,
      isTransferable: true,
      hasSeating: false,
      sortOrder: 1,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "2",
      eventId: "1",
      name: "VIP Pass",
      description: "Premium access with front-row seating, VIP lounge, and meet & greet",
      category: "PAID" as const,
      price: 499,
      currency: "USD",
      quantity: 100,
      quantitySold: 87,
      maxPerOrder: 2,
      minPerOrder: 1,
      isVisible: true,
      isTransferable: true,
      hasSeating: true,
      sortOrder: 2,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "3",
      eventId: "1",
      name: "Student Ticket",
      description: "Discounted access for students with valid ID",
      category: "PAID" as const,
      price: 99,
      currency: "USD",
      quantity: 200,
      quantitySold: 200,
      maxPerOrder: 1,
      minPerOrder: 1,
      isVisible: true,
      isTransferable: false,
      hasSeating: false,
      sortOrder: 3,
      createdAt: "",
      updatedAt: "",
    },
  ] as TicketType[],
}

const steps = [
  { id: "select", title: "Select Tickets" },
  { id: "payment", title: "Payment" },
  { id: "confirmation", title: "Confirmation" },
]

export default function CheckoutPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTickets, setSelectedTickets] = useState<{ ticketTypeId: string; quantity: number }[]>([])
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState<{
    orderNumber: string
    tickets: any[]
  } | null>(null)

  const calculateTotal = () => {
    return selectedTickets.reduce((total, selection) => {
      const ticketType = mockEvent.ticketTypes.find((t) => t.id === selection.ticketTypeId)
      return total + (ticketType?.price || 0) * selection.quantity
    }, 0)
  }

  const handlePaymentSubmit = async (data: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock success
    const mockOrder = {
      orderNumber: `ORD-${Date.now()}`,
      tickets: selectedTickets.map((selection, index) => {
        const ticketType = mockEvent.ticketTypes.find((t) => t.id === selection.ticketTypeId)
        return {
          id: `ticket-${index}`,
          ticketNumber: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          eventTitle: mockEvent.title,
          eventDate: mockEvent.startDate,
          eventTime: "9:00 AM - 6:00 PM",
          eventLocation: mockEvent.location,
          ticketType: ticketType?.name || "General",
          attendeeName: data.billingName,
        }
      }),
    }

    setOrderData(mockOrder)
    setOrderComplete(true)
    setCurrentStep(2)

    return { success: true }
  }

  if (orderComplete && orderData) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <OrderSuccess orderNumber={orderData.orderNumber} tickets={orderData.tickets} />

          <div className="mt-12 p-6 rounded-2xl border border-secondary bg-black">
            <CalendarIntegration
              event={{
                title: mockEvent.title,
                description: `Your tickets for ${mockEvent.title}`,
                startDate: mockEvent.startDate,
                endDate: mockEvent.endDate,
                location: mockEvent.location,
              }}
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href={`/events/${mockEvent.slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>
                {steps.map((step, index) => {
                  const icons = [Ticket, CreditCard, CheckCircle]
                  const Icon = icons[index]
                  const isCompleted = index < currentStep
                  const isCurrent = index === currentStep

                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                          isCompleted && "bg-primary border-primary",
                          isCurrent && "border-primary bg-black",
                          !isCompleted && !isCurrent && "border-secondary bg-black",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isCompleted && "text-black",
                            isCurrent && "text-primary",
                            !isCompleted && !isCurrent && "text-muted-foreground",
                          )}
                        />
                      </div>
                      <span className={cn("text-sm font-medium", isCurrent ? "text-primary" : "text-muted-foreground")}>
                        {step.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6 rounded-2xl border border-secondary bg-black">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Select Your Tickets</h2>
                  <TicketSelector ticketTypes={mockEvent.ticketTypes} onSelectionChange={setSelectedTickets} />
                  <button
                    onClick={() => setCurrentStep(1)}
                    disabled={selectedTickets.length === 0}
                    className={cn(
                      "w-full py-4 rounded-xl font-semibold text-lg transition-all",
                      selectedTickets.length > 0
                        ? "bg-primary text-black hover:bg-primary/90"
                        : "bg-secondary text-muted-foreground cursor-not-allowed",
                    )}
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Payment Details</h2>
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit tickets
                    </button>
                  </div>
                  <PaymentForm amount={calculateTotal()} onSubmit={handlePaymentSubmit} />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 p-6 rounded-2xl border border-secondary bg-black">
              <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>

              {/* Event Info */}
              <div className="pb-4 mb-4 border-b border-secondary">
                <img
                  src={mockEvent.coverImage || "/placeholder.svg"}
                  alt={mockEvent.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-medium text-foreground">{mockEvent.title}</h4>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {new Date(mockEvent.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    9:00 AM - 6:00 PM
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {mockEvent.location}
                  </div>
                </div>
              </div>

              {/* Selected Tickets */}
              {selectedTickets.length > 0 ? (
                <div className="space-y-3 pb-4 mb-4 border-b border-secondary">
                  {selectedTickets.map((selection) => {
                    const ticketType = mockEvent.ticketTypes.find((t) => t.id === selection.ticketTypeId)
                    if (!ticketType) return null

                    return (
                      <div key={selection.ticketTypeId} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {ticketType.name} x{selection.quantity}
                        </span>
                        <span className="text-foreground">${(ticketType.price * selection.quantity).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground pb-4 mb-4 border-b border-secondary">No tickets selected</p>
              )}

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
