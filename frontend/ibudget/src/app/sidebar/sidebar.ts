import { Component, computed, inject, signal, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarOverlay } from '../sidebar-overlay/sidebar-overlay';
import { AuthService } from '../../services/auth.service';
import { Tooltip } from 'bootstrap';

declare const bootstrap: typeof import('bootstrap');

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule, SidebarOverlay],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})

export class Sidebar implements AfterViewInit, OnDestroy {
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private tooltips: Tooltip[] = [];

  isOpen = computed(() => this.sidebarService.isOpen());

  ngAfterViewInit(): void {
    this.initializeTooltips();
  }

  private initializeTooltips(): void {
    // Dispose existing tooltips first
    this.tooltips.forEach(tooltip => tooltip.dispose());
    this.tooltips = [];

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    this.tooltips = [...tooltipTriggerList].map(tooltipTriggerEl => 
      new Tooltip(tooltipTriggerEl as Element, {
        trigger: 'hover',
        delay: { show: 300, hide: 100 }
      })
    );
  }

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
    this.router.navigate(['/']);
    this.showLogoutModal.set(false);
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    if (this.showLogoutModal()) {
      this.cancelLogout();
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.tooltips.forEach(tooltip => tooltip.dispose());
  }

}
