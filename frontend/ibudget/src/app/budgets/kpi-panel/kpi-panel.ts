import { Component, OnInit, signal, inject } from '@angular/core';
import { RoundProgressComponent } from 'angular-svg-round-progressbar';
import { Budget } from '../../../models/user.model';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BudgetService } from '../../../services/budget.service';
import { BudgetTransactionsService } from '../../../services/budget.transactions.service';

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
  activatedRoute = inject(ActivatedRoute);
  budgetService = inject(BudgetService);
  currentBudget = signal<Budget>({} as Budget);
  budgetId = signal(Number(this.activatedRoute.snapshot.paramMap.get('id') ?? 1));
  budgetTransactionsService = inject(BudgetTransactionsService);

  ngOnInit(): void {
    this.getBudgetData();
  }

  refresh() {
    this.getBudgetData();
  }

  // Fetch budget data based on budgetId (budget service)
  getBudgetData() {
  const id = this.budgetId();

  this.budgetTransactionsService.getBudgetSummary(id)
    .subscribe({
      next: (summary) => {
        this.totalBudget = summary.limitAmount ?? 0;
        this.totalExpenses = summary.totalExpenses ?? 0;
        this.remainingBudget = summary.remainingBudget ?? 0;

        this.budgetPercent = this.totalBudget > 0
          ? Math.round((this.totalExpenses / this.totalBudget) * 100)
          : 0;

        this.currentBudget.set({
          category_name: summary.categoryName
        } as any);
      },
      error: (err) => console.error('Failed to load budget summary', err)
    });
  }
}