import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType,} from 'chart.js';

@Component({
  selector: 'app-spending-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './spending-chart.html',
  styleUrl: './spending-chart.scss',
})
export class SpendingChart implements OnInit{  
  // Chart configuration and data would go here
  chartType: ChartType = 'bar';
  spendingChartData!: ChartData<'bar'>;
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  
  ngOnInit(): void {
    this.setupSpendingChart();
  }

  setupSpendingChart() {
    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Spending Over Time',
          data: [1200, 1500, 1000, 1700, 1300, 1600, 1800],
          backgroundColor: 'rgba(54, 162, 235, 0.4)',
        }]
    }

    this.spendingChartData = {
      labels: labels,
      datasets: data.datasets,
    }
  }
}
