import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { ExpenseChart } from './expense-chart/expense-chart';
import { Header } from "../header/header";
import { IncomeChart } from "./income-chart/income-chart";
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SpendingChart } from "./spending-chart/spending-chart";

@Component({
  selector: 'app-dashboard',
  imports: [
    Sidebar,
    Header,
    IncomeChart,
    ExpenseChart,
    DecimalPipe,
    SpendingChart
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class Dashboard{
  username: string = 'User';
  remainingBudget: number = 0;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.username = res.data.username;
          // this.remainingBudget = res.data.remainingBudget ?? 0;
        }
      },
      error: () => {
        this.username = 'User';
        this.remainingBudget = 0;
      }
    });
  }
}

