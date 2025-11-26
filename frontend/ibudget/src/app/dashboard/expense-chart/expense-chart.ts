import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartDataset } from 'chart.js';
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
    datasets: [] as ChartDataset<'doughnut'>[],
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#333' },
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
        this.pieChartData = {
          labels: data.labels,
          datasets: [
            {
              data: data.values,
              label: 'Expense Summary',
              backgroundColor: this.generateColors(data.labels.length),
            },
          ],
        };
        console.log('Chart data:', this.pieChartData);
      },
      error: (err) => console.error('Failed to load expense summary', err),
    });
  }

  private generateColors(count: number): string[] {
    const palette = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360',
      '#C9CBCF', '#8E44AD', '#2ECC71', '#E67E22', '#1ABC9C'
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }
}