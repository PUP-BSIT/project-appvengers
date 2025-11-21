import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RoundProgressComponent } from 'angular-svg-round-progressbar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { Transaction } from '../../../models/user.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-kpi-panel',
  imports: [RoundProgressComponent, DecimalPipe],
  templateUrl: './kpi-panel.html',
  styleUrl: './kpi-panel.scss'
})

export class KpiPanel implements OnInit {
  remainingBudget: number = 0;
  totalBudget: number = 0;
  totalExpenses: number = 0;
  budgetPercent: number = 0;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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

        this.totalBudget = income;
        this.totalExpenses = expenses;
        this.remainingBudget = income - expenses;

        this.budgetPercent = income > 0
          ? Math.round((this.remainingBudget / income) * 100)
          : 0;

        this.cd.detectChanges();
      },
      error: () => {
        console.error('Failed to load transactions for KPI panel');
      }
    });
  }
}