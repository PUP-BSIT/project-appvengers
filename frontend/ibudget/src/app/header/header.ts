import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(private notificationService: NotificationService) {}

  getUnreadCount(): number {
    return this.notificationService.getUnreadCount();
  }
}
