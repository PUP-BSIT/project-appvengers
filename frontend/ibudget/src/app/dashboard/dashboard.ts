import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { DoughnutChart } from './doughnut-chart/doughnut-chart';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, DoughnutChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  
}
