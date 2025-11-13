import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { ExpenseChart } from './expense-chart/expense-chart';
import { HistoryTable } from "./history-table/history-table";
import { Header } from "../header/header";
import { IncomeChart } from "./income-chart/income-chart";
import { DecimalPipe } from '@angular/common';
import { HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-dashboard',
  imports: [
    Sidebar, 
    HistoryTable, 
    Header, 
    IncomeChart, 
    ExpenseChart, 
    DecimalPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  username: string = '';
  remainingBudget: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('api/user/profile').subscribe({
      next: (res) => {
        this.username = res.username;
        this.remainingBudget = res.remainingBudget;
      },
      error: () => {
        this.username = 'User';
        this.remainingBudget = 0;
      }
    });
  }
}
