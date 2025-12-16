import { Component, inject, computed, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { SidebarService } from '../../services/sidebar.service';
import { ChatbotService } from '../chatbot-sidebar/chatbot.service';
import { AuthService } from '../../services/auth.service';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private sidebarService = inject(SidebarService);
  private chatbotService = inject(ChatbotService);
  private router = inject(Router);
  private authService = inject(AuthService);

  isChatbotOpen = this.chatbotService.isOpen;
  username = signal<string>('');
  userId = signal<number>(0);
  showProfileMenu = signal<boolean>(false);
  showLogoutModal = signal<boolean>(false);

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

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    // Disconnect WebSocket when component is destroyed
    this.notificationService.disconnectWebSocket();
  }

  private loadUserProfile(): void {
    this.authService.getProfile().subscribe((res) => {
      if (res.success && res.data) {
        this.username.set(res.data.username || res.data.email || 'User');
        this.userId.set(res.data.id);
        
        // Initialize WebSocket for real-time notifications
        this.notificationService.initializeWebSocket(res.data.id);
        
        // Fetch existing notifications once
        this.notificationService.fetchNotifications();
      }
    });
  }

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

  toggleChatbot() {
    this.chatbotService.toggle();
  }

  toggleProfileMenu() {
    this.showProfileMenu.set(!this.showProfileMenu());
  }

  goToSettings() {
    this.router.navigate(['/settings/account', this.userId()]);
    this.showProfileMenu.set(false);
  }

  openLogoutModal() {
    this.showLogoutModal.set(true);
    this.showProfileMenu.set(false);
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  confirmLogout() {
    // Disconnect WebSocket before logout
    this.notificationService.disconnectWebSocket();
    this.authService.logout();
    this.router.navigate(['/']);
    this.showLogoutModal.set(false);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-section')) {
      this.showProfileMenu.set(false);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    if (this.showLogoutModal()) {
      this.cancelLogout();
      event.preventDefault();
    }
  }
}
