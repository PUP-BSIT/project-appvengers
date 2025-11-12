import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarOverlay } from '../sidebar-overlay/sidebar-overlay';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule, SidebarOverlay],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isOpen = computed(() => this.sidebarService.isOpen());

  showLogoutModal = signal(false);

  openLogoutModal(): void {
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
    // perform logout then navigate
    this.authService.logout();
    this.router.navigate(['/login-page']);
    this.showLogoutModal.set(false);
  }
}
