import { Component, inject, OnInit, signal } from '@angular/core';
import { Sidebar } from "../../../sidebar/sidebar";
import { Header } from "../../../header/header";
import { KpiPanel } from "../../kpi-panel/kpi-panel";
import { AddBudgetExpense } from "./add-budget-expense/add-budget-expense";
import { UpdateBudgetExpense } from "./update-budget-expense/update-budget-expense";
import { CategoriesService } from '../../../../services/categories.service';
import { MockupsService } from '../../../../services/mockups.service';
import { BudgetTransaction, Category } from '../../../../models/user.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-budget',
  imports: [Sidebar, Header, KpiPanel, AddBudgetExpense, UpdateBudgetExpense],
  templateUrl: './view-budget.html',
  styleUrl: './view-budget.scss',
})
export class ViewBudget implements OnInit {
  mockupService = inject(MockupsService);
  categoriesService = inject(CategoriesService);
  budgetExpenses = signal<BudgetTransaction[]>([]);
  categories = signal<Category[]>([]);
  activatedRoute = inject(ActivatedRoute);
  budgetId = signal('');

  ngOnInit(): void {
    // Get Budget Expenses
    this.getBudgetExpenses();
    this.getCategories();   
  }

  getBudgetExpenses() {
    const budgetId = this.activatedRoute.snapshot.paramMap.get('id');
    this.mockupService.getMockBudgetTransactionsByBudgetId(Number(budgetId))
      .subscribe((transactions: BudgetTransaction[]) => {
        this.budgetExpenses.set(transactions);
      });
  }

  getCategories() {
    this.categoriesService.getCategories()
      .subscribe((cats: Category[]) => {
        this.categories.set(cats);
      });
  }

  getCategoryName(categoryId: number): string {
    const cat = this.categories().find(c => c.id === categoryId);
    return cat ? cat.name : `Category ${categoryId}`;
  }

  deleteBudgetExpense(transactionId: number) {
    this.mockupService.deleteMockBudgetTransaction(transactionId)
      .subscribe(() => {
        this.getBudgetExpenses();
      });
  }

  onBudgetExpenseAdded(event: BudgetTransaction) {
    // Refresh the budget expenses list
    this.getBudgetExpenses();
  }

  onBudgetExpenseUpdated(event: BudgetTransaction) {
    // Refresh the budget expenses list
    this.getBudgetExpenses();
  }
}