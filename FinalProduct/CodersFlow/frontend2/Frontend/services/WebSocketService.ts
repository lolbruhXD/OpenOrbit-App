import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

export interface PostUpdateEvent {
  postId: string;
  likesCount: number;
  isLiked: boolean;
}

export interface NewPostEvent {
  _id: string;
  title: string;
  language?: string;
  code?: string;
  summary?: string;
  tags: string[];
  media_url?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  likes: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostDeletedEvent {
  postId: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private isEnabled: boolean = false;

  enable(): void {
    this.isEnabled = true;
    this.connect();
  }

  disable(): void {
    this.isEnabled = false;
    this.disconnect();
  }

  connect(): void {
    if (!this.isEnabled) {
      console.log('WebSocket is disabled, skipping connection');
      return;
    }

    if (this.socket && this.isConnected) {
      return;
    }

    try {
      console.log('Attempting to connect to WebSocket:', API_CONFIG.WEBSOCKET_URL);
      
      this.socket = io(API_CONFIG.WEBSOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: false, // Disable auto-reconnection
        reconnectionAttempts: 0,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.joinFeedRoom();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from WebSocket server:', reason);
        this.isConnected = false;
        // Only attempt reconnect if enabled and not manually disconnected
        if (this.isEnabled && reason !== 'io client disconnect') {
          this.attemptReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.isConnected = false;
        if (this.isEnabled) {
          this.attemptReconnect();
        }
      });

      // Add timeout to prevent hanging connections
      setTimeout(() => {
        if (!this.isConnected && this.isEnabled) {
          console.log('WebSocket connection timeout, disabling real-time features');
          this.disconnect();
        }
      }, 15000);

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  private attemptReconnect(): void {
    if (!this.isEnabled) {
      console.log('WebSocket is disabled, skipping reconnection');
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(2000 * this.reconnectAttempts, 10000);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.isEnabled && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.connect();
        }
      }, delay);
    } else {
      console.log('Max reconnection attempts reached. Real-time features disabled.');
      this.disable(); // Disable WebSocket after max attempts
    }
  }

  private joinFeedRoom(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_feed');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listeners
  onNewPost(callback: (post: NewPostEvent) => void): void {
    if (this.socket) {
      this.socket.on('new_post', callback);
    }
  }

  onPostUpdated(callback: (post: NewPostEvent) => void): void {
    if (this.socket) {
      this.socket.on('post_updated', callback);
    }
  }

  onPostDeleted(callback: (data: PostDeletedEvent) => void): void {
    if (this.socket) {
      this.socket.on('post_deleted', callback);
    }
  }

  onPostLiked(callback: (data: PostUpdateEvent) => void): void {
    if (this.socket) {
      this.socket.on('post_liked', callback);
    }
  }

  // Remove event listeners
  offNewPost(callback?: (post: NewPostEvent) => void): void {
    if (this.socket) {
      this.socket.off('new_post', callback);
    }
  }

  offPostUpdated(callback?: (post: NewPostEvent) => void): void {
    if (this.socket) {
      this.socket.off('post_updated', callback);
    }
  }

  offPostDeleted(callback?: (data: PostDeletedEvent) => void): void {
    if (this.socket) {
      this.socket.off('post_deleted', callback);
    }
  }

  offPostLiked(callback?: (data: PostUpdateEvent) => void): void {
    if (this.socket) {
      this.socket.off('post_liked', callback);
    }
  }

  // Remove all listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.isEnabled;
  }

  isWebSocketEnabled(): boolean {
    return this.isEnabled;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
