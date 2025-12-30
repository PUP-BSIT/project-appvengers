import { Component, ElementRef, inject, OnInit, signal, ViewChild, computed, effect } from '@angular/core';
import { Header } from "../header/header";
import { Saving } from '../../models/user.model';
import { SavingsService } from '../../services/savings.service';
import { Router, RouterLink } from '@angular/router';
import { SavingProgress } from "./saving-progress/saving-progress";
import { CommonModule } from '@angular/common';
import { Toast } from 'bootstrap';
import { SavingsNavState } from '../../models/user.model';
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-savings',
  imports: [
    CommonModule, 
    Header, 
    RouterLink, 
    SavingProgress, 
    ToggleableSidebar,
    FormsModule
  ],
  templateUrl: './savings.html',
  styleUrl: './savings.scss',
})
export class Savings implements OnInit {
  @ViewChild('savingsToast', { static: true }) savingsToast!: ElementRef;
  
  private allSavings = signal<Saving[]>([]);
  savingsService = inject(SavingsService);
  isLoading = signal(true);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  router = inject(Router);

  // Search and filter state
  searchQuery = signal('');
  
  filteredSavings = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.allSavings();
    }
    return this.allSavings().filter(saving =>
      saving.name.toLowerCase().includes(query) ||
      (saving.name && saving.name.toLowerCase().includes(query))
    );
  });

  // Pagination state
  pageSize = signal(3);
  currentPage = signal(1);

  constructor() {
    // When the filtered list changes (e.g., due to a search), reset to page 1.
    effect(() => {
      this.filteredSavings();
      this.currentPage.set(1);
    });
  }

  // Pagination is now computed based on the filtered list
  paginatedSavings = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredSavings().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    const len = this.filteredSavings().length;
    const pages = Math.ceil(len / this.pageSize());
    return pages > 0 ? pages : 1;
  });

  ngOnInit() {
    // Check for toast message in navigation state
    const state = history.state as SavingsNavState;
    if (state?.toastMessage) {
      this.toastMessage.set(state.toastMessage);
      this.toastType.set(state.toastType ?? 'success');
      const toast = Toast.getOrCreateInstance(this.savingsToast.nativeElement);
      toast.show();

      setTimeout(() => {
        toast.hide();
      }, 3000);

      // Clear the state so it doesn't reappear on reload/back
      history.replaceState({}, '', this.router.url);
    }

    // Fetch Savings Data
    this.getSavings();
  }

  // Calculate progress percentage for a specific saving
  getProgressPercentage(saving: Saving) {
    const target = Number(saving.target_amount);
    const current = Number(saving.current_amount);
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  getSavings() {
    this.savingsService.getSavings().subscribe({
      next: (savingsData) => {
        // Add a delay for better data loading experience
        setTimeout(() => {
          this.allSavings.set(savingsData as Saving[]);
          this.currentPage.set(1);
          this.isLoading.set(false);
        }, 1000);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error fetching savings:', error);
      }
    });
  }

  // Pagination helpers
  getPageNumbers() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    const clamped = Math.min(Math.max(page, 1), this.totalPages());
    this.currentPage.set(clamped);
  }

  prevPage() { this.goToPage(this.currentPage() - 1); }
  nextPage() { this.goToPage(this.currentPage() + 1); }

  updateCurrentPage(event: Event) {
    const input = event.target as HTMLInputElement;
    const num = Number(input.value);
    if (!Number.isNaN(num)) this.goToPage(num);
    else input.value = String(this.currentPage());
  }
}
