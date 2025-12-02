"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, SlidersHorizontal, MapPin, CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const categories = [
  "All Categories",
  "Music",
  "Technology",
  "Business",
  "Sports",
  "Arts",
  "Food & Drink",
  "Health",
  "Community",
  "Education",
]

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Free", value: "free" },
  { label: "Under $25", value: "0-25" },
  { label: "$25 - $50", value: "25-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100+", value: "100+" },
]

interface EventFiltersProps {
  onFilterChange?: (filters: any) => void
}

export function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [priceRange, setPriceRange] = useState("all")
  const [date, setDate] = useState<Date>()
  const [showVirtual, setShowVirtual] = useState(false)
  const [showInPerson, setShowInPerson] = useState(false)

  const hasActiveFilters = category !== "All Categories" || priceRange !== "all" || date || showVirtual || showInPerson

  const clearFilters = () => {
    setCategory("All Categories")
    setPriceRange("all")
    setDate(undefined)
    setShowVirtual(false)
    setShowInPerson(false)
  }

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative sm:w-64">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="City or location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="gap-2">
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[180px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>

        {/* Price */}
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* More Filters (Mobile Sheet) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <SlidersHorizontal className="w-4 h-4" />
              More Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <Label>Event Type</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="virtual"
                      checked={showVirtual}
                      onCheckedChange={(checked) => setShowVirtual(checked as boolean)}
                    />
                    <Label htmlFor="virtual" className="font-normal">
                      Virtual Events
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="in-person"
                      checked={showInPerson}
                      onCheckedChange={(checked) => setShowInPerson(checked as boolean)}
                    />
                    <Label htmlFor="in-person" className="font-normal">
                      In-Person Events
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Category</Label>
                <div className="space-y-3">
                  {categories.slice(1).map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <Checkbox
                        id={cat}
                        checked={category === cat}
                        onCheckedChange={(checked) => setCategory(checked ? cat : "All Categories")}
                      />
                      <Label htmlFor={cat} className="font-normal">
                        {cat}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                  Clear All Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
