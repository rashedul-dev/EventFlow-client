// lib/websocket/websocketManager.ts
// WebSocket connection management with auto-reconnect

import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

export enum ConnectionState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
  ERROR = "ERROR",
}

export interface WebSocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  heartbeatInterval?: number;
}

interface MessageHandler {
  event: string;
  handler: (data: any) => void;
}

const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  url: process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001",
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  heartbeatInterval: 30000,
};

class WebSocketManager {
  private socket: Socket | null = null;
  private config: Required<WebSocketConfig>;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private messageHandlers = new Map<string, Set<(data: any) => void>>();
  private stateListeners = new Set<(state: ConnectionState) => void>();
  private reconnectAttempt = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Connect to WebSocket server
  connect(token?: string) {
    if (this.socket?.connected) {
      console.log("[WebSocket] Already connected");
      return;
    }

    this.isManualDisconnect = false;
    this.setState(ConnectionState.CONNECTING);

    const socketOptions = {
      auth: token ? { token } : undefined,
      reconnection: false, // We'll handle reconnection manually
      transports: ["websocket", "polling"],
    };

    this.socket = io(this.config.url, socketOptions);

    this.setupEventHandlers();

    if (process.env.NODE_ENV === "development") {
      console.log("[WebSocket] Connecting to:", this.config.url);
    }
  }

  // Disconnect from WebSocket server
  disconnect() {
    this.isManualDisconnect = true;
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.setState(ConnectionState.DISCONNECTED);
    console.log("[WebSocket] Disconnected");
  }

  // Setup event handlers
  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[WebSocket] Connected:", this.socket?.id);
      this.reconnectAttempt = 0;
      this.setState(ConnectionState.CONNECTED);
      this.startHeartbeat();

      toast.success("Connected", {
        style: {
          background: "#0a0a0a",
          border: "1px solid #08CB00",
          color: "#EEEEEE",
        },
        duration: 2000,
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[WebSocket] Disconnected:", reason);
      this.stopHeartbeat();
      this.setState(ConnectionState.DISCONNECTED);

      if (!this.isManualDisconnect) {
        toast.warning("Connection lost", {
          style: {
            background: "#0a0a0a",
            border: "1px solid #f59e0b",
            color: "#EEEEEE",
          },
          duration: 3000,
        });

        this.attemptReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
      this.setState(ConnectionState.ERROR);
      this.attemptReconnect();
    });

    this.socket.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
      this.setState(ConnectionState.ERROR);
    });

    // Pong response
    this.socket.on("pong", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[WebSocket] Pong received");
      }
    });
  }

  // Attempt reconnection with exponential backoff
  private attemptReconnect() {
    if (this.isManualDisconnect) return;
    if (this.reconnectAttempt >= this.config.reconnectionAttempts) {
      console.error("[WebSocket] Max reconnection attempts reached");
      toast.error("Unable to connect. Please refresh the page.", {
        style: {
          background: "#0a0a0a",
          border: "1px solid #dc2626",
          color: "#EEEEEE",
        },
        duration: 0, // Stay until dismissed
      });
      return;
    }

    this.reconnectAttempt++;
    this.setState(ConnectionState.RECONNECTING);

    const delay = Math.min(
      this.config.reconnectionDelay * Math.pow(2, this.reconnectAttempt - 1),
      this.config.reconnectionDelayMax
    );

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt})`);

    setTimeout(() => {
      if (!this.isManualDisconnect) {
        this.connect();
      }
    }, delay);
  }

  // Subscribe to events
  on(event: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());

      // Register with socket
      if (this.socket) {
        this.socket.on(event, (data) => {
          const handlers = this.messageHandlers.get(event);
          if (handlers) {
            handlers.forEach((h) => h(data));
          }
        });
      }
    }

    this.messageHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(event);
          if (this.socket) {
            this.socket.off(event);
          }
        }
      }
    };
  }

  // Emit events
  emit(event: string, data?: any) {
    if (!this.socket?.connected) {
      console.warn("[WebSocket] Cannot emit, not connected");
      return false;
    }

    this.socket.emit(event, data);
    return true;
  }

  // Subscribe to connection state changes
  onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  // Set connection state
  private setState(state: ConnectionState) {
    if (this.state === state) return;

    this.state = state;
    this.stateListeners.forEach((listener) => listener(state));
  }

  // Start heartbeat
  private startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("ping");
      }
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Get current state
  getState(): ConnectionState {
    return this.state;
  }

  // Check if connected
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED && this.socket?.connected === true;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Join a room/channel
  joinRoom(room: string) {
    if (!this.socket?.connected) {
      console.warn("[WebSocket] Cannot join room, not connected");
      return false;
    }

    this.socket.emit("join", { room });
    console.log(`[WebSocket] Joined room: ${room}`);
    return true;
  }

  // Leave a room/channel
  leaveRoom(room: string) {
    if (!this.socket?.connected) {
      console.warn("[WebSocket] Cannot leave room, not connected");
      return false;
    }

    this.socket.emit("leave", { room });
    console.log(`[WebSocket] Left room: ${room}`);
    return true;
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

// Auto-connect if token exists
if (typeof window !== "undefined") {
  const token = localStorage.getItem("accessToken");
  if (token) {
    wsManager.connect(token);
  }
}

export default wsManager;
