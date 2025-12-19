import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Budget } from '../../../models/user.model';
import { BudgetService } from '../../../services/budget.service';
import { AddBudgetButton } from "./add-budget-button/add-budget-button";
import { UpdateBudgetButton } from "./update-budget-button/update-budget-button";
import { BudgetProgressBar } from "./budget-progress-bar/budget-progress-bar";
import { Router } from '@angular/router';

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

  ngOnInit(): void {
    this.getBudgetsSummary();
    console.log(this.budgets());
  }

  getBudgets() {
    this.budgetService.getBudgets().subscribe(budgets => {
      this.budgets.set(budgets);
    });
  }

  getBudgetsSummary() {
    this.budgetService.getBudgetsSummary().subscribe(budgets => {
      this.budgets.set(budgets);
    });
  }

  // Get newly added budget
  onBudgetAdded(newBudget: Budget) {
    // this.budgets.set([...this.budgets(), newBudget]);
    // DONE: This fetches real data from backend after adding a new budget
    this.getBudgets();
  }

  // Get updated budget after editing
  onBudgetUpdated(updatedBudget: Budget) {
    // this.budgets.update(list =>
    //   list.map(b => b.id === updatedBudget.id ? updatedBudget : b)
    // );
    
    // DONE: This fetches real data from backend after adding a new budget
    this.getBudgets();
  }

  // Get updated budgets after deletion
  onBudgetDeleted(updatedBudgets: Budget[]) {
    this.budgets.set(updatedBudgets);
  }

  // Get the total budgeted amount across all budgets
  totalBudgetsAmount() {
    return this.budgets().reduce((t, b) => t + b.limit_amount, 0);
  }

  // Get the total spent amount across all budgets
  totalSpentAmount() {
    return this.budgets().reduce((t, b) => t + (b.current_amount ?? 0), 0);
  }

  // Get the count of budgets
  getBudgetsCount() {
    return this.budgets().length;
  }

  // Get the percentage of budget spent
  getBudgetPercent(budget: Budget): number {
    const limit = Number(budget.limit_amount ?? 0);
    const spent = Number(budget.current_amount ?? 0);
    if (!limit || limit <= 0) return 0;
    return Math.min(Math.round((spent / limit) * 100), 100);
  }

  viewBudgetDetails(budgetId: number) {
    this.router.navigate(['/budgets/view-budget/', budgetId]);
  }

  totalRemainingAmount() {
    return this.budgets().reduce(
      (t, b) => t + (b.remaining_amount ?? 0), 0
    );
  }
}