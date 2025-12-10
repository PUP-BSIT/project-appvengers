import { Component, inject, OnInit, signal } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HistoryService } from '../../../services/history';
import { Saving, SavingTransaction } from '../../../models/user.model';
import { SavingsService } from '../../../services/savings.service';
import { AddSavingTransaction } from "./add-saving-transaction/add-saving-transaction";
import { UpdateSavingTransaction } from "./update-saving-transaction/update-saving-transaction";
import { SavingProgress } from "../saving-progress/saving-progress";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { SavingTransactionService } from '../../../services/saving-transaction.service';

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
  transactionHistories = signal(<SavingTransaction[]>[]);
  filteredTransactions = signal(<SavingTransaction[]>[]);
  transactionsCount = signal(0);
  currentSaving = signal(<Saving>{});
  historyService = inject(HistoryService);
  savingService = inject(SavingsService);
  savingTransactionService = inject(SavingTransactionService);
  activatedRoute = inject(ActivatedRoute);
  savingId = signal(1);
  remainingAmount = signal(0);
  dateStarted = signal(new Date());
  router = inject(Router);
  isLoading = signal(true);

  // Initialize component and fetch data
  ngOnInit(): void {
    const savingsId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.savingId.set(+savingsId);

    if(!savingsId || isNaN(+savingsId)) {
      this.router.navigate(['/savings']);
      return;
    }

    this.getSavingsTransactionHistories();
    this.filterTransactions();
    this.getSavingsData();
    this.getTransactionBySavingId();
    console.log('Saving ID:', this.savingId());
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
    const target = Number(saving.target_amount);
    const current = Number(saving.current_amount);
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  // Fetch all transaction histories
  getSavingsTransactionHistories() {
    this.historyService.getStaticHistory().subscribe((historiesData) => {
      this.transactionHistories.set(historiesData);
      
      // sets the count of filtered transactions
      this.transactionsCount.set(historiesData.length);
    });
  }

  // Filter transactions related to the current saving based on saving ID 
  filterTransactions() {
    const filtered = this.transactionHistories()
      .filter((transaction) => transaction.savings_id === this.savingId());

    // sets the filtered transactions
    this.filteredTransactions.set(filtered);
  }

  // Fetch current saving data
  getSavingsData() {
    const savingsId = this.savingId();
    if(!savingsId) return;

    this.savingService.getSavingById(savingsId).subscribe({
      next: (savingData) => {
        this.currentSaving.set(savingData);
        this.dateStarted.set(new Date(savingData.created_at));
        
        // Now that data is present, do dependent computations
        this.updateRemainingAmount();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error fetching saving data:', error);
      }
    });
  }

  // Fetch transactions by saving ID from backend
  getTransactionBySavingId() {
    this.savingTransactionService.getSavingTransactionById(this.savingId())
    .subscribe({
      next: (transactionData) => {
        this.transactionHistories.set(transactionData);
        console.log('Transactions Data:', transactionData);
      }
    })
  }

  // Delete the current view saving
  deleteSaving() {
    this.savingService.deleteSaving(this.savingId()).subscribe(() => {
      this.router.navigate(['/savings']);
    });
  }

  deleteSavingsTransaction(transactionId: number) {
    this.savingTransactionService.deleteSavingTransaction(
      this.savingId(),
      transactionId
    ).subscribe({
      next: () => {
        this.transactionHistories.update(transactions =>
          transactions.filter(transaction => transaction.id !== transactionId)
        );
      },
      error: (err) => {
        console.error('Failed to delete transaction', err);
      }
    });
  }


  onSavingsTransactionAdded(newTransaction: SavingTransaction) {
    // append canonical saved record (returned by service)
    const updated = [...this.transactionHistories(), newTransaction];
    this.transactionHistories.set(updated);

    // update total and filtered list
    this.transactionsCount.set(updated.length);
    this.filterTransactions();
  }

  onSavingsTransactionUpdated(updatedTransaction: SavingTransaction) {
    const updatedTransactions = this.transactionHistories().map(transaction => 
      transaction.id === updatedTransaction.id ? 
        updatedTransaction : transaction
    );

    this.transactionHistories.set(updatedTransactions);
    this.filterTransactions();
  }
}
