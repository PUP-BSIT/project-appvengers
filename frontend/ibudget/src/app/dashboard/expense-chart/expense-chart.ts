import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { TransactionsService } from '../../../services/transactions.service';

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './expense-chart.html',
  styleUrls: ['./expense-chart.scss'],
})
export class ExpenseChart implements OnInit {
  constructor(private transactionsService: TransactionsService) {}

  pieChartData = {
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        label: 'Expense Summary',
        backgroundColor: [
          '#FF6384', // Bills
          '#36A2EB', // Income
          '#FFCE56', // Food
          '#4BC0C0', // Transport
          '#9966FF', // Others
        ],
      },
    ],
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom', // ✅ now typed correctly
        labels: {
          color: '#333',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  ngOnInit(): void {
    this.transactionsService.getExpenseSummary().subscribe({
      next: (data) => {
        this.pieChartData.labels = data.labels;
        this.pieChartData.datasets[0].data = data.values;
      },
      error: (err) => console.error('Failed to load expense summary', err),
    });
  }
}