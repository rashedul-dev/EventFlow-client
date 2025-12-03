"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  TrendingUp,
} from "lucide-react";
import type { PendingEvent } from "./VerificationQueue";

interface EventReviewModalProps {
  event: PendingEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (eventId: string, comment?: string) => void;
  onReject: (eventId: string, reason: string) => void;
}

export function EventReviewModal({ event, open, onOpenChange, onApprove, onReject }: EventReviewModalProps) {
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!event || !reviewAction) return;

    if (reviewAction === "reject" && !comment.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsSubmitting(true);
    try {
      if (reviewAction === "approve") {
        await onApprove(event.id, comment || undefined);
        toast.success("Event approved successfully");
      } else {
        await onReject(event.id, comment);
        toast.success("Event rejected");
      }
      onOpenChange(false);
      setComment("");
      setReviewAction(null);
    } catch (error) {
      toast.error("Failed to process review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) return null;

  const complianceChecks = [
    { label: "Venue information complete", passed: true },
    { label: "Ticket pricing valid", passed: true },
    { label: "Event date is future", passed: true },
    { label: "Organizer verified", passed: event.organizer.approvalRate > 80 },
    { label: "Content policy compliant", passed: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Review: {event.title}</DialogTitle>
          <DialogDescription>Review event details and approve or reject the submission</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="organizer">Organizer</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Event Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {event.coverImage && (
              <div className="w-full h-64 rounded-lg overflow-hidden bg-muted">
                <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleTimeString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Venue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{event.venue}</p>
                  <p className="text-sm text-muted-foreground">See full address</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{event.capacity.toLocaleString()} attendees</p>
                  <p className="text-sm text-muted-foreground">Maximum capacity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Ticket Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    ${event.ticketPrice.min} - ${event.ticketPrice.max}
                  </p>
                  <p className="text-sm text-muted-foreground">Price range</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Event Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizer Tab */}
          <TabsContent value="organizer" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Organizer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={event.organizer.avatar} />
                    <AvatarFallback className="text-lg">{event.organizer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{event.organizer.name}</h3>
                    <p className="text-sm text-muted-foreground">{event.organizer.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold">{event.organizer.totalEvents}</p>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{event.organizer.approvalRate}%</p>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Previous Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Summer Music Festival 2024", status: "Completed", rating: 4.9 },
                    { name: "Tech Conference 2024", status: "Completed", rating: 4.7 },
                    { name: "Food & Wine Expo", status: "Completed", rating: 4.8 },
                  ].map((prevEvent, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{prevEvent.name}</p>
                        <p className="text-xs text-muted-foreground">{prevEvent.status}</p>
                      </div>
                      <Badge variant="outline">⭐ {prevEvent.rating}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Compliance Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceChecks.map((check, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${check.passed ? "bg-green-50" : "bg-red-50"}`}
                    >
                      {check.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium">{check.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Content Policy Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Event content has been automatically scanned and appears to comply with platform policies. No
                  prohibited content detected.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Submission Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Event submitted",
                      time: event.submittedAt,
                      user: event.organizer.name,
                    },
                    {
                      action: "Automated checks passed",
                      time: event.submittedAt,
                      user: "System",
                    },
                    {
                      action: "Assigned for review",
                      time: event.submittedAt,
                      user: "System",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.time).toLocaleString()} • {item.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Action Selection */}
        {!reviewAction && (
          <div className="flex gap-4 pt-4 border-t">
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setReviewAction("approve")}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Event
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => setReviewAction("reject")}>
              <XCircle className="w-4 h-4 mr-2" />
              Reject Event
            </Button>
          </div>
        )}

        {/* Comment/Reason Input */}
        {reviewAction && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {reviewAction === "approve" ? "Add Comment (Optional)" : "Rejection Reason *"}
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  reviewAction === "approve"
                    ? "Add any notes or recommendations..."
                    : "Explain why this event is being rejected..."
                }
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewAction(null);
                  setComment("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (reviewAction === "reject" && !comment.trim())}
                className={reviewAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isSubmitting ? "Processing..." : `Confirm ${reviewAction === "approve" ? "Approval" : "Rejection"}`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
