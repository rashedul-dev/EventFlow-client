// lib/api/transformers.ts
// Request/response transformers matching backend schema

import type { Event, User, Ticket, Payment, Notification, TicketType, SeatingChart, WaitlistEntry } from "@/lib/types";

// Date transformation utilities
export const DateTransformers = {
  toISO: (date: Date | string | null | undefined): string | undefined => {
    if (!date) return undefined;
    return date instanceof Date ? date.toISOString() : date;
  },

  fromISO: (dateString: string | null | undefined): Date | undefined => {
    if (!dateString) return undefined;
    return new Date(dateString);
  },

  toLocaleDateString: (date: Date | string): string => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString();
  },

  toLocalDateTimeString: (date: Date | string): string => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString();
  },
};

// Price transformers
export const PriceTransformers = {
  toCents: (dollars: number): number => {
    return Math.round(dollars * 100);
  },

  fromCents: (cents: number): number => {
    return cents / 100;
  },

  format: (amount: number, currency = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  },
};

// User transformers
export const UserTransformers = {
  toRequest: (user: Partial<User>) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    organizationName: user.organizationName,
    organizationDesc: user.organizationDesc,
    website: user.website,
    socialLinks: user.socialLinks,
  }),

  fromResponse: (data: any): User => ({
    id: data.id,
    email: data.email,
    firstName: data.firstName || data.first_name,
    lastName: data.lastName || data.last_name,
    phone: data.phone,
    avatar: data.avatar,
    role: data.role,
    isActive: data.isActive ?? data.is_active,
    isEmailVerified: data.isEmailVerified ?? data.is_email_verified,
    isPhoneVerified: data.isPhoneVerified ?? data.is_phone_verified,
    lastLoginAt: data.lastLoginAt || data.last_login_at,
    organizationName: data.organizationName || data.organization_name,
    organizationDesc: data.organizationDesc || data.organization_desc,
    website: data.website,
    socialLinks: data.socialLinks || data.social_links,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
  }),
};

// Event transformers
export const EventTransformers = {
  toRequest: (event: Partial<Event>) => ({
    title: event.title,
    slug: event.slug,
    description: event.description,
    shortDescription: event.shortDescription,
    startDate: DateTransformers.toISO(event.startDate),
    endDate: DateTransformers.toISO(event.endDate),
    timezone: event.timezone || "UTC",
    isVirtual: event.isVirtual ?? false,
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    city: event.city,
    state: event.state,
    country: event.country,
    postalCode: event.postalCode,
    latitude: event.latitude,
    longitude: event.longitude,
    virtualLink: event.virtualLink,
    virtualPlatform: event.virtualPlatform,
    coverImage: event.coverImage,
    thumbnailImage: event.thumbnailImage,
    images: event.images,
    capacity: event.capacity,
    isPrivate: event.isPrivate ?? false,
    requiresApproval: event.requiresApproval ?? false,
    ageRestriction: event.ageRestriction,
    category: event.category,
    tags: event.tags,
    metaTitle: event.metaTitle,
    metaDescription: event.metaDescription,
  }),

  fromResponse: (data: any): Event => ({
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    shortDescription: data.shortDescription || data.short_description,
    startDate: data.startDate || data.start_date,
    endDate: data.endDate || data.end_date,
    timezone: data.timezone || "UTC",
    isVirtual: data.isVirtual ?? data.is_virtual ?? false,
    venueName: data.venueName || data.venue_name,
    venueAddress: data.venueAddress || data.venue_address,
    city: data.city,
    state: data.state,
    country: data.country,
    postalCode: data.postalCode || data.postal_code,
    latitude: data.latitude,
    longitude: data.longitude,
    virtualLink: data.virtualLink || data.virtual_link,
    virtualPlatform: data.virtualPlatform || data.virtual_platform,
    coverImage: data.coverImage || data.cover_image,
    thumbnailImage: data.thumbnailImage || data.thumbnail_image,
    images: data.images,
    capacity: data.capacity,
    isPrivate: data.isPrivate ?? data.is_private ?? false,
    requiresApproval: data.requiresApproval ?? data.requires_approval ?? false,
    ageRestriction: data.ageRestriction || data.age_restriction,
    status: data.status,
    rejectionReason: data.rejectionReason || data.rejection_reason,
    approvedAt: data.approvedAt || data.approved_at,
    approvedBy: data.approvedBy || data.approved_by,
    publishedAt: data.publishedAt || data.published_at,
    category: data.category,
    tags: data.tags,
    metaTitle: data.metaTitle || data.meta_title,
    metaDescription: data.metaDescription || data.meta_description,
    organizerId: data.organizerId || data.organizer_id,
    organizer: data.organizer ? UserTransformers.fromResponse(data.organizer) : undefined,
    ticketTypes: data.ticketTypes?.map(TicketTypeTransformers.fromResponse),
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
  }),
};

