import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarOverlay } from '../sidebar-overlay/sidebar-overlay';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule, SidebarOverlay],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private sidebarService = inject(SidebarService);

  isOpen = computed(() => this.sidebarService.isOpen());

  logout(): void {
    console.log("Logout successfully.")
  }
}
