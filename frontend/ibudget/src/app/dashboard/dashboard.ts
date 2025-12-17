import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { ExpenseChart } from './expense-chart/expense-chart';
import { Header } from '../header/header';
import { IncomeChart } from './income-chart/income-chart';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SpendingChart } from './spending-chart/spending-chart';
import { Router } from '@angular/router';
import { Transaction } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";

@Component({
  selector: 'app-dashboard',
  imports: [
    Header,
    IncomeChart,
    ExpenseChart,
    DecimalPipe,
    SpendingChart,
    ToggleableSidebar
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class Dashboard implements OnInit {
  username: string | null = null;
  remainingBudget: number = 0;

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.username = res.data.username;
          this.cd.detectChanges();
        }
      },
      error: () => {
        this.auth.logout();
        this.router.navigate(['/login-page']);
      }
    });

    const token = this.auth.getToken();
    const url = `${environment.apiUrl}/transactions`;
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<{ success: boolean; data: Transaction[] }>(url, {
      headers
    }).subscribe({
      next: (res) => {
        const txs = res.data;

        const income = txs
          .filter(tx => tx.type === 'income')
          .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = txs
          .filter(tx => tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0);

        this.remainingBudget = income - expenses;
        this.cd.detectChanges();
      },
      error: () => {
        console.error('Failed to load transactions for balance');
      }
    });
  }
}