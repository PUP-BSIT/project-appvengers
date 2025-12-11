import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
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

@Component({
  selector: 'app-view-saving',
  imports: [
    Sidebar,
    Header,
    RouterLink,
    AddSavingTransaction,
    UpdateSavingTransaction,
    SavingProgress,
    CommonModule,
    FormsModule
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
  transactionHistories = signal(<SavingTransaction[]>[]);
  filteredTransactions = signal(<SavingTransaction[]>[]);
  transactionsCount = signal(0);
  // Pagination state
  pageSize = 5;
  currentPage = signal(1);
  paginatedTransactions = signal(<SavingTransaction[]>[]);
  pageCount = signal(1);
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
        this.transactionHistories.set(transactionData);
        this.transactionsCount.set(transactionData.length);
        this.updatePagination();
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
        this.transactionHistories.update(transactions =>
          transactions.filter(transaction => 
              transaction.id !== this.selectedTransactionId())
        );
        
        this.transactionsCount.set(this.transactionHistories().length);
        this.updatePagination();

        // Close modal
        this.closeDeleteTransactionModal();

        // update current amount
        this.refreshCurrentAmount();

        // show success toast
        this.toastMessage.set('Transaction deleted successfully!');
        this.toastType.set('success');
        const toast = Toast.getOrCreateInstance(this.viewSavingToast.nativeElement);
        toast.show();
        setTimeout(() => toast.hide(), 3000);
      },
      error: (err) => {
        console.error('Failed to delete transaction', err);

        // show error toast
        this.toastMessage.set('Failed to delete transaction. Please try again.');
        this.toastType.set('error');
        const toast = Toast.getOrCreateInstance(this.viewSavingToast.nativeElement);
        toast.show();
        setTimeout(() => toast.hide(), 3000);
      }
    });
  }

  onSavingsTransactionAdded(newTransaction: SavingTransaction) {
    // append canonical saved record (returned by service)
    const updated = [...this.transactionHistories(), newTransaction];
    this.transactionHistories.set(updated); 

    // update current amount
    this.refreshCurrentAmount();

    // update total and filtered list
    this.transactionsCount.set(updated.length);
    this.updatePagination();

    // show success toast without navigation
    this.toastMessage.set('Transaction added successfully!');
    this.toastType.set('success');
    const toast = Toast.getOrCreateInstance(this.viewSavingToast.nativeElement);
    toast.show();
    setTimeout(() => toast.hide(), 3000);
  }

  onSavingsTransactionUpdated(updatedTransaction: SavingTransaction) {
    const updatedTransactions = this.transactionHistories().map(transaction => 
      transaction.id === updatedTransaction.id ? 
        updatedTransaction : transaction
    );

    // update current amount
    this.refreshCurrentAmount();

    this.transactionHistories.set(updatedTransactions);
    this.updatePagination();

    // show success toast without navigation
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
  updatePagination() {
    const total = this.transactionHistories().length;
    const pages = Math.max(1, Math.ceil(total / this.pageSize));
    this.pageCount.set(pages);
    const page = Math.min(this.currentPage(), pages);
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTransactions.set(this.transactionHistories().slice(start, end));
  }

  goToPage(page: number) {
    if (page < 1 || page > this.pageCount()) return;
    this.currentPage.set(page);
    this.updatePagination();
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
}
