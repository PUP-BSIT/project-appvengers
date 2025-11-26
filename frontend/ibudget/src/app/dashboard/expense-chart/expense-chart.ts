import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { TransactionsService } from '../../../services/transactions.service';

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './expense-chart.html',
  styleUrl: './expense-chart.scss',
})

export class ExpenseChart implements OnInit {
  constructor(private transactionsService: TransactionsService) {}

  pieChartData = {
    labels: ['Bills', 'Food'],
    datasets: [
      {
        data: [20, 27],
        label: 'Expense Percentage'
      }
    ]
  };

  ngOnInit(): void {
    this.transactionsService.getExpenseSummary().subscribe({
      next: (data) => {
        this.pieChartData.labels = data.labels;
        this.pieChartData.datasets[0].data = data.values;
      },
      error: (err) => console.error('Failed to load expense summary', err)
    });
  }
}