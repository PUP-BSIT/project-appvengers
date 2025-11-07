import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar-overlay',
  imports: [CommonModule],
  templateUrl: './sidebar-overlay.html',
  styleUrl: './sidebar-overlay.scss'
})
export class SidebarOverlay {
  private sidebarService = inject(SidebarService);

  isOpen = computed(() => this.sidebarService.isOpen());

  closeSidebar() {
    this.sidebarService.isOpen.set(false);
  }
}
