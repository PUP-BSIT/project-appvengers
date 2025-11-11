import { Component, OnInit } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { ExpensesService } from '../../services/expenses';
import { IncomeService } from '../../services/income';
import { Expenses, Income } from '../../models/user.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-reports',
  imports: [Sidebar, Header, CurrencyPipe],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  expenses: Expenses[] = [];
  income: Income[] = [];

  constructor(
    private expensesService: ExpensesService,
    private incomeService: IncomeService
  ) {}

  ngOnInit(): void {
    this.expenses = this.expensesService.getStaticExpenses();
    this.income = this.incomeService.getStaticIncome();
  }
}
