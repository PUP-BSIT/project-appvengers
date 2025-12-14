import { Component, OnInit, OnDestroy } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { Notification } from '../../models/user.model';
import { CurrencyPipe, NgClass } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  imports: [Sidebar, Header, CurrencyPipe, NgClass],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(public notificationService: NotificationService) { }

  ngOnInit() {
    this.notificationService.fetchNotifications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
}

