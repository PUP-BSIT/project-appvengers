import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NotificationService } from '../../services/notification';
import { SidebarService } from '../../services/sidebar.service';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private notificationService = inject(NotificationService);
  private sidebarService = inject(SidebarService);
  private router = inject(Router);

  currentPageTitle = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getPageTitle(this.router.url))
    ),
    { initialValue: this.getPageTitle(this.router.url) }
  );

  currentMonthYear = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });

  private getPageTitle(url: string): string {
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/transactions')) return 'Transactions';
    if (url.includes('/budgets')) return 'Budgets';
    if (url.includes('/savings')) return 'Savings';
    if (url.includes('/categories')) return 'Categories';
    if (url.includes('/reports')) return 'Reports';
    if (url.includes('/notifications')) return 'Notifications';
    if (url.includes('/settings')) return 'Settings';
    return 'Dashboard';
  }

  getUnreadCount(): number {
    return this.notificationService.getUnreadCount();
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
