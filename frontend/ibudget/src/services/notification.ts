import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Notification } from '../models/user.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

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

  constructor(private http: HttpClient) { }

  fetchNotifications(): void {
    this.http.get<Notification[]>(this.apiUrl)
      .subscribe({
        next: (data) => this.notificationsSubject.next(data),
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
}
