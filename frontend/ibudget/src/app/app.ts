import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NgxLoadingBar } from '@ngx-loading-bar/core';
import { ChatbotSidebar } from './chatbot-sidebar/chatbot-sidebar';
import { ChatbotService } from './chatbot-sidebar/chatbot.service';
import { AuthService } from '../services/auth.service';
import { ToastContainer } from './toast/toast';
import { PwaService } from '../services/pwa.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxLoadingBar, ChatbotSidebar, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ibudget');
  private chatbotService = inject(ChatbotService);
  private authService = inject(AuthService);
  private pwaService = inject(PwaService);
  private router = inject(Router);
  
  protected isOpen = this.chatbotService.isOpen;
  protected updateAvailable = this.pwaService.updateAvailable;
  protected isInstallable = this.pwaService.isInstallable;

  // Signal to track authentication state
  private isAuthenticated = signal(this.authService.isLoggedIn());

  // Update authentication state when navigation completes
  constructor() {
    // Update auth state after each navigation (login, logout, OAuth callback, etc.)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isAuthenticated.set(this.authService.isLoggedIn());
    });
  }

  // Only show chatbot when user is authenticated
  protected showChatbot = computed(() => this.isAuthenticated());

  // PWA update handler
  protected reloadApp(): void {
    this.pwaService.reloadToUpdate();
  }

  // PWA install handler
  protected async installApp(): Promise<void> {
    await this.pwaService.promptInstall();
  }

  // Dismiss update notification
  protected dismissUpdate(): void {
    this.pwaService.updateAvailable.set(false);
  }

  // Dismiss install prompt
  protected dismissInstall(): void {
    this.pwaService.dismissInstallPrompt();
  }
}
