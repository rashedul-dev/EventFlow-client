"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { ImageUpload } from "./image-upload"
import { SeatingChart } from "./seating-chart"

interface TicketType {
  id: string
  name: string
  price: string
  quantity: string
  description: string
}

const categories = [
  "Technology",
  "Business",
  "Music",
  "Sports",
  "Arts",
  "Food & Drink",
  "Health",
  "Education",
  "Networking",
  "Other",
]

export function CreateEventForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [eventImage, setEventImage] = useState<string | null>(null)
  const [hasSeating, setHasSeating] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    address: "",
    isOnline: false,
    onlineUrl: "",
    featured: false,
  })

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: "1", name: "General Admission", price: "", quantity: "", description: "" },
  ])

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", price: "", quantity: "", description: "" },
    ])
  }

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const updateTicketType = (id: string, field: keyof TicketType, value: string) => {
    setTicketTypes((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "published") => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const eventData = {
        ...formData,
        image: eventImage,
        hasSeating,
        startDate: `${formData.startDate}T${formData.startTime}:00Z`,
        endDate: `${formData.endDate}T${formData.endTime}:00Z`,
        status,
        ticketTypes: ticketTypes.map((t) => ({
          name: t.name,
          price: Number.parseFloat(t.price) || 0,
          quantity: Number.parseInt(t.quantity) || 0,
          description: t.description,
        })),
      }

      await api.events.create(eventData)
      router.push("/dashboard/organizer/events")
    } catch (err) {
      setError("Failed to create event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-8">
      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>}

      {/* Basic Info */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your event..."
              rows={6}
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Event Image</Label>
              <ImageUpload value={eventImage || undefined} onChange={setEventImage} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Date & Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData("startDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => updateFormData("startTime", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData("endDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => updateFormData("endTime", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Switch
              id="isOnline"
              checked={formData.isOnline}
              onCheckedChange={(checked) => updateFormData("isOnline", checked)}
            />
            <Label htmlFor="isOnline">This is an online event</Label>
          </div>

          {formData.isOnline ? (
            <div className="space-y-2">
              <Label htmlFor="onlineUrl">Event URL *</Label>
              <Input
                id="onlineUrl"
                type="url"
                placeholder="https://zoom.us/..."
                value={formData.onlineUrl}
                onChange={(e) => updateFormData("onlineUrl", e.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Venue Name *</Label>
                <Input
                  id="location"
                  placeholder="Convention Center"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Ticket Types</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ticket Type
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {ticketTypes.map((ticket, index) => (
            <div key={ticket.id} className="p-4 rounded-lg bg-background/50 border border-foreground/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/60">Ticket Type {index + 1}</span>
                {ticketTypes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTicketType(ticket.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Ticket Name *</Label>
                  <Input
                    placeholder="VIP, General, etc."
                    value={ticket.name}
                    onChange={(e) => updateTicketType(ticket.id, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={ticket.price}
                    onChange={(e) => updateTicketType(ticket.id, "price", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={ticket.quantity}
                    onChange={(e) => updateTicketType(ticket.id, "quantity", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="What's included with this ticket?"
                  value={ticket.description}
                  onChange={(e) => updateTicketType(ticket.id, "description", e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Seating Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Switch id="hasSeating" checked={hasSeating} onCheckedChange={setHasSeating} />
            <div>
              <Label htmlFor="hasSeating">Enable assigned seating</Label>
              <p className="text-sm text-foreground/60">Allow attendees to select specific seats</p>
            </div>
          </div>

          {hasSeating && (
            <div className="pt-4">
              <SeatingChart editable onSeatSelect={() => {}} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Additional Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => updateFormData("featured", checked)}
            />
            <div>
              <Label htmlFor="featured">Feature this event</Label>
              <p className="text-sm text-foreground/60">Featured events appear at the top of search results</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4 justify-end">
        <Button type="button" variant="outline" disabled={loading} onClick={(e) => handleSubmit(e, "draft")}>
          Save as Draft
        </Button>
        <Button type="submit" disabled={loading} onClick={(e) => handleSubmit(e, "published")}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish Event"
          )}
        </Button>
      </div>
    </form>
  )
}
