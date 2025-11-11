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
  totalIncome: number = 0;
  totalExpenses: number = 0;
  netSavings: number = 0;
  budgetAdherence: number = 0;
  selectedPeriod: string = 'monthly';
  constructor(
    private expensesService: ExpensesService,
    private incomeService: IncomeService
  ) {}

  ngOnInit(): void {
    this.expenses = this.expensesService.getStaticExpenses();
    this.income = this.incomeService.getStaticIncome();
    this.calculateSummaries();
  }

  calculateSummaries(): void {
    this.totalIncome = this.income.reduce((sum, inc) =>
      sum + inc.currentAmount, 0);
    this.totalExpenses = this.expenses.reduce((sum, exp) =>
      sum + exp.currentAmount, 0);
    this.netSavings = this.totalIncome - this.totalExpenses;
    const totalAllocated = this.expenses.reduce((sum, exp) =>
      sum + exp.allocatedAmount, 0);
    this.budgetAdherence = totalAllocated > 0 ? Math.max(0,
      ((totalAllocated - this.totalExpenses) / totalAllocated) * 100) : 0;
  }

  isOverspent(expense: Expenses): boolean {
    return expense.currentAmount > expense.allocatedAmount;
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
    // For now, no actual filtering since data is static
  }


}
