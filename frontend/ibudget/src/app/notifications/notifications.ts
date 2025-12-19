import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from "../header/header";
import { Notification } from '../../models/user.model';
import { CurrencyPipe, NgClass } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { ConfettiService } from '../../services/confetti.service';
import { NotificationPreferencesService } from '../../services/notification-preferences.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";

// Interface for grouped notifications
export interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

// Filter types
export type NotificationFilter = 'all' | 'budgets' | 'savings' | 'unread';

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

  // Filter properties
  activeFilter: NotificationFilter = 'all';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Increased for grouped view
  totalPages: number = 1;

constructor(
    public notificationService: NotificationService,
    private confettiService: ConfettiService,
    private preferencesService: NotificationPreferencesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.notificationService.fetchNotifications();
    
    // Subscribe to notifications and trigger confetti for unread milestone/completion notifications
    this.notificationService.notifications$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(notifications => {
      // Calculate total pages based on filtered notifications
      this.totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
      
notifications.forEach(notification => {
        // Only trigger confetti for unread notifications we haven't processed yet
        if (!notification.read && !this.processedNotificationIds.has(notification.id)) {
          if (notification.type === 'SAVINGS_COMPLETED') {
            if (this.preferencesService.getPreferencesSync().savingsCompletedEnabled) {
              console.log('🎉 Triggering celebration confetti for:', notification.title);
              this.confettiService.celebrate();
            } else {
              console.log('🔕 Celebration confetti disabled by preferences');
            }
            this.processedNotificationIds.add(notification.id);
          } else if (notification.type === 'SAVINGS_MILESTONE_50' || notification.type === 'SAVINGS_MILESTONE_75') {
            if (this.preferencesService.getPreferencesSync().savingsMilestoneEnabled) {
              console.log('⭐ Triggering milestone confetti for:', notification.title);
              this.confettiService.milestone();
            } else {
              console.log('🔕 Milestone confetti disabled by preferences');
            }
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

  /**
   * Get filtered notifications based on active filter
   */
  get filteredNotifications(): Notification[] {
    const allNotifications = this.notifications;
    
    switch (this.activeFilter) {
      case 'budgets':
        return allNotifications.filter(n => 
          n.type === 'BUDGET_WARNING' || n.type === 'BUDGET_EXCEEDED' || n.type === 'BUDGET_NEAR_END'
        );
      case 'savings':
        return allNotifications.filter(n => 
          n.type === 'SAVINGS_DEADLINE' || 
          n.type === 'SAVINGS_COMPLETED' || 
          n.type === 'SAVINGS_MILESTONE_50' || 
          n.type === 'SAVINGS_MILESTONE_75'
        );
      case 'unread':
        return allNotifications.filter(n => !n.read);
      case 'all':
      default:
        return allNotifications;
    }
  }

  /**
   * Set the active filter and reset pagination
   */
  setFilter(filter: NotificationFilter): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
  }

  /**
   * Get count for each filter tab
   */
  getFilterCount(filter: NotificationFilter): number {
    const allNotifications = this.notifications;
    
    switch (filter) {
      case 'budgets':
        return allNotifications.filter(n => 
          n.type === 'BUDGET_WARNING' || n.type === 'BUDGET_EXCEEDED'
        ).length;
      case 'savings':
        return allNotifications.filter(n => 
          n.type === 'SAVINGS_DEADLINE' || 
          n.type === 'SAVINGS_COMPLETED' || 
          n.type === 'SAVINGS_MILESTONE_50' || 
          n.type === 'SAVINGS_MILESTONE_75'
        ).length;
      case 'unread':
        return allNotifications.filter(n => !n.read).length;
      case 'all':
      default:
        return allNotifications.length;
    }
  }

  // Get paginated notifications (uses filtered notifications)
  get paginatedNotifications(): Notification[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredNotifications.slice(startIndex, endIndex);
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

  viewBudgetDetails(referenceId: number) {
    this.router.navigate(['/budgets/view-budget', referenceId]);
  }

  /**
   * Get notifications grouped by date (Today, Yesterday, This Week, Older)
   */
  get groupedNotifications(): NotificationGroup[] {
    const groups: Map<string, Notification[]> = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Use paginated notifications for grouping
    this.paginatedNotifications.forEach(notification => {
      const notificationDate = new Date(notification.date);
      notificationDate.setHours(0, 0, 0, 0);
      
      let groupLabel: string;
      
      if (notificationDate.getTime() === today.getTime()) {
        groupLabel = 'Today';
      } else if (notificationDate.getTime() === yesterday.getTime()) {
        groupLabel = 'Yesterday';
      } else if (notificationDate >= weekAgo) {
        groupLabel = 'This Week';
      } else {
        groupLabel = 'Older';
      }
      
      if (!groups.has(groupLabel)) {
        groups.set(groupLabel, []);
      }
      groups.get(groupLabel)!.push(notification);
    });

    // Convert to array with correct order
    const orderedLabels = ['Today', 'Yesterday', 'This Week', 'Older'];
    const result: NotificationGroup[] = [];
    
    for (const label of orderedLabels) {
      if (groups.has(label)) {
        result.push({
          label,
          notifications: groups.get(label)!
        });
      }
    }
    
    return result;
  }
}


