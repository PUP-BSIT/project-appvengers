import { Injectable } from '@angular/core';
import { Notification } from '../app/model/user_model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications: Notification[] = [
    {
      id: 1,
      title: "Budget Exceeded",
      message: "You've exceeded your Food budget for this month",
      date: "Jan 1, 2018",
      amount: 15000,
      type: 'warning',
      read: false,
      category: 'Food'
    },
    {
      id: 2,
      title: "Bill Reminder",
      message: "Your electricity bill is due in 3 days",
      date: "Sep 9, 2022",
      amount: 10000,
      type: 'alert',
      read: false,
      category: 'Bills'
    },
    {
      id: 3,
      title: "Budget Warning",
      message: "You're close to exceeding your Entertainment budget",
      date: "Oct 10, 2022",
      amount: 5000,
      type: 'info',
      read: true,
      category: 'Entertainment'
    }
  ];

  getUnreadCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }

  markAsRead(notification: Notification) {
    notification.read = true;
  }

  markAllAsRead() {
    this.notifications.forEach(notification => notification.read = true);
  }

  deleteNotification(id: number) {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
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
