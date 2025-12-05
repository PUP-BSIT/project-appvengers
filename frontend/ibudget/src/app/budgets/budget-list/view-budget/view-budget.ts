import { Component, inject, OnInit, signal } from '@angular/core';
import { Sidebar } from "../../../sidebar/sidebar";
import { Header } from "../../../header/header";
import { KpiPanel } from "../../kpi-panel/kpi-panel";
import { AddBudgetExpense } from "./add-budget-expense/add-budget-expense";
import { UpdateBudgetExpense } from "./update-budget-expense/update-budget-expense";
import { CategoriesService } from '../../../../services/categories.service';
import { BudgetTransactionsService } from '../../../../services/budget.transactions.service';
import { BudgetTransaction, Category } from '../../../../models/user.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-budget',
  imports: [Sidebar, Header, KpiPanel, AddBudgetExpense, UpdateBudgetExpense],
  templateUrl: './view-budget.html',
  styleUrl: './view-budget.scss',
})
export class ViewBudget implements OnInit {
  // Services
  budgetTxService = inject(BudgetTransactionsService);
  categoriesService = inject(CategoriesService);
  activatedRoute = inject(ActivatedRoute);

  // State
  budgetExpenses = signal<BudgetTransaction[]>([]);
  categories = signal<Category[]>([]);
  budgetId = signal<number>(0);

  ngOnInit(): void {
    this.initBudgetId();
    this.getCategories();
    this.getBudgetExpenses();
  }

  initBudgetId() {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.budgetId.set(id);
  }

  getBudgetExpenses() {
    const id = this.budgetId();
    if (!id) return;

    this.budgetTxService.getByBudgetId(id).subscribe({
      next: (transactions) => this.budgetExpenses.set(transactions),
      error: (err) => console.error('Failed to load budget expenses', err)
    });
  }

  getCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  getCategoryName(categoryId: number): string {
    const cat = this.categories().find(c => c.id === categoryId);
    return cat ? cat.name : `Category ${categoryId}`;
  }

  deleteBudgetExpense(transactionId: number) {
    this.budgetTxService.delete(transactionId).subscribe({
      next: () => this.getBudgetExpenses(),
      error: (err) => console.error('Failed to delete expense', err)
    });
  }

  onBudgetExpenseAdded(_event: BudgetTransaction) {
    this.getBudgetExpenses();
  }

  onBudgetExpenseUpdated(_event: BudgetTransaction) {
    this.getBudgetExpenses();
  }
}