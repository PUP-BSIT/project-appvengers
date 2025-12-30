import { Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Header } from "../../header/header";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HistoryService } from '../../../services/history';
import { BackendSaving, Saving, SavingsNavState, SavingTransaction } from '../../../models/user.model';
import { SavingsService } from '../../../services/savings.service';
import { AddSavingTransaction } from "./add-saving-transaction/add-saving-transaction";
import { UpdateSavingTransaction } from "./update-saving-transaction/update-saving-transaction";
import { SavingProgress } from "../saving-progress/saving-progress";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { SavingTransactionService } from '../../../services/saving-transaction.service';
import { Modal, Toast } from 'bootstrap';
import { ToggleableSidebar } from "../../toggleable-sidebar/toggleable-sidebar";

@Component({
  selector: 'app-view-saving',
  imports: [
    Header,
    RouterLink,
    AddSavingTransaction,
    UpdateSavingTransaction,
    SavingProgress,
    CommonModule,
    FormsModule,
    ToggleableSidebar
],
  templateUrl: './view-saving.html',
  styleUrls: ['./view-saving.scss'],
})
export class ViewSaving implements OnInit{
  @ViewChild('viewSavingToast', { static: true }) viewSavingToast!: ElementRef;
  @ViewChild('deleteSavingModal') deleteSavingModal!: ElementRef;
  @ViewChild('deleteSavingModalBtn') 
    deleteSavingModalBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('deleteSavingTransactionModal') 
    deleteSavingTransactionModal!: ElementRef;
  @ViewChild('deleteTransactionBtn') 
    deleteTransactionBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('deleteSelectedTransactionsModal') 
    deleteSelectedTransactionsModal!: ElementRef;
  @ViewChild('deleteSelectedTransactionsBtn') 
    deleteSelectedTransactionsBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('updateTransactionModal') updateTransactionModal!: UpdateSavingTransaction;

  // Select Mode State
  isSelectMode = signal<boolean>(false);
  selectMode = computed(() => this.isSelectMode());

  toggleSelectMode() {
    this.isSelectMode.set(!this.isSelectMode());
    
    // Clear selected transactions when exiting select mode
    if (!this.isSelectMode()) {
      this.selectedTransactionIds.set([]);
    }
  }
  
  // Dropdown State for Mobile Devices
  showDropdown = signal<number | null>(null);

  toggleDropdown(transactionId: number) {
    if (this.showDropdown() === transactionId) {
      this.showDropdown.set(null);
    } else {
      this.showDropdown.set(transactionId);
    }
  }

  openUpdateTransactionModal(transactionId: number) {
    this.updateTransactionModal.openUpdateModalWithData(transactionId);
  }

  // Selected Transactions Container (Array)
  selectedTransactionIds = signal<number[]>([]);

  checkSelectedTransaction(event: Event, transactionId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentSelections = this.selectedTransactionIds();

    if (isChecked) {
      this.selectedTransactionIds.set([...currentSelections, transactionId]);
    } else {
      this.selectedTransactionIds.set(currentSelections
        .filter(id => id !== transactionId));
    }

    console.log('Selected Transactions:', this.selectedTransactionIds());
  }

  // Selected Transactions Modal
  openDeleteSelectedModal() {
    if (this.selectedTransactionIds().length === 0) return;
    const modal = new Modal(this.deleteSelectedTransactionsModal.nativeElement);
    modal.show();
  }

  // Close Selected Transactions Modal
  closeDeleteSelectedModal() {
    const modal = Modal.getInstance(this.deleteSelectedTransactionsModal.nativeElement);
    modal?.hide();
    this.deleteSelectedTransactionsBtn.nativeElement.focus();
  }

  // Confirm Deletion of Selected Transactions
  confirmDeleteSelectedTransactions() {
    this.savingTransactionService.deleteMultipleSavingTransactions(
      this.savingId(),
      this.selectedTransactionIds()
    ).subscribe({
      next: () => {
        // Remove deleted transactions from the list
        this.allTransactions.update(transactions =>
          transactions.filter(t => !this.selectedTransactionIds().includes(t.id))
        );

        // Clear selection
        this.selectedTransactionIds.set([]);

        // Refresh amounts
        this.refreshCurrentAmount();

        this.closeDeleteSelectedModal();

        // Show success toast
        this.toastMessage.set('Transactions deleted successfully!');
        this.toastType.set('success');
        const toast = Toast.getOrCreateInstance(this.viewSavingToast.nativeElement);
        toast.show();
        setTimeout(() => toast.hide(), 3000);
      },
      error: (err) => {
        console.error('Failed to delete transactions', err);
        this.closeDeleteSelectedModal();
        this.toastMessage.set('Failed to delete transactions. Please try again.');
        this.toastType.set('error');
        const toast = Toast.getOrCreateInstance(this.viewSavingToast.nativeElement);
        toast.show();
        setTimeout(() => toast.hide(), 3000);
      }
    });
  }
  
