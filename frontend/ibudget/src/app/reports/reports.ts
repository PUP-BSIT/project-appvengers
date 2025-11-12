import { Component, OnInit } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { ExpensesService } from '../../services/expenses';
import { IncomeService } from '../../services/income';
import { Expenses, Income } from '../../models/user.model';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  imports: [Sidebar, Header, CurrencyPipe, DecimalPipe, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  expenses: Expenses[] = [];
  income: Income[] = [];
  // computed summary values used by the template
  totalIncome = 0;
  totalExpenses = 0;
  netSavings = 0;
  budgetAdherence = 0; // percentage
  selectedPeriod = 'monthly';

  constructor(
    private expensesService: ExpensesService,
    private incomeService: IncomeService
  ) {}

  ngOnInit(): void {
    this.expenses = this.expensesService.getStaticExpenses();
    this.income = this.incomeService.getStaticIncome();
    this.computeTotals();
  }
  
  computeTotals(): void {
    this.totalIncome = (this.income ?? []).reduce((s, it) => {
      const val = (it.amount !== undefined ? it.amount : it.currentAmount);
      return s + (Number(val) || 0);
    }, 0);

    this.totalExpenses = (this.expenses ?? []).reduce((s, it) => {
      const val = (it.currentAmount !== undefined ? it.currentAmount :
        it.allocatedAmount);
      return s + (Number(val) || 0);
    }, 0);
    this.netSavings = this.totalIncome - this.totalExpenses;
    this.budgetAdherence = this.totalIncome > 0 ? Math.round(
      (this.totalExpenses / this.totalIncome) * 100) : 0;
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
    this.computeTotals();
  }

  private hasName(item: unknown): item is { name: string } {
    const rec = item as Record<string, unknown> | null;
    return !!rec && typeof rec['name'] === 'string';
  }

  trackByName(index: number, item: Expenses | Income | null | undefined): string | number {
    if (this.hasName(item)) return item.name;
    return index;
  }

  isOverspent(expense: Expenses): boolean {
    if (!expense) return false;
    const current = Number(expense.currentAmount) || 0;
    const allocated = Number(expense.allocatedAmount) || 0;
    return current > allocated;
  }
}
