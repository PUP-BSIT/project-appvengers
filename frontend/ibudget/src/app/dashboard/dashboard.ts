import { Component, inject, signal, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionResponse } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    Header,
    ToggleableSidebar,
    RouterLink,
    CommonModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class Dashboard implements OnInit {
  private txService = inject(TransactionsService);
  
  recentTransactions = signal<TransactionResponse[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadRecentActivity();
  }

  loadRecentActivity() {
    this.isLoading.set(true);
    this.txService.getAllWithCategory().subscribe({
      next: (txs) => {
        // Sort by date desc, then by id desc
        const sorted = txs.sort((a, b) => {
          const dateA = new Date(a.transactionDate).getTime();
          const dateB = new Date(b.transactionDate).getTime();
          return dateB - dateA || (b.id - a.id);
        });
        
        this.recentTransactions.set(sorted.slice(0, 2));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load recent transactions', err);
        this.isLoading.set(false);
      }
    });
  }
}