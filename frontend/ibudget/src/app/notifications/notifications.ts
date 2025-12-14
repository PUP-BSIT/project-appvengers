import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { Notification } from '../../models/user.model';
import { CurrencyPipe, NgClass } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { ConfettiService } from '../../services/confetti.service';
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
  private processedNotificationIds = new Set<number>();

  constructor(
    public notificationService: NotificationService,
    private confettiService: ConfettiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.notificationService.fetchNotifications();
    
    // Subscribe to notifications and trigger confetti for unread milestone/completion notifications
    this.notificationService.notifications$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(notifications => {
      notifications.forEach(notification => {
        // Only trigger confetti for unread notifications we haven't processed yet
        if (!notification.read && !this.processedNotificationIds.has(notification.id)) {
          if (notification.type === 'SAVINGS_COMPLETED') {
            console.log('🎉 Triggering celebration confetti for:', notification.title);
            this.confettiService.celebrate();
            this.processedNotificationIds.add(notification.id);
          } else if (notification.type === 'SAVINGS_MILESTONE_50' || notification.type === 'SAVINGS_MILESTONE_75') {
            console.log('⭐ Triggering milestone confetti for:', notification.title);
            this.confettiService.milestone();
            this.processedNotificationIds.add(notification.id);
          }
        }
      });
    });
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

  viewDetails(referenceId: number) {
    this.router.navigate(['/savings/view-saving', referenceId]);
  }
}

