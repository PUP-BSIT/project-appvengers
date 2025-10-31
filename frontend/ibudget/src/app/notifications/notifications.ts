import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { Notification } from '../model/user_model';
import { CurrencyPipe } from '@angular/common';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notifications',
  imports: [Sidebar, Header, CurrencyPipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  constructor(private notificationService: NotificationService) {}

  get notifications(): Notification[] {
    return this.notificationService.notifications;
  }

  markAsRead(notification: Notification) {
    this.notificationService.markAsRead(notification);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(id: number) {
    this.notificationService.deleteNotification(id);
  }

  getUnreadCount(): number {
    return this.notificationService.getUnreadCount();
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationColor(type: string): string {
    return this.notificationService.getNotificationColor(type);
  }

  getWarningCount(): number {
    return this.notificationService.getWarningCount();
  }
}
