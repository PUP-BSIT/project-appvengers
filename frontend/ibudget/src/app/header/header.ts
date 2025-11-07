import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../../services/notification';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private notificationService = inject(NotificationService);
  private sidebarService = inject(SidebarService);

  getUnreadCount(): number {
    return this.notificationService.getUnreadCount();
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
