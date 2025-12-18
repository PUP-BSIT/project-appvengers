import { Component, inject, signal, effect, HostListener, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-toggleable-sidebar',
  imports: [RouterLink, NgClass, RouterLinkActive],
  templateUrl: './toggleable-sidebar.html',
  styleUrl: './toggleable-sidebar.scss',
})
export class ToggleableSidebar implements OnDestroy {
  isExpanded = false;
  isSidebarControlOpen = signal(false);
  sidebarService = inject(SidebarService);
  private router = inject(Router);

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleSidebarControl(): void {
    this.isSidebarControlOpen.set(!this.isSidebarControlOpen());
  }

  setSidebarType(type: string): void {
    this.sidebarService.setSidebarType(type);
    this.isSidebarControlOpen.set(false);
  }

  getSidebarType(): string {
    return this.sidebarService.getSidebarType();
  }

  getToggleState() {
    return this.sidebarService.getToggleState();
  }

  // Close the sidebar when clicking outside on mobile/tablet sizes
  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 992 && this.getToggleState()) {
      this.sidebarService.toggle();
    }
  }

  // Lock page scroll when sidebar is open on mobile/tablet sizes
  private updateScrollLock(): void {
    const isMobile = window.innerWidth <= 992;
    const isOpen = this.getToggleState();
    document.body.style.overflow = isMobile && isOpen ? 'hidden' : '';
  }

  // React to sidebar open/close changes
  private _scrollEffect = effect(() => {
    // access signal to trigger effect
    const _open = this.sidebarService.isOpen();
    this.updateScrollLock();
  });

  // Close sidebar on navigation for desktop / large screens
  private _navSub = this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd && window.innerWidth > 992) {
      this.sidebarService.isOpen.set(false);
    }
  });

  // React to viewport size changes
  @HostListener('window:resize')
  onResize(): void {
    this.updateScrollLock();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this._navSub.unsubscribe();
  }
}
