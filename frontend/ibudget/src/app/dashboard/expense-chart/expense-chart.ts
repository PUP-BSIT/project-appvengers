import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-expense-chart',
  imports: [BaseChartDirective],
  templateUrl: './expense-chart.html',
  styleUrl: './expense-chart.scss',
})
export class ExpenseChart {
  pieChartData = {
    labels: ['Bills', 'Food'],
    datasets: [
      {
        data: [20, 27],
        label: 'Expense Percentage'
      }
    ]
  } 
}
