import { Component, OnInit, signal } from '@angular/core';
import { TransactionHistory } from '../../model/user.model';
import { HistoryService } from '../../../services/history';

@Component({
  selector: 'app-history-table',
  imports: [],
  templateUrl: './history-table.html',
  styleUrl: './history-table.scss',
})
export class HistoryTable implements OnInit {
  staticTransactionsHistory = signal(<TransactionHistory[]>[]);

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.staticTransactionsHistory.set(this.historyService.getStaticHistory());
  }
}
