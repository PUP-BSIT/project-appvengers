import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-doughnut-chart',
  imports: [BaseChartDirective],
  templateUrl: './doughnut-chart.html',
  styleUrl: './doughnut-chart.scss',
})
export class DoughnutChart implements OnInit {
  pieChartData = {
    labels: ['Bills', 'Food'],
    datasets: [
      {
        data: [1, 2],
        label: 'Sales Percent'
      }
    ]
  } 

  constructor() {

  }

  ngOnInit(): void {
      
  }
}
