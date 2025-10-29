import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { DoughnutChart } from './doughnut-chart/doughnut-chart';
import { HistoryTable } from "./history-table/history-table";

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, DoughnutChart, HistoryTable],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  
}
