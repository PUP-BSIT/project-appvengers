import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-toggleable-sidebar',
  imports: [RouterLink, NgClass, RouterLinkActive],
  templateUrl: './toggleable-sidebar.html',
  styleUrl: './toggleable-sidebar.scss',
})
export class ToggleableSidebar {
  isExpanded = false;
  isSidebarControlOpen = signal(false);
  sidebarService = inject(SidebarService);

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
}