  // Master list of transactions
  private allTransactions = signal<SavingTransaction[]>([]);
  transactionsCount = computed(() => this.allTransactions().length);

  // Search state
  searchTransactionQuery = signal('');

  // A computed signal that automatically filters the transaction list
  filteredTransactions = computed(() => {
    const query = this.searchTransactionQuery().toLowerCase();
    if (!query) {
      return this.allTransactions();
    }
    return this.allTransactions().filter(transaction =>  
      transaction.description.toLowerCase().includes(query)
    );
  });

  // Pagination state is now computed from the filtered list
  pageSize = 5;
  currentPage = signal(1);
  pageCount = computed(() => {
    return Math.max(1, Math.ceil(this.filteredTransactions()
      .length / this.pageSize));
  });

  paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredTransactions().slice(start, end);
  });

  currentSaving = signal(<Saving>{});
  historyService = inject(HistoryService);
  savingService = inject(SavingsService);
  savingTransactionService = inject(SavingTransactionService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  savingId = signal(1);
  remainingAmount = signal(0);
  currentAmount = signal(0);
  dateStarted = signal(new Date());
  isLoading = signal(true);
  selectedTransactionId = signal(0);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  constructor() {
    effect(() => {
      this.filteredTransactions();
      this.currentPage.set(1);
    });
  }

  // Initialize component and fetch data
  ngOnInit(): void {
    const savingsId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.savingId.set(+savingsId);

    if(!savingsId || isNaN(+savingsId)) {
      this.router.navigate(['/savings']);
      return;
    }

    // Check for toast message in navigation state
    const state = history.state as SavingsNavState;
    if (state?.toastMessage) {
      this.toastMessage.set(state.toastMessage);
      this.toastType.set(state.toastType ?? 'success');
      const toast = Toast
        .getOrCreateInstance(this.viewSavingToast.nativeElement);
      toast.show();

      setTimeout(() => {
        toast.hide();
      }, 3000);

      // Clear the state so it doesn't reappear on reload/back
      history.replaceState({}, '', this.router.url);
    }

    // Refresh current amount from backend
    this.refreshCurrentAmount();

    // Fetch transaction histories
    this.getSavingsTransactionHistories();
  }

  // Get Duration between two dates
  getDuration(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Safe daily savings needed
  getDailySavingsNeeded(): number {
    const saving = this.currentSaving();
    const remaining = this.remainingAmount();
    const start = saving.created_at;
    const goal = saving.goal_date;
    const daysLeft = this.getDuration(start, goal);
    if (daysLeft <= 0) return 0;
    return Math.ceil(remaining / daysLeft);
  }

  // Get Weekly savings needed
  getWeeklySavingsNeeded(): number {
    const saving = this.currentSaving();
    const remaining = this.remainingAmount();
    const start = saving.created_at;
    const goal = saving.goal_date;
    const daysLeft = this.getDuration(start, goal);
    if (daysLeft <= 0) return 0;
    return Math.ceil(remaining / (daysLeft / 7));
  }

  // Get Monthly savings needed
  getMonthlySavingsNeeded(): number {
    const saving = this.currentSaving();
    const remaining = this.remainingAmount();
    const start = saving.created_at;
    const goal = saving.goal_date;
    const daysLeft = this.getDuration(start, goal);
    if (daysLeft <= 0) return 0;
    return Math.ceil(remaining / (daysLeft / 30));
  }

  // Calculate remaining amount to reach the target
  updateRemainingAmount() {
    const saving = this.currentSaving();
    const current = Number(saving.current_amount ?? 0);
    const target = Number(saving.target_amount ?? 0);
    this.remainingAmount.set(target - current);
  }

  // Calculate progress percentage for a specific saving
  getProgressPercentage(saving: Saving) {
    const target = Number(saving.target_amount ?? 0);
    const current = Number(saving.current_amount ?? 0);
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  // Fetch all transaction histories
  getSavingsTransactionHistories() {
    this.savingTransactionService.getSavingTransactionById(this.savingId())
    .subscribe({
      next: (transactionData) => {
        this.allTransactions.set(transactionData);
      }
    })
  }

  // Fetch current saving data
  getSavingsData() {
    const savingsId = this.savingId();
    if(!savingsId) return;

    this.savingService.getSavingById(savingsId).subscribe({
      next: (savingData: Saving) => {
        this.currentSaving.set(savingData);
        this.dateStarted.set(new Date(savingData.created_at));
        this.currentAmount.set(Number(savingData.current_amount ?? 0));
        
        // Computes remaining amount
        this.updateRemainingAmount();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error fetching saving data:', error);
      }
    });
  }

  // Delete the current view saving
  deleteSaving() {
    this.savingService.deleteSaving(this.savingId()).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.router.navigate(['/savings'], {
          state: {
            toastMessage: 'Saving deleted successfully!',
            toastType: 'success'
          }
        });
      },
      error: (error) => {
        console.error('Error deleting saving:', error);

        this.closeDeleteModal();
        this.router.navigate(['/savings'], {
          state: {
            toastMessage: 'Error deleting saving. Please try again.',
            toastType: 'error'
          }
        });
      }
    });
  }

  deleteSavingsTransaction() {
    this.savingTransactionService.deleteSavingTransaction(
      this.savingId(),
      this.selectedTransactionId()
    ).subscribe({
      next: () => {
        this.allTransactions.update(transactions =>
          transactions.filter(transaction => 
              transaction.id !== this.selectedTransactionId())
        );
        
        this.closeDeleteTransactionModal();
        this.refreshCurrentAmount();

        this.toastMessage.set('Transaction deleted successfully!');
        this.toastType.set('success');
        const toast = Toast.getOrCreateInstance(this.viewSavingToast.nativeElement);
        toast.show();
        setTimeout(() => toast.hide(), 3000);
      },
      error: (err) => {
        console.error('Failed to delete transaction', err);
        this.toastMessage.set('Failed to delete transaction. Please try again.');
        this.toastType.set('error');
        const toast = Toast.getOrCreateInstance(this.viewSavingToast.nativeElement);
        toast.show();
        setTimeout(() => toast.hide(), 3000);
      }
    });
  }

  onSavingsTransactionAdded(newTransaction: SavingTransaction) {
    this.allTransactions.update(transactions => [...transactions, newTransaction]);
    this.refreshCurrentAmount();

    this.toastMessage.set('Transaction added successfully!');
    this.toastType.set('success');
    const toast = Toast.getOrCreateInstance(this.viewSavingToast.nativeElement);
    toast.show();
    setTimeout(() => toast.hide(), 3000);
  }

  onSavingsTransactionUpdated(updatedTransaction: SavingTransaction) {
    this.allTransactions.update(transactions => 
      transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );

    this.refreshCurrentAmount();
    
    this.toastMessage.set('Transaction updated successfully!');
    this.toastType.set('success');
    const toast = Toast.getOrCreateInstance(this.viewSavingToast.nativeElement);
    toast.show();
    setTimeout(() => toast.hide(), 3000);
  }

  // Refresh current amount from backend
  refreshCurrentAmount() {
    this.savingService.refreshCurrentAmount(this.savingId()).subscribe({
      next: (response) => {
        this.getSavingsData();
      },
      error: (err) => {
        console.error('Failed to refresh current amount', err);
      }
    });
  }

  // Pagination helpers
  goToPage(page: number) {
    if (page < 1 || page > this.pageCount()) return;
    this.currentPage.set(page);
  }

  nextPage() { this.goToPage(this.currentPage() + 1); }
  prevPage() { this.goToPage(this.currentPage() - 1); }

  openDeleteModal() {
    const modal = new Modal(this.deleteSavingModal.nativeElement);
    modal.show();
  }

  closeDeleteModal() {
    const modal = Modal.getInstance(this.deleteSavingModal.nativeElement);
    modal?.hide();

    this.deleteSavingModalBtn.nativeElement.focus();
  }

  openDeleteTransactionModal(transactionId: number) {
    const modal = new Modal(this.deleteSavingTransactionModal.nativeElement);
    modal.show();
    
    this.selectedTransactionId.set(transactionId);
  }

  closeDeleteTransactionModal() {
    const modal = Modal.getInstance(this.deleteSavingTransactionModal.nativeElement);
    modal?.hide();

    this.deleteTransactionBtn.nativeElement.focus();
  }

  // Check if saving is complete
  isSavingComplete(): boolean {
    if (this.isLoading()) return false;
    
    const saving = this.currentSaving();
    const current = Number(saving.current_amount ?? 0);
    const target = Number(saving.target_amount ?? 0);
    
    // Ensure target is valid to avoid false positives (e.g. 0/0)
    if (target <= 0) return false;
    
    return current >= target;
  }
}
