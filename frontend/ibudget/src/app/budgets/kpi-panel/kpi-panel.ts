import { Component, OnInit, ChangeDetectorRef, signal, inject } from '@angular/core';
import { RoundProgressComponent } from 'angular-svg-round-progressbar';
import { Budget } from '../../../models/user.model';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MockupsService } from '../../../services/mockups.service';

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
  mockupService = inject(MockupsService);
  currentBudget = signal<Budget>({} as Budget);
  budgetId = signal<number>(Number(this.activatedRoute.snapshot.paramMap.get('id') ?? 1));

  // constructor(
  //   private http: HttpClient,
  //   private auth: AuthService,
  //   private cd: ChangeDetectorRef
  // ) {}

  ngOnInit(): void {
    // TODO: Change this to real fetch to database.
    // React to id changes with a safe fallback (1)
    this.activatedRoute.paramMap.subscribe((params) => {
      const id = Number(params.get('id') ?? 1);
      this.budgetId.set(id);
      this.getBudgetData();
    });
  }

  // Fetch budget data based on budgetId (mockup service)
  getBudgetData() {
    const id = this.budgetId();
    this.mockupService.getMockBudgetsById(id)
      .subscribe({
        next: (budget) => {
          this.currentBudget.set(budget)
          this.totalBudget = budget.limit_amount;

          // For mockup purposes, let's assume totalExpenses is 60% of limit_amount
          // TODO: Change this to real fetch to database.
          this.totalExpenses = budget.limit_amount * 0.6;
          this.remainingBudget = this.totalBudget - this.totalExpenses;
          this.budgetPercent = (this.totalExpenses / this.totalBudget) * 100;
        },
        error: (err) => console.error('Failed to load budget for KPI panel', err)
      });
  }
}