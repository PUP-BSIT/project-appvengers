import { AfterViewInit, Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from "ng2-charts";

@Component({
  selector: 'app-categories-panel',
  imports: [BaseChartDirective],
  templateUrl: './categories-panel.html',
  styleUrl: './categories-panel.scss',
})
export class CategoriesPanel implements OnInit {
  @ViewChild('categoryType') categoryType!: ElementRef;
  chartType: ChartType = 'bar';
  activeChartTitle = signal('Expenses Overview');
  activeChartData!: ChartData<'bar' | 'line'> ;

  expensesCategories = signal([
    'Bills', 'Food', 'Shopping', 'Entertainment', 'Health', 'Transport', 
      'Education', 'Utilities', 'Others'
  ]);

  incomeCategories = signal([
    'Salary', 'Business', 'Investments', 'Gifts', 'Others'
  ]);

  expensesChartData: ChartData<'bar' | 'line'> = {
    labels: this.expensesCategories(),
    datasets: [
      {
        label: 'Bar Dataset',
        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 90],
        type: 'bar',
        backgroundColor: [
          'rgba(255, 99, 132, 0.4)',
          'rgba(255, 159, 64, 0.4)',
          'rgba(255, 205, 86, 0.4)',
          'rgba(75, 192, 192, 0.4)',
          'rgba(54, 162, 235, 0.4)',
          'rgba(0, 108, 74, 0.4)',
          'rgba(255, 66, 249, 0.4)',
          'rgba(255, 179, 0, 0.4)',
          'rgba(0, 11, 159, 0.4)',
        ],
      },
      {
        label: 'Line Dataset',
        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 90],
        type: 'line',
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }
    ]
  }

  incomeData: ChartData<'bar' | 'line'> = {
      labels: this.incomeCategories(),
      datasets: [
        {
          label: 'Bar Dataset',
          data: [75, 70, 85, 60, 80],
          type: 'bar',
          backgroundColor: [
          'rgba(255, 99, 132, 0.4)',
          'rgba(255, 159, 64, 0.4)',
          'rgba(255, 205, 86, 0.4)',
          'rgba(75, 192, 192, 0.4)',
          'rgba(54, 162, 235, 0.4)'
        ],
      },
      {
        label: 'Line Dataset',
        data: [75, 70, 85, 60, 80],
        type: 'line',
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }
    ],
  }

  ngOnInit(): void {
    this.activeChartData = JSON.parse(JSON.stringify(this.expensesChartData));
  }

  logCategoryType() {
    const selectedType = this.categoryType.nativeElement.value;

    switch(selectedType) {
      case "1": 
        this.activeChartData = JSON.parse(JSON.stringify(this.expensesChartData));
        this.activeChartTitle.set('Expenses Overview');
        break;
      case "2":
        this.activeChartData = JSON.parse(JSON.stringify(this.incomeData));
        this.activeChartTitle.set('Income Overview');
        break;
      default:
        this.activeChartData = JSON.parse(JSON.stringify(this.expensesChartData));
        this.activeChartTitle.set('Expenses Overview');
        break;
    }
  }
}
