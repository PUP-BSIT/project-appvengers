import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartDataset } from 'chart.js';
import { TransactionsService } from '../../../services/transactions.service';

@Component({
  selector: 'app-income-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './income-chart.html',
  styleUrls: ['./income-chart.scss'],
})

export class IncomeChart implements OnInit {
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
    this.transactionsService.getIncomeSummary().subscribe({
      next: (data) => {
        this.pieChartData = {
          labels: data.labels,
          datasets: [
            {
              data: data.values,
              label: 'Income Summary',
              backgroundColor: this.generateColors(data.labels.length),
            },
          ],
        };
        console.log('Income chart data:', this.pieChartData);
      },
      error: (err) => console.error('Failed to load income summary', err),
    });
  }

  private generateColors(count: number): string[] {
    const palette = [
      '#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0',
      '#00BCD4', '#8BC34A', '#CDDC39', '#FF9800', '#795548',
      '#607D8B', '#E91E63', '#3F51B5', '#009688', '#673AB7'
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }
}