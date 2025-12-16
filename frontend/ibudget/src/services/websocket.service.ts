import { Injectable, OnDestroy } from '@angular/core';
import { Client, StompSubscription, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { Notification } from '../models/user.model';

/**
 * WebSocket service for real-time notification delivery.
 * Uses STOMP protocol over SockJS for browser compatibility.
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private notificationSubscription: StompSubscription | null = null;
  private countSubscription: StompSubscription | null = null;
  
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private notificationSubject = new Subject<Notification>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: number | null = null;
  
  /** Observable for connection status */
  public connectionStatus$ = this.connectionStatus.asObservable();
  
  /** Observable for incoming notifications */
  public notification$ = this.notificationSubject.asObservable();

  constructor() {}

  /**
   * Connect to the WebSocket server and subscribe to user notifications.
   * @param userId The current user's ID for subscribing to user-specific queue
   */
  connect(userId: number): void {
    if (this.client?.active) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    this.userId = userId;
    this.reconnectAttempts = 0;

    this.client = new Client({
      // Use SockJS for browser compatibility
      webSocketFactory: () => new SockJS(environment.wsUrl),
      
      // Debug logging (disable in production)
      debug: (str) => {
        if (!environment.production) {
          console.log('STOMP:', str);
        }
      },
      
      // Reconnection settings
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log('✅ WebSocket connected successfully');
        this.connectionStatus.next(true);
        this.reconnectAttempts = 0;
        this.subscribeToNotifications(userId);
      },

      onDisconnect: () => {
        console.log('❌ WebSocket disconnected');
        this.connectionStatus.next(false);
        this.cleanupSubscriptions();
      },

      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
        console.error('Details:', frame.body);
        this.connectionStatus.next(false);
      },

      onWebSocketError: (event) => {
        console.error('❌ WebSocket error:', event);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn('⚠️ Max reconnection attempts reached. Stopping reconnection.');
          this.client?.deactivate();
        }
      }
    });

    console.log('🔌 Connecting to WebSocket...');
    this.client.activate();
  }

  /**
   * Subscribe to user-specific notification queue.
   */
  private subscribeToNotifications(userId: number): void {
    if (!this.client) return;

    // Subscribe to user-specific notifications
    // The backend sends to /user/{userId}/queue/notifications
    // STOMP client subscribes to /user/queue/notifications (userId is handled by Spring)
    this.notificationSubscription = this.client.subscribe(
      `/user/${userId}/queue/notifications`,
      (message: IMessage) => {
        try {
          const notification: Notification = JSON.parse(message.body);
          console.log('📬 Received notification via WebSocket:', notification.title);
          this.notificationSubject.next(notification);
        } catch (error) {
          console.error('❌ Error parsing notification:', error);
        }
      }
    );

    console.log(`📡 Subscribed to notifications for user ${userId}`);

    // Optional: Subscribe to unread count updates
    this.countSubscription = this.client.subscribe(
      `/user/${userId}/queue/notifications/count`,
      (message: IMessage) => {
        try {
          const count = JSON.parse(message.body);
          console.log('🔢 Unread count update:', count);
          // This could be used to update a badge without fetching all notifications
        } catch (error) {
          console.error('❌ Error parsing count:', error);
        }
      }
    );
  }

  /**
   * Disconnect from WebSocket server and cleanup subscriptions.
   */
  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket...');
    this.cleanupSubscriptions();
    
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    
    this.connectionStatus.next(false);
    this.userId = null;
  }

  /**
   * Clean up STOMP subscriptions.
   */
  private cleanupSubscriptions(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      this.notificationSubscription = null;
    }
    
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
      this.countSubscription = null;
    }
  }

  /**
   * Check if WebSocket is currently connected.
   */
  isConnected(): boolean {
    return this.connectionStatus.value;
  }

  /**
   * Get current user ID that is connected.
   */
  getConnectedUserId(): number | null {
    return this.userId;
  }

  /**
   * Lifecycle hook - cleanup on service destroy.
   */
  ngOnDestroy(): void {
    this.disconnect();
  }
}
