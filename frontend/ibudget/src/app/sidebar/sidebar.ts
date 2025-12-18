import { Component, computed, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarOverlay } from '../sidebar-overlay/sidebar-overlay';
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
    this.tooltips = Array.from(tooltipTriggerList).map(tooltipTriggerEl => 
      new Tooltip(tooltipTriggerEl as Element, {
        trigger: 'hover',
        delay: { show: 300, hide: 100 }
      })
    );
  }

  ngOnDestroy(): void {
    this.tooltips.forEach(tooltip => tooltip.dispose());
  }

}
