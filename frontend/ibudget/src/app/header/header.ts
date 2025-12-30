import { Component, inject, computed, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { SidebarService } from '../../services/sidebar.service';
import { ChatbotService } from '../chatbot-sidebar/chatbot.service';
import { AuthService } from '../../services/auth.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { NotificationPreferencesService } from '../../services/notification-preferences.service';
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
  public sidebarService = inject(SidebarService);
  private chatbotService = inject(ChatbotService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private localStorageService = inject(LocalStorageService);
  private notificationPrefsService = inject(NotificationPreferencesService);

  isChatbotOpen = this.chatbotService.isOpen;
  username = signal<string>('');
  userId = signal<number>(0);
  showProfileMenu = signal<boolean>(false);
  showLogoutModal = signal<boolean>(false);
  
  // Convert observable to signal to prevent NG0100 error
  unreadCount = toSignal(this.notificationService.unreadCount$, { initialValue: 0 });

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
    // Don't disconnect WebSocket on component destroy - it should persist across navigations
    // WebSocket will be disconnected only on explicit logout
  }

  private loadUserProfile(): void {
    this.authService.getProfile().subscribe((res) => {
      if (res.success && res.data) {
        this.username.set(res.data.username || res.data.email || 'User');
        this.userId.set(res.data.id);
        
        // Set userId in LocalStorageService for user-scoped data
        this.localStorageService.setUserId(res.data.id);
        console.log(`[Header] User logged in: ${res.data.id}`);
        
        // Load user-specific preferences
        this.notificationPrefsService.loadPreferences();
        
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

  // getUnreadCount() replaced by unreadCount signal to prevent NG0100 error

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
    console.log('[Header] Logout initiated');
    
    // Clear in-memory service states (so next user doesn't see stale data)
    this.notificationService.clearState();
    this.notificationPrefsService.clearState();
    this.chatbotService.clearState();
    
    // Clear userId context (but DO NOT clear localStorage - we want data to persist for re-login)
    // The user-prefixed localStorage data stays intact for when this user logs back in
    this.localStorageService.clearUserId();
    
    // Disconnect WebSocket
    this.notificationService.disconnectWebSocket();
    
    // Logout and navigate
    this.authService.logout();
    this.router.navigate(['/']);
    this.showLogoutModal.set(false);
    
    console.log('[Header] Logout complete - in-memory state cleared, localStorage preserved');
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
