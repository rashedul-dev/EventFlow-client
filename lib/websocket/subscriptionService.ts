// lib/websocket/subscriptionService.ts
// Channel and subscription management for real-time features

import { wsManager } from "./websocketManager";

export enum Channel {
  // Event channels
  EVENT_UPDATES = "event:updates",
  SEAT_AVAILABILITY = "seat:availability",
  WAITLIST_UPDATES = "waitlist:updates",

  // User channels
  USER_NOTIFICATIONS = "user:notifications",
  USER_MESSAGES = "user:messages",

  // Dashboard channels
  DASHBOARD_STATS = "dashboard:stats",
  SALES_UPDATES = "sales:updates",

  // Chat channels
  SUPPORT_CHAT = "support:chat",
  EVENT_CHAT = "event:chat",

  // Admin channels
  ADMIN_ALERTS = "admin:alerts",
}

export interface Subscription {
  channel: Channel | string;
  room?: string;
  handler: (data: any) => void;
  unsubscribe: () => void;
}

class SubscriptionService {
  private subscriptions = new Map<string, Subscription>();

  // Subscribe to a channel
  subscribe(channel: Channel | string, handler: (data: any) => void, room?: string): Subscription {
    const subId = this.generateSubId(channel, room);

    // Check if already subscribed
    if (this.subscriptions.has(subId)) {
      console.warn(`[Subscription] Already subscribed to ${channel}${room ? `:${room}` : ""}`);
      return this.subscriptions.get(subId)!;
    }

    // Subscribe to WebSocket event
    const unsubscribeWs = wsManager.on(channel, handler);

    // Join room if specified
    if (room) {
      const fullRoom = `${channel}:${room}`;
      wsManager.joinRoom(fullRoom);
    }

    const subscription: Subscription = {
      channel,
      room,
      handler,
      unsubscribe: () => this.unsubscribe(subId),
    };

    this.subscriptions.set(subId, subscription);

    console.log(`[Subscription] Subscribed to ${channel}${room ? `:${room}` : ""}`);

    return subscription;
  }

  // Unsubscribe from a channel
  private unsubscribe(subId: string) {
    const subscription = this.subscriptions.get(subId);
    if (!subscription) return;

    // Leave room if it was specified
    if (subscription.room) {
      const fullRoom = `${subscription.channel}:${subscription.room}`;
      wsManager.leaveRoom(fullRoom);
    }

    this.subscriptions.delete(subId);

    console.log(
      `[Subscription] Unsubscribed from ${subscription.channel}${subscription.room ? `:${subscription.room}` : ""}`
    );
  }

  // Subscribe to event updates
  subscribeToEvent(eventId: string, handler: (data: any) => void): Subscription {
    return this.subscribe(Channel.EVENT_UPDATES, handler, eventId);
  }

  // Subscribe to seat availability
  subscribeToSeats(eventId: string, handler: (data: any) => void): Subscription {
    return this.subscribe(Channel.SEAT_AVAILABILITY, handler, eventId);
  }

  // Subscribe to waitlist updates
  subscribeToWaitlist(eventId: string, handler: (data: any) => void): Subscription {
    return this.subscribe(Channel.WAITLIST_UPDATES, handler, eventId);
  }

  // Subscribe to user notifications
  subscribeToNotifications(userId: string, handler: (data: any) => void): Subscription {
    return this.subscribe(Channel.USER_NOTIFICATIONS, handler, userId);
  }

  // Subscribe to user messages
  subscribeToMessages(userId: string, handler: (data: any) => void): Subscription {
    return this.subscribe(Channel.USER_MESSAGES, handler, userId);
  }

  // Subscribe to dashboard stats
  subscribeToDashboard(organizerId: string, handler: (data: any) => void): Subscription {
    return this.subscribe(Channel.DASHBOARD_STATS, handler, organizerId);
  }

  // Subscribe to sales updates
  subscribeToSales(organizerId: string, handler: (data: any) => void): Subscription {
    return this.subscribe(Channel.SALES_UPDATES, handler, organizerId);
  }

  // Subscribe to support chat
  subscribeToSupportChat(chatId: string, handler: (data: any) => void): Subscription {
    return this.subscribe(Channel.SUPPORT_CHAT, handler, chatId);
  }

  // Subscribe to event chat
  subscribeToEventChat(eventId: string, handler: (data: any) => void): Subscription {
    return this.subscribe(Channel.EVENT_CHAT, handler, eventId);
  }

  // Unsubscribe from all
  unsubscribeAll() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
  }

  // Generate subscription ID
  private generateSubId(channel: string, room?: string): string {
    return room ? `${channel}:${room}` : channel;
  }

  // Get active subscriptions
  getActiveSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  // Check if subscribed
  isSubscribed(channel: Channel | string, room?: string): boolean {
    const subId = this.generateSubId(channel, room);
    return this.subscriptions.has(subId);
  }
}

// Singleton instance
export const subscriptionService = new SubscriptionService();

export default subscriptionService;
