import { Component, OnInit } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { Notification } from '../../models/user.model';
import { CurrencyPipe, NgClass } from '@angular/common';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notifications',
  imports: [Sidebar, Header, CurrencyPipe, NgClass],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.notificationService.fetchNotifications();
  }

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
    switch (type) {
      case 'BUDGET_WARNING':
      case 'warning': 
        return 'fas fa-exclamation-triangle';
      
      case 'BUDGET_EXCEEDED':
      case 'alert': 
        return 'fas fa-bell';
      
      case 'SAVINGS_DEADLINE':
      case 'info': 
        return 'fas fa-info-circle';
        
      default: return 'fas fa-bell';
    }
  }

  getNotificationColor(type: string): string {
    // Map backend enum types to frontend classes
    switch (type) {
      case 'BUDGET_WARNING':
      case 'warning': 
        return 'warning';
      
      case 'BUDGET_EXCEEDED':
      case 'alert': 
        return 'alert';
      
      case 'SAVINGS_DEADLINE':
      case 'info': 
        return 'info';
        
      default: return 'info';
    }
  }

  getWarningCount(): number {
    return this.notificationService.getWarningCount();
  }
}
