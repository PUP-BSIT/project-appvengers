import { Component, inject, OnInit, signal } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HistoryService } from '../../../services/history';
import { Saving, SavingTransaction } from '../../../models/user.model';
import { SavingsService } from '../../../services/savings.service';
import { AddSavingTransaction } from "./add-saving-transaction/add-saving-transaction";
import { UpdateSavingTransaction } from "./update-saving-transaction/update-saving-transaction";

@Component({
  selector: 'app-view-saving',
  imports: [Sidebar, Header, RouterLink, AddSavingTransaction, UpdateSavingTransaction],
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
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  savingId = signal(1);

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

    this.savingService.getSavingById(savingsId).subscribe((savingData) => {
      this.currentSaving.set(savingData);
    });
  }

  // Delete the current view saving
  deleteSaving() {
    this.savingService.deleteSaving(this.savingId()).subscribe(() => {
      this.router.navigate(['/savings']);
    });
  }

  deleteSavingsTransaction(transactionId: number) {
    this.historyService.deleteSavingTransaction(this.savingId(), transactionId)
      .subscribe(() => {
        const updatedTransactions = this.transactionHistories()
          .filter(transaction => transaction.transaction_id !== transactionId);

        this.transactionHistories.set(updatedTransactions);
        this.filterTransactions();
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
      transaction.transaction_id === updatedTransaction.transaction_id ? 
        updatedTransaction : transaction
    );

    this.transactionHistories.set(updatedTransactions);
    this.filterTransactions();
  }
}
