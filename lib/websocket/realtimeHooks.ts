"use client";

// lib/websocket/realtimeHooks.ts
// Custom React hooks for real-time data subscriptions

import { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { wsManager, ConnectionState } from "./websocketManager";
import { subscriptionService, Channel } from "./subscriptionService";
import { queryKeys } from "@/lib/api/hooks";

// Hook for WebSocket connection state
export function useWebSocketState() {
  const [state, setState] = useState<ConnectionState>(wsManager.getState());

  useEffect(() => {
    const unsubscribe = wsManager.onStateChange(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    isConnected: state === ConnectionState.CONNECTED,
    isConnecting: state === ConnectionState.CONNECTING,
    isReconnecting: state === ConnectionState.RECONNECTING,
    isDisconnected: state === ConnectionState.DISCONNECTED,
    hasError: state === ConnectionState.ERROR,
  };
}

// Hook for real-time seat availability
export function useRealtimeSeats(eventId: string) {
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!eventId) return;

    const subscription = subscriptionService.subscribeToSeats(eventId, (data) => {
      setSeats(data.seats);
      setLoading(false);

      // Update React Query cache
      queryClient.setQueryData(queryKeys.events.seats(eventId), { data: data.seats });
    });

    return () => subscription.unsubscribe();
  }, [eventId, queryClient]);

  return { seats, loading };
}

// Hook for real-time waitlist position
export function useRealtimeWaitlist(eventId: string) {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!eventId) return;

    const subscription = subscriptionService.subscribeToWaitlist(eventId, (data) => {
      setWaitlist(data.waitlist);
      if (data.myPosition !== undefined) {
        setMyPosition(data.myPosition);
      }

      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ["waitlist", eventId] });
    });

    return () => subscription.unsubscribe();
  }, [eventId, queryClient]);

  return { waitlist, myPosition };
}

// Hook for real-time notifications
export function useRealtimeNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const subscription = subscriptionService.subscribeToNotifications(userId, (data) => {
      if (data.type === "new") {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Play notification sound (optional)
        if (data.notification.playSound) {
          playNotificationSound();
        }
      } else if (data.type === "read") {
        setNotifications((prev) => prev.map((n) => (n.id === data.notificationId ? { ...n, readAt: new Date() } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    });

    return () => subscription.unsubscribe();
  }, [userId, queryClient]);

  const markAsRead = useCallback((notificationId: string) => {
    wsManager.emit("notification:read", { notificationId });
  }, []);

  return { notifications, unreadCount, markAsRead };
}

// Hook for real-time dashboard stats
export function useRealtimeDashboard(organizerId?: string) {
  const [stats, setStats] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    if (!organizerId) return;

    // Subscribe to dashboard stats
    const statsSubscription = subscriptionService.subscribeToDashboard(organizerId, (data) => {
      setStats(data.stats);
    });

    // Subscribe to sales updates
    const salesSubscription = subscriptionService.subscribeToSales(organizerId, (data) => {
      if (data.type === "new_sale") {
        setRecentSales((prev) => [data.sale, ...prev.slice(0, 9)]); // Keep last 10
      }
    });

    return () => {
      statsSubscription.unsubscribe();
      salesSubscription.unsubscribe();
    };
  }, [organizerId]);

  return { stats, recentSales };
}

// Hook for real-time chat
export function useRealtimeChat(chatId: string, type: "support" | "event" = "support") {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const channel = type === "support" ? Channel.SUPPORT_CHAT : Channel.EVENT_CHAT;
    const subscription = subscriptionService.subscribe(
      channel,
      (data) => {
        if (data.type === "message") {
          setMessages((prev) => [...prev, data.message]);
          // Auto-scroll to bottom
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } else if (data.type === "typing") {
          if (data.isTyping) {
            setTypingUsers((prev) => [...new Set([...prev, data.userId])]);
          } else {
            setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
          }
        }
      },
      chatId
    );

    return () => subscription.unsubscribe();
  }, [chatId, type]);

  const sendMessage = useCallback(
    (content: string) => {
      wsManager.emit("chat:message", { chatId, content });
    },
    [chatId]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      wsManager.emit("chat:typing", { chatId, isTyping });
    },
    [chatId]
  );

  return { messages, typingUsers, sendMessage, sendTyping, messagesEndRef };
}

// Hook for real-time event updates
export function useRealtimeEvent(eventId: string) {
  const [event, setEvent] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!eventId) return;

    const subscription = subscriptionService.subscribeToEvent(eventId, (data) => {
      setEvent(data.event);

      // Update React Query cache
      queryClient.setQueryData(queryKeys.events.byId(eventId), { data: data.event });
    });

    return () => subscription.unsubscribe();
  }, [eventId, queryClient]);

  return { event };
}

// Hook for optimistic updates
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    (queryKey: any[], updater: (old: any) => any) => {
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, updater);

      return () => {
        queryClient.setQueryData(queryKey, previousData);
      };
    },
    [queryClient]
  );

  return optimisticUpdate;
}

// Utility: Play notification sound
function playNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {
      // User hasn't interacted with page yet, ignore
    });
  } catch (error) {
    console.warn("Failed to play notification sound:", error);
  }
}

// Export all hooks
export default {
  useWebSocketState,
  useRealtimeSeats,
  useRealtimeWaitlist,
  useRealtimeNotifications,
  useRealtimeDashboard,
  useRealtimeChat,
  useRealtimeEvent,
  useOptimisticUpdate,
};
