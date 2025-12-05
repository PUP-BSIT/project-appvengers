import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxLoadingBar } from '@ngx-loading-bar/core';
import { ChatbotSidebar } from './chatbot-sidebar/chatbot-sidebar';
import { ChatbotService } from './chatbot-sidebar/chatbot.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxLoadingBar, ChatbotSidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ibudget');
  private chatbotService = inject(ChatbotService);
  private authService = inject(AuthService);
  protected isOpen = this.chatbotService.isOpen;

  // Only show chatbot when user is authenticated
  protected get showChatbot(): boolean {
    return this.authService.isLoggedIn();
  }
}
