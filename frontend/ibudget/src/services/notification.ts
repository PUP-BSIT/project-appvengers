import { Injectable, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, map } from 'rxjs';
import { Notification } from '../models/user.model';
import { environment } from '../environments/environment';
import { ConfettiService } from './confetti.service';
import { WebSocketService } from './websocket.service';
import { ToastService } from './toast.service';
import { NotificationPreferencesService } from './notification-preferences.service';

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
    ['BUDGET_NEAR_END', 'fas fa-calendar-times'],
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
    ['BUDGET_NEAR_END', 'warning'],
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
  ) {
    this.router = inject(Router);
    this.toastService = inject(ToastService);
    this.preferencesService = inject(NotificationPreferencesService);
  }

  private router: Router;
  private toastService: ToastService;
  private preferencesService: NotificationPreferencesService;

  /**
   * Initialize WebSocket connection for real-time notifications.
   * Should be called after user login with the user's ID.
   */
  initializeWebSocket(userId: number): void {
    // Check if already initialized to prevent duplicate subscriptions on navigation
    if (this.wsSubscription && this.webSocketService.isConnected()) {
      console.log('🔌 WebSocket already initialized, skipping');
      return;
    }
    
    // Connect to WebSocket
    this.webSocketService.connect(userId);
    
    // Subscribe to incoming notifications (only if not already subscribed)
    if (!this.wsSubscription) {
      this.wsSubscription = this.webSocketService.notification$.subscribe(
        (notification) => this.handleWebSocketNotification(notification)
      );
    }
    
    console.log('🔌 WebSocket initialized for notifications');
  }

  /**
   * Handle incoming WebSocket notification.
   * Adds notification to the list and triggers appropriate effects.
   */
  private handleWebSocketNotification(notification: Notification): void {
    console.log('📬 Processing WebSocket notification:', notification.title);
    
    // Check if this notification type is enabled in preferences
    if (!this.preferencesService.isNotificationEnabled(notification.type)) {
      console.log('🔕 Notification type disabled by preferences:', notification.type);
      return;
    }
    
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
    
    // Play notification sound (if enabled in preferences)
    if (this.preferencesService.isSoundEnabled()) {
      this.confettiService.playNotificationSound();
    }
    
// Trigger confetti for special notifications (if enabled in preferences)
    if (notification.type === 'SAVINGS_COMPLETED') {
      if (this.preferencesService.getPreferencesSync().savingsCompletedEnabled) {
        console.log('🎉 Triggering celebration confetti!');
        this.confettiService.celebrate();
      } else {
        console.log('🔕 Celebration confetti disabled by preferences');
      }
    } else if (notification.type === 'SAVINGS_MILESTONE_50' || notification.type === 'SAVINGS_MILESTONE_75') {
      if (this.preferencesService.getPreferencesSync().savingsMilestoneEnabled) {
        console.log('⭐ Triggering milestone confetti!');
        this.confettiService.milestone();
      } else {
        console.log('🔕 Milestone confetti disabled by preferences');
      }
    }

    // Show toast notification (only if enabled and not on notifications page)
    if (this.preferencesService.isToastEnabled() && !this.router.url.includes('/notifications')) {
      this.showNotificationToast(notification);
    }
  }

  /**
   * Show a toast for a notification.
   */
  private showNotificationToast(notification: Notification): void {
    const truncatedMessage = notification.message.length > 100 
      ? notification.message.substring(0, 100) + '...' 
      : notification.message;

    this.toastService.show({
      title: notification.title,
      message: truncatedMessage,
      type: this.getToastType(notification.type),
      icon: this.getNotificationIcon(notification.type, notification.urgency),
      duration: 6000,
      action: {
        label: 'View',
        callback: () => {
          this.router.navigate(['/notifications']);
        }
      }
    });
  }

  /**
   * Map notification type to toast type.
   */
  private getToastType(notificationType: string): 'info' | 'success' | 'warning' | 'error' {
    switch (notificationType) {
      case 'BUDGET_EXCEEDED':
        return 'error';
      case 'BUDGET_WARNING':
      case 'BUDGET_NEAR_END':
        return 'warning';
      case 'SAVINGS_COMPLETED':
      case 'SAVINGS_MILESTONE_50':
      case 'SAVINGS_MILESTONE_75':
        return 'success';
      case 'SAVINGS_DEADLINE':
        return 'warning';
      default:
        return 'info';
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
            if (this.preferencesService.isSoundEnabled()) {
              this.confettiService.playNotificationSound();
            }
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

  getNotificationIcon(type: string, urgency?: string): string {
    // For SAVINGS_DEADLINE, use urgency-based icons
    if (type === 'SAVINGS_DEADLINE' && urgency) {
      switch (urgency) {
        case 'HIGH':
          return 'fas fa-exclamation-circle'; // Urgent - today/tomorrow
        case 'MEDIUM':
          return 'fas fa-clock';              // Reminder - 3 days
        case 'LOW':
        default:
          return 'fas fa-info-circle';        // Info - 7 days
      }
    }
    return this.iconMap.get(type) || 'fas fa-bell';
  }

  getNotificationColor(type: string, urgency?: string): string {
    // For SAVINGS_DEADLINE, use urgency-based coloring
    if (type === 'SAVINGS_DEADLINE' && urgency) {
      switch (urgency) {
        case 'HIGH':
          return 'alert';    // Red for today/tomorrow
        case 'MEDIUM':
          return 'warning';  // Orange for 3 days
        case 'LOW':
        default:
          return 'info';     // Blue for 7 days
      }
    }
    return this.colorMap.get(type) || 'info';
  }

  /**
   * Clear all notification state (for logout).
   * Resets in-memory cache and disconnects WebSocket.
   */
  clearState(): void {
    this.notificationsSubject.next([]);
    this.previousNotificationIds.clear();
    this.disconnectWebSocket();
    console.log('🧹 Notification state cleared');
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }
}
