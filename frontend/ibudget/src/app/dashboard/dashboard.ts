import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { DoughnutChart } from './doughnut-chart/doughnut-chart';
import { HistoryTable } from "./history-table/history-table";
import { Header } from "../header/header";
import { IncomeChart } from "./income-chart/income-chart";

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, DoughnutChart, HistoryTable, Header, IncomeChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  
}
