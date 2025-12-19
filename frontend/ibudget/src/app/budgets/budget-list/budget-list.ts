import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Budget } from '../../../models/user.model';
import { BudgetService } from '../../../services/budget.service';
import { AddBudgetButton } from "./add-budget-button/add-budget-button";
import { UpdateBudgetButton } from "./update-budget-button/update-budget-button";
import { BudgetProgressBar } from "./budget-progress-bar/budget-progress-bar";
import { Router } from '@angular/router';
import { BudgetTransactionsService } from '../../../services/budget.transactions.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-budget-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AddBudgetButton,
    UpdateBudgetButton,
    BudgetProgressBar
],
  templateUrl: './budget-list.html',
  styleUrl: './budget-list.scss',
})

export class BudgetList implements OnInit {
  budgets = signal<Budget[]>([]);
  budgetService = inject(BudgetService);
  router = inject(Router);
  budgetTransactionsService = inject(BudgetTransactionsService);

  ngOnInit(): void {
    this.getBudgets();
  }

  // Hydrate budgets with summary data 
  private hydrateBudgets(budgets: Budget[]) {
    const calls = budgets.map(b =>
      this.budgetTransactionsService.getBudgetSummary(b.id).pipe(
        map(summary => ({
          ...b,
          limit_amount: summary.limitAmount,
          current_amount: summary.totalExpenses,
          remaining_amount: summary.remainingBudget
        })),
        catchError(err => {
          console.warn(`Skipping budget ${b.id}:`, err);
          return of(b);
        })
      )
    );
    return forkJoin(calls); 
  }

  // Fetch budgets and enrich with summaries
  getBudgets() {
    this.budgetService.getBudgets()
      .pipe(switchMap(budgets => this.hydrateBudgets(budgets)))
      .subscribe({
        next: hydrated => this.budgets.set(hydrated),
        error: err => console.error('Failed to load budgets', err)
      });
  }

  // Handle add/update/delete by re-fetching hydrated budgets
  onBudgetAdded(_: Budget) {
    this.getBudgets();
  }

  onBudgetUpdated(_: Budget) {
    this.getBudgets();
  }

  onBudgetDeleted(updatedBudgets: Budget[]) {
    this.hydrateBudgets(updatedBudgets).subscribe({
      next: hydrated => this.budgets.set(hydrated),
      error: err => console.error('Failed to hydrate after delete', err)
    });
  }

  // Totals and helpers
  totalBudgetsAmount() {
    return this.budgets().reduce((t, b) => t + b.limit_amount, 0);
  }

  totalSpentAmount() {
    return this.budgets().reduce((t, b) => t + (b.current_amount ?? 0), 0);
  }

  getBudgetsCount() {
    return this.budgets().length;
  }

  getBudgetPercent(budget: Budget): number {
    const limit = Number(budget.limit_amount ?? 0);
    const spent = Number(budget.current_amount ?? 0);
    if (!limit || limit <= 0) return 0;
    return Math.min(Math.round((spent / limit) * 100), 100);
  }

  viewBudgetDetails(budgetId: number) {
    this.router.navigate(['/budgets/view-budget/', budgetId]);
  }
}
