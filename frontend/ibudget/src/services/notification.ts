import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Notification } from '../models/user.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

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
    // Optimistic update
    const updatedNotifications = this.notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updatedNotifications);

    this.http.put<void>(`${this.apiUrl}/${notification.id}/read`, {}).subscribe({
      error: (error) => {
        console.error('Error marking notification as read:', error);
        // Revert on error if needed, or just let the next fetch fix it
      }
    });
  }

  markAllAsRead(): void {
    // Optimistic update
    const updatedNotifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updatedNotifications);

    this.http.put<void>(`${this.apiUrl}/mark-all-read`, {}).subscribe({
      error: (error) => console.error('Error marking all as read:', error)
    });
  }

  deleteNotification(id: number): void {
    // Optimistic update
    const updatedNotifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);

    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      error: (error) => console.error('Error deleting notification:', error)
    });
  }

  getWarningCount(): number {
    return this.notifications.filter(n => n.type === 'warning').length;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'alert': return 'fas fa-bell';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'warning': return 'warning';
      case 'alert': return 'alert';
      case 'info': return 'info';
      default: return 'info';
    }
  }
}
