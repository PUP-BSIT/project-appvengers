import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxLoadingBar } from '@ngx-loading-bar/core';
import { ChatbotSidebar } from './chatbot-sidebar/chatbot-sidebar';
import { ChatbotService } from './chatbot-sidebar/chatbot.service';
import { AuthService } from '../services/auth.service';
import { ToastContainer } from './toast/toast';
import { PwaService } from '../services/pwa.service';

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
  
  protected isOpen = this.chatbotService.isOpen;
  protected updateAvailable = this.pwaService.updateAvailable;
  protected isInstallable = this.pwaService.isInstallable;

  // Only show chatbot when user is authenticated
  protected get showChatbot(): boolean {
    return this.authService.isLoggedIn();
  }

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
    this.pwaService.isInstallable.set(false);
  }
}
