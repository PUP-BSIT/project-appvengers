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
    // If a period is selected, attempt to filter income/expenses by that period
    const period = this.selectedPeriod;
    const incomes = this.filterByPeriod(this.income ?? [], period);
    const expenses = this.filterByPeriod(this.expenses ?? [], period);

    this.totalIncome = (incomes ?? []).reduce((s, it) => {
      if (!it) return s;
      const val = (it.amount !== undefined ? it.amount : it.currentAmount);
      return s + (Number(val) || 0);
    }, 0);

    this.totalExpenses = (expenses ?? []).reduce((s, it) => {
      if (!it) return s;
      const val = (it.currentAmount !== undefined ? it.currentAmount : it.allocatedAmount);
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
  private hasDateField(item: unknown): item is { date: string | Date } {
    if (!item || typeof item !== 'object') return false;
    return 'date' in (item as Record<string, unknown>);
  }

  private toDate(value: string | Date): Date | null {
    if (value instanceof Date) return value;
    const d = new Date(String(value));
    return isNaN(d.getTime()) ? null : d;
  }

  private filterByPeriod<T>(items: T[], period: string): T[] {
    if (!items || items.length === 0) return items;
    if (!this.hasDateField(items[0])) return items;

    const now = new Date();
    return items.filter((it) => {
      const dateValue = (it as unknown as { date: string | Date }).date;
      const d = this.toDate(dateValue);
      if (!d) return false;

      switch (period) {
        case 'daily':
          return d.toDateString() === now.toDateString();
        case 'weekly': {
          const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff < 7;
        }
        case 'monthly':
        default:
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
    });
  }
}
