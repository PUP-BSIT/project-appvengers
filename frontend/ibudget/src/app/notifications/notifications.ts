import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from "../header/header";
import { Notification } from '../../models/user.model';
import { CurrencyPipe, NgClass } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { ConfettiService } from '../../services/confetti.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";

@Component({
  selector: 'app-notifications',
  imports: [Header, CurrencyPipe, NgClass, ToggleableSidebar],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private processedNotificationIds = new Set<number>();

  // Expose Math to template
  Math = Math;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

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
      // Calculate total pages
      this.totalPages = Math.ceil(notifications.length / this.itemsPerPage);
      
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

  // Get paginated notifications
  get paginatedNotifications(): Notification[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.notifications.slice(startIndex, endIndex);
  }

  // Get page numbers for pagination controls
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Get visible page numbers (show max 5 pages at a time)
  get visiblePageNumbers(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll to top of notifications list
      document.querySelector('.notifications-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  markAsRead(notification: Notification) {
    this.notificationService.markAsRead(notification);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(id: number) {
    this.notificationService.deleteNotification(id);
    
    // Adjust current page if we deleted the last item on the page
    const newTotalPages = Math.ceil((this.notifications.length - 1) / this.itemsPerPage);
    if (this.currentPage > newTotalPages && newTotalPages > 0) {
      this.currentPage = newTotalPages;
    }
  }

  viewDetails(referenceId: number) {
    this.router.navigate(['/savings/view-saving', referenceId]);
  }
}