// Ticket Type transformers
export const TicketTypeTransformers = {
  toRequest: (ticketType: Partial<TicketType>) => ({
    eventId: ticketType.eventId,
    name: ticketType.name,
    description: ticketType.description,
    category: ticketType.category,
    price: ticketType.price,
    originalPrice: ticketType.originalPrice,
    currency: ticketType.currency || "USD",
    minDonation: ticketType.minDonation,
    maxDonation: ticketType.maxDonation,
    quantity: ticketType.quantity,
    maxPerOrder: ticketType.maxPerOrder,
    minPerOrder: ticketType.minPerOrder,
    salesStartDate: DateTransformers.toISO(ticketType.salesStartDate),
    salesEndDate: DateTransformers.toISO(ticketType.salesEndDate),
    isVisible: ticketType.isVisible ?? true,
    isTransferable: ticketType.isTransferable ?? true,
    hasSeating: ticketType.hasSeating ?? false,
    sectionId: ticketType.sectionId,
    sortOrder: ticketType.sortOrder || 0,
  }),

  fromResponse: (data: any): TicketType => ({
    id: data.id,
    eventId: data.eventId || data.event_id,
    name: data.name,
    description: data.description,
    category: data.category,
    price: typeof data.price === "string" ? parseFloat(data.price) : data.price,
    originalPrice:
      data.originalPrice || data.original_price ? parseFloat(data.originalPrice || data.original_price) : undefined,
    currency: data.currency || "USD",
    minDonation: data.minDonation || data.min_donation,
    maxDonation: data.maxDonation || data.max_donation,
    quantity: data.quantity,
    quantitySold: data.quantitySold || data.quantity_sold || 0,
    maxPerOrder: data.maxPerOrder || data.max_per_order || 10,
    minPerOrder: data.minPerOrder || data.min_per_order || 1,
    salesStartDate: data.salesStartDate || data.sales_start_date,
    salesEndDate: data.salesEndDate || data.sales_end_date,
    isVisible: data.isVisible ?? data.is_visible ?? true,
    isTransferable: data.isTransferable ?? data.is_transferable ?? true,
    hasSeating: data.hasSeating ?? data.has_seating ?? false,
    sectionId: data.sectionId || data.section_id,
    sortOrder: data.sortOrder || data.sort_order || 0,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
  }),
};

// Ticket transformers
export const TicketTransformers = {
  fromResponse: (data: any): Ticket => ({
    id: data.id,
    ticketNumber: data.ticketNumber || data.ticket_number,
    ticketTypeId: data.ticketTypeId || data.ticket_type_id,
    eventId: data.eventId || data.event_id,
    userId: data.userId || data.user_id,
    paymentId: data.paymentId || data.payment_id,
    status: data.status,
    qrCode: data.qrCode || data.qr_code,
    barcode: data.barcode,
    attendeeName: data.attendeeName || data.attendee_name,
    attendeeEmail: data.attendeeEmail || data.attendee_email,
    attendeePhone: data.attendeePhone || data.attendee_phone,
    pricePaid: typeof data.pricePaid === "string" ? parseFloat(data.pricePaid) : data.pricePaid || 0,
    currency: data.currency || "USD",
    seatId: data.seatId || data.seat_id,
    checkedInAt: data.checkedInAt || data.checked_in_at,
    checkedInBy: data.checkedInBy || data.checked_in_by,
    originalUserId: data.originalUserId || data.original_user_id,
    transferredAt: data.transferredAt || data.transferred_at,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
    ticketType: data.ticketType ? TicketTypeTransformers.fromResponse(data.ticketType) : undefined,
    event: data.event ? EventTransformers.fromResponse(data.event) : undefined,
  }),
};

