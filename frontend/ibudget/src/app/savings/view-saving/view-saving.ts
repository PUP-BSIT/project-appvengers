import { Component, inject, OnInit, signal } from '@angular/core';
import { Sidebar } from "../../sidebar/sidebar";
import { Header } from "../../header/header";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HistoryService } from '../../../services/history';
import { Saving, SavingTransaction } from '../../../models/user.model';
import { SavingsService } from '../../../services/savings.service';

@Component({
  selector: 'app-view-saving',
  imports: [Sidebar, Header, RouterLink],
  templateUrl: './view-saving.html',
  styleUrls: ['./view-saving.scss'],
})
export class ViewSaving implements OnInit{
  transactionHistories = signal(<SavingTransaction[]>[]);
  filteredTransactions = signal(<SavingTransaction[]>[]);
  currentSaving = signal(<Saving>{});
  historyService = inject(HistoryService);
  savingService = inject(SavingsService);
  activatedRoute = inject(ActivatedRoute);
  savingId = signal(0);

  ngOnInit(): void {
    this.getSavingsTransactionHistories();
    const savingsId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.savingId.set(+savingsId);
    this.filterTransactions();
    this.getSavingsData();
  }

  getSavingsTransactionHistories() {
    this.historyService.getStaticHistory().subscribe((historiesData) => {
      this.transactionHistories.set(historiesData);
    });
  }

  filterTransactions() {
    const filtered = this.transactionHistories()
      .filter((transaction) => transaction.id === this.savingId());
    this.filteredTransactions.set(filtered);
  }

  getSavingsData() {
    this.savingService.getSavingById(this.savingId()).subscribe((savingData) => {
      this.currentSaving.set(savingData);
    });
  }
}
