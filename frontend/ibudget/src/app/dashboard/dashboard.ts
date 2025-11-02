import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { ExpenseChart } from './expense-chart/expense-chart';
import { HistoryTable } from "./history-table/history-table";
import { Header } from "../header/header";
import { IncomeChart } from "./income-chart/income-chart";

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, HistoryTable, Header, IncomeChart, ExpenseChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  
}