// Payment transformers
export const PaymentTransformers = {
  fromResponse: (data: any): Payment => ({
    id: data.id,
    userId: data.userId || data.user_id,
    orderNumber: data.orderNumber || data.order_number,
    status: data.status,
    method: data.method,
    subtotal: typeof data.subtotal === "string" ? parseFloat(data.subtotal) : data.subtotal,
    discount: typeof data.discount === "string" ? parseFloat(data.discount) : data.discount || 0,
    taxAmount: typeof data.taxAmount === "string" ? parseFloat(data.taxAmount) : data.taxAmount || 0,
    serviceFee: typeof data.serviceFee === "string" ? parseFloat(data.serviceFee) : data.serviceFee || 0,
    totalAmount: typeof data.totalAmount === "string" ? parseFloat(data.totalAmount) : data.totalAmount,
    currency: data.currency || "USD",
    platformCommission:
      typeof data.platformCommission === "string" ? parseFloat(data.platformCommission) : data.platformCommission || 0,
    platformCommissionPct:
      typeof data.platformCommissionPct === "string"
        ? parseFloat(data.platformCommissionPct)
        : data.platformCommissionPct || 0,
    organizerPayout:
      typeof data.organizerPayout === "string" ? parseFloat(data.organizerPayout) : data.organizerPayout || 0,
    payoutStatus: data.payoutStatus || data.payout_status,
    payoutDate: data.payoutDate || data.payout_date,
    stripePaymentIntentId: data.stripePaymentIntentId || data.stripe_payment_intent_id,
    stripeChargeId: data.stripeChargeId || data.stripe_charge_id,
    stripeRefundId: data.stripeRefundId || data.stripe_refund_id,
    refundAmount:
      data.refundAmount || data.refund_amount
        ? typeof data.refundAmount === "string"
          ? parseFloat(data.refundAmount)
          : data.refundAmount
        : undefined,
    refundReason: data.refundReason || data.refund_reason,
    refundedAt: data.refundedAt || data.refunded_at,
    promoCode: data.promoCode || data.promo_code,
    promoDiscount:
      data.promoDiscount || data.promo_discount
        ? typeof data.promoDiscount === "string"
          ? parseFloat(data.promoDiscount)
          : data.promoDiscount
        : undefined,
    billingName: data.billingName || data.billing_name,
    billingEmail: data.billingEmail || data.billing_email,
    billingAddress: data.billingAddress || data.billing_address,
    receiptUrl: data.receiptUrl || data.receipt_url,
    invoiceNumber: data.invoiceNumber || data.invoice_number,
    completedAt: data.completedAt || data.completed_at,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
    tickets: data.tickets?.map(TicketTransformers.fromResponse),
  }),
};

// Notification transformers
export const NotificationTransformers = {
  fromResponse: (data: any): Notification => ({
    id: data.id,
    userId: data.userId || data.user_id,
    eventId: data.eventId || data.event_id,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data,
    status: data.status,
    channel: data.channel,
    recipient: data.recipient,
    sentAt: data.sentAt || data.sent_at,
    deliveredAt: data.deliveredAt || data.delivered_at,
    readAt: data.readAt || data.read_at,
    failedAt: data.failedAt || data.failed_at,
    failureReason: data.failureReason || data.failure_reason,
    retryCount: data.retryCount || data.retry_count || 0,
    nextRetryAt: data.nextRetryAt || data.next_retry_at,
    scheduledFor: data.scheduledFor || data.scheduled_for,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
  }),
};

// Response envelope transformer
export function transformApiResponse<T>(
  data: any,
  transformer?: (item: any) => T
): {
  data: T | T[];
  meta?: any;
  success: boolean;
} {
  // Handle different response formats
  if (data.data !== undefined) {
    // Format: { success: true, data: {...}, meta: {...} }
    const transformed = transformer
      ? Array.isArray(data.data)
        ? data.data.map(transformer)
        : transformer(data.data)
      : data.data;

    return {
      data: transformed,
      meta: data.meta,
      success: data.success ?? true,
    };
  }

  // Direct data format
  const transformed = transformer ? (Array.isArray(data) ? data.map(transformer) : transformer(data)) : data;

  return {
    data: transformed,
    success: true,
  };
}

// Request payload validator
export function validatePayload<T>(payload: T, requiredFields: (keyof T)[]): boolean {
  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null) {
      console.error(`Missing required field: ${String(field)}`);
      return false;
    }
  }
  return true;
}
