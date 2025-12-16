import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subscription, map } from 'rxjs';
import { Notification } from '../models/user.model';
import { environment } from '../environments/environment';
import { ConfettiService } from './confetti.service';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/notifications`;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // Track previous notification IDs to detect new notifications
  private previousNotificationIds = new Set<number>();
  
  // WebSocket subscription
  private wsSubscription: Subscription | null = null;

  // Computed observables for counts (memoized)
  public unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );

  public warningCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => n.type === 'BUDGET_WARNING' || n.type === 'warning').length)
  );

  // Map-based lookups for O(1) performance
  private readonly iconMap = new Map<string, string>([
    ['BUDGET_WARNING', 'fas fa-exclamation-triangle'],
    ['warning', 'fas fa-exclamation-triangle'],
    ['BUDGET_EXCEEDED', 'fas fa-bell'],
    ['alert', 'fas fa-bell'],
    ['SAVINGS_DEADLINE', 'fas fa-info-circle'],
    ['info', 'fas fa-info-circle'],
    ['SAVINGS_COMPLETED', 'fas fa-trophy'],
    ['SAVINGS_MILESTONE_50', 'fas fa-star'],
    ['SAVINGS_MILESTONE_75', 'fas fa-star'],
  ]);

  private readonly colorMap = new Map<string, string>([
    ['BUDGET_WARNING', 'warning'],
    ['warning', 'warning'],
    ['BUDGET_EXCEEDED', 'alert'],
    ['alert', 'alert'],
    ['SAVINGS_DEADLINE', 'info'],
    ['info', 'info'],
    ['SAVINGS_COMPLETED', 'success'],
    ['SAVINGS_MILESTONE_50', 'milestone'],
    ['SAVINGS_MILESTONE_75', 'milestone'],
  ]);

  constructor(
    private http: HttpClient,
    private confettiService: ConfettiService,
    private webSocketService: WebSocketService
  ) { }

  /**
   * Initialize WebSocket connection for real-time notifications.
   * Should be called after user login with the user's ID.
   */
  initializeWebSocket(userId: number): void {
    // Connect to WebSocket
    this.webSocketService.connect(userId);
    
    // Subscribe to incoming notifications
    this.wsSubscription = this.webSocketService.notification$.subscribe(
      (notification) => this.handleWebSocketNotification(notification)
    );
    
    console.log('🔌 WebSocket initialized for notifications');
  }

  /**
   * Handle incoming WebSocket notification.
   * Adds notification to the list and triggers appropriate effects.
   */
  private handleWebSocketNotification(notification: Notification): void {
    console.log('📬 Processing WebSocket notification:', notification.title);
    
    // Add to the beginning of the list
    const currentNotifications = this.notificationsSubject.value;
    
    // Check if notification already exists (prevent duplicates)
    if (currentNotifications.some(n => n.id === notification.id)) {
      console.log('⚠️ Notification already exists, skipping:', notification.id);
      return;
    }
    
    // Add new notification at the beginning
    const updatedNotifications = [notification, ...currentNotifications];
    this.notificationsSubject.next(updatedNotifications);
    
    // Track this notification ID
    this.previousNotificationIds.add(notification.id);
    
    // Play notification sound
    this.confettiService.playNotificationSound();
    
    // Trigger confetti for special notifications
    if (notification.type === 'SAVINGS_COMPLETED') {
      console.log('🎉 Triggering celebration confetti!');
      this.confettiService.celebrate();
    } else if (notification.type === 'SAVINGS_MILESTONE_50' || notification.type === 'SAVINGS_MILESTONE_75') {
      console.log('⭐ Triggering milestone confetti!');
      this.confettiService.milestone();
    }
  }

  /**
   * Disconnect WebSocket connection.
   * Should be called on logout or component destruction.
   */
  disconnectWebSocket(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
      this.wsSubscription = null;
    }
    this.webSocketService.disconnect();
    console.log('🔌 WebSocket disconnected');
  }

  /**
   * Check if WebSocket is currently connected.
   */
  isWebSocketConnected(): boolean {
    return this.webSocketService.isConnected();
  }

  fetchNotifications(): void {
    this.http.get<Notification[]>(this.apiUrl)
      .subscribe({
        next: (data) => {
          // Find truly NEW notifications (not present in previous fetch AND unread)
          const newNotifications = data.filter(notification => 
            !this.previousNotificationIds.has(notification.id) && !notification.read
          );

          // Play sound if there are new unread notifications (but not on first load)
          // Note: With WebSocket, this should rarely trigger since real-time updates handle new notifications
          if (newNotifications.length > 0 && this.previousNotificationIds.size > 0) {
            this.confettiService.playNotificationSound();
            console.log('🔔 New notification(s) from HTTP fetch:', newNotifications.length);
          }

          // Update previous IDs tracker (store ALL notification IDs, not just unread)
          this.previousNotificationIds = new Set(data.map(n => n.id));

          // Update notifications subject
          this.notificationsSubject.next(data);
        },
        error: (error) => console.error('Error fetching notifications:', error)
      });
  }

  get notifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }

  markAsRead(notification: Notification): void {
    // Store original state for rollback
    const originalNotifications = [...this.notifications];

    // Optimistic update
    const updatedNotifications = this.notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updatedNotifications);

    this.http.put<void>(`${this.apiUrl}/${notification.id}/read`, {}).subscribe({
      error: (error) => {
        console.error('Error marking notification as read:', error);
        // Rollback on error
        this.notificationsSubject.next(originalNotifications);
      }
    });
  }

  markAllAsRead(): void {
    // Store original state for rollback
    const originalNotifications = [...this.notifications];

    // Optimistic update
    const updatedNotifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updatedNotifications);

    this.http.put<void>(`${this.apiUrl}/mark-all-read`, {}).subscribe({
      error: (error) => {
        console.error('Error marking all as read:', error);
        // Rollback on error
        this.notificationsSubject.next(originalNotifications);
      }
    });
  }

  deleteNotification(id: number): void {
    // Store original state for rollback
    const originalNotifications = [...this.notifications];

    // Optimistic update
    const updatedNotifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);

    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      error: (error) => {
        console.error('Error deleting notification:', error);
        // Rollback on error
        this.notificationsSubject.next(originalNotifications);
      }
    });
  }

  getWarningCount(): number {
    return this.notificationsSubject.value.filter(n => n.type === 'BUDGET_WARNING' || n.type === 'warning').length;
  }

  getNotificationIcon(type: string): string {
    return this.iconMap.get(type) || 'fas fa-bell';
  }

  getNotificationColor(type: string): string {
    return this.colorMap.get(type) || 'info';
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }
}
