import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { ExpenseChart } from './expense-chart/expense-chart';
import { Header } from "../header/header";
import { IncomeChart } from "./income-chart/income-chart";
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SpendingChart } from "./spending-chart/spending-chart";
import { OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

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

export class Dashboard implements OnInit{
  username: string | null = null;
  remainingBudget: number = 0;

  constructor(
    public auth: AuthService, 
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.username = res.data.username;
          this.cd.detectChanges();
          //this.remainingBudget = res.data.remainingBudget ?? 0;
        }
      },
      error: () => {
        this.auth.logout();
        this.router.navigate(['/login-page']);
      }
    });
  }
}

