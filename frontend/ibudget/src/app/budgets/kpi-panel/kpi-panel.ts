import { Component, OnInit, ChangeDetectorRef, signal, inject } from '@angular/core';
import { RoundProgressComponent } from 'angular-svg-round-progressbar';
import { Budget } from '../../../models/user.model';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MockupsService } from '../../../services/mockups.service';
import { BudgetService } from '../../../services/budget.service';

@Component({
  selector: 'app-kpi-panel',
  imports: [RoundProgressComponent, DecimalPipe],
  templateUrl: './kpi-panel.html',
  styleUrl: './kpi-panel.scss'
})

export class KpiPanel implements OnInit {
  remainingBudget: number = 0;
  totalBudget: number = 0;
  totalExpenses: number = 700;
  budgetPercent: number = 0;
  activatedRoute = inject(ActivatedRoute);
  budgetService = inject(BudgetService);
  currentBudget = signal<Budget>({} as Budget);
  budgetId = signal(Number(this.activatedRoute.snapshot.paramMap.get('id') ?? 1));

  ngOnInit(): void {
    this.getBudgetData();
  }

  // Fetch budget data based on budgetId (mockup service)
  getBudgetData() {
    const id = this.budgetId();
    this.budgetService.getBudgetById(id)
      .subscribe({
        next: (budget) => {
          this.currentBudget.set(budget);
          this.totalBudget = budget.limit_amount ?? 0;
          this.totalExpenses = budget.current_amount ?? 0;
          this.remainingBudget = Math.max(this.totalBudget - this.totalExpenses, 0);
          this.budgetPercent = this.totalBudget > 0
            ? Math.round((this.totalExpenses / this.totalBudget) * 100)
            : 0;
        },
        error: (err) => console.error('Failed to load budget for KPI panel', err)
      });
  }
}