import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-income-chart',
  imports: [BaseChartDirective],
  templateUrl: './income-chart.html',
  styleUrl: './income-chart.scss',
})
export class IncomeChart {
  incomeChartData = {
    labels: ['Investments', 'Others'],
    datasets: [
      {
        data: [50, 45],
        label: 'Income Percentage',
        backgroundColor: [
          'rgb(60, 202, 23)',
          'rgb(255, 230, 90)'
        ]
      }
    ]
  }
}
