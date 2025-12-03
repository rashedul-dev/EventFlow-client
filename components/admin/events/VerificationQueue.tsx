"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, MapPin, Users, DollarSign, Clock, CheckCircle2, XCircle, Eye, Filter, Search } from "lucide-react";

export interface PendingEvent {
  id: string;
  title: string;
  organizer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    totalEvents: number;
    approvalRate: number;
  };
  date: string;
  venue: string;
  capacity: number;
  ticketPrice: {
    min: number;
    max: number;
  };
  category: string;
  submittedAt: string;
  coverImage?: string;
}

interface VerificationQueueProps {
  events: PendingEvent[];
  isLoading?: boolean;
  onReview: (event: PendingEvent) => void;
  onQuickApprove: (eventId: string) => void;
  onQuickReject: (eventId: string) => void;
  onRefresh: () => void;
}

export function VerificationQueue({
  events,
  isLoading,
  onReview,
  onQuickApprove,
  onQuickReject,
  onRefresh,
}: VerificationQueueProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "capacity">("newest");

  const filteredEvents = events
    .filter((event) => {
      const matchesCategory = filterCategory === "all" || event.category === filterCategory;
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      } else {
        return b.capacity - a.capacity;
      }
    });

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Conference">Conference</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Festival">Festival</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="capacity">Largest Capacity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Events awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Review Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground mt-1">Average response time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading events...</p>
            </CardContent>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pending events found</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row">
                {/* Event Image */}
                {event.coverImage && (
                  <div className="md:w-64 h-48 md:h-auto bg-muted relative">
                    <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                    <Badge className="absolute top-3 left-3 bg-orange-500">Pending Review</Badge>
                  </div>
                )}

                {/* Event Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={event.organizer.avatar} />
                          <AvatarFallback>{event.organizer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{event.organizer.name}</span>
                            <span>•</span>
                            <span>{event.organizer.totalEvents} events</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {event.organizer.approvalRate}% approval rate
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Event Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{event.capacity.toLocaleString()} capacity</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>
                            ${event.ticketPrice.min} - ${event.ticketPrice.max}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{event.category}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Submitted {getTimeAgo(event.submittedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => onReview(event)} className="whitespace-nowrap">
                        <Eye className="w-4 h-4 mr-2" />
                        Full Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuickApprove(event.id)}
                        className="text-green-600 border-green-600 hover:bg-green-50 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Quick Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuickReject(event.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50 whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Quick Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
