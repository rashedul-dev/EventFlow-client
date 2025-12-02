// TypeScript Types for EventFlow

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "ORGANIZER" | "ATTENDEE"

export type EventStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED"

export type TicketTypeCategory = "FREE" | "PAID" | "DONATION"

export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED" | "TRANSFERRED"

export type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED"

export type PaymentMethod = "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | "STRIPE"

export type NotificationType = "EMAIL" | "SMS" | "PUSH" | "IN_APP"

export type NotificationStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "READ"

export type WaitlistStatus = "WAITING" | "NOTIFIED" | "CONVERTED" | "EXPIRED" | "CANCELLED"

export type SeatStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "BLOCKED"

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  role: UserRole
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  lastLoginAt?: string
  organizationName?: string
  organizationDesc?: string
  website?: string
  socialLinks?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  startDate: string
  endDate: string
  timezone: string
  isVirtual: boolean
  venueName?: string
  venueAddress?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  virtualLink?: string
  virtualPlatform?: string
  coverImage?: string
  thumbnailImage?: string
  images?: string[]
  capacity?: number
  isPrivate: boolean
  requiresApproval: boolean
  ageRestriction?: number
  status: EventStatus
  rejectionReason?: string
  approvedAt?: string
  approvedBy?: string
  publishedAt?: string
  category?: string
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  organizerId: string
  organizer?: User
  ticketTypes?: TicketType[]
  createdAt: string
  updatedAt: string
}

export interface TicketType {
  id: string
  eventId: string
  name: string
  description?: string
  category: TicketTypeCategory
  price: number
  originalPrice?: number
  currency: string
  minDonation?: number
  maxDonation?: number
  quantity: number
  quantitySold: number
  maxPerOrder: number
  minPerOrder: number
  salesStartDate?: string
  salesEndDate?: string
  isVisible: boolean
  isTransferable: boolean
  hasSeating: boolean
  sectionId?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  ticketNumber: string
  ticketTypeId: string
  eventId: string
  userId: string
  paymentId?: string
  status: TicketStatus
  qrCode?: string
  barcode?: string
  attendeeName?: string
  attendeeEmail?: string
  attendeePhone?: string
  pricePaid: number
  currency: string
  seatId?: string
  checkedInAt?: string
  checkedInBy?: string
  originalUserId?: string
  transferredAt?: string
  createdAt: string
  updatedAt: string
  ticketType?: TicketType
  event?: Event
}

export interface Payment {
  id: string
  userId: string
  orderNumber: string
  status: PaymentStatus
  method: PaymentMethod
  subtotal: number
  discount: number
  taxAmount: number
  serviceFee: number
  totalAmount: number
  currency: string
  platformCommission: number
  platformCommissionPct: number
  organizerPayout: number
  payoutStatus?: string
  payoutDate?: string
  stripePaymentIntentId?: string
  stripeChargeId?: string
  stripeRefundId?: string
  refundAmount?: number
  refundReason?: string
  refundedAt?: string
  promoCode?: string
  promoDiscount?: number
  billingName?: string
  billingEmail?: string
  billingAddress?: Record<string, any>
  receiptUrl?: string
  invoiceNumber?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  tickets?: Ticket[]
}

export interface Notification {
  id: string
  userId: string
  eventId?: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  status: NotificationStatus
  channel?: string
  recipient?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failedAt?: string
  failureReason?: string
  retryCount: number
  nextRetryAt?: string
  scheduledFor?: string
  createdAt: string
  updatedAt: string
}

export interface WaitlistEntry {
  id: string
  eventId: string
  userId?: string
  email: string
  name?: string
  phone?: string
  ticketTypeId?: string
  quantity: number
  status: WaitlistStatus
  position: number
  notifiedAt?: string
  expiresAt?: string
  convertedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SeatingChart {
  id: string
  eventId: string
  name: string
  description?: string
  chartData: Record<string, any>
  totalSeats: number
  availableSeats: number
  width?: number
  height?: number
  isActive: boolean
  sections?: SeatingSection[]
  createdAt: string
  updatedAt: string
}

export interface SeatingSection {
  id: string
  chartId: string
  name: string
  description?: string
  color?: string
  capacity: number
  priceMultiplier: number
  positionData?: Record<string, any>
  sortOrder: number
  seats?: Seat[]
  createdAt: string
  updatedAt: string
}

export interface Seat {
  id: string
  sectionId: string
  row: string
  number: string
  label?: string
  status: SeatStatus
  priceOffset: number
  positionX?: number
  positionY?: number
  isAccessible: boolean
  isAisle: boolean
  createdAt: string
  updatedAt: string
}
