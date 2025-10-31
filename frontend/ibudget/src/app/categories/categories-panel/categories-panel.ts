import { AfterViewInit, Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from "ng2-charts";

@Component({
  selector: 'app-categories-panel',
  imports: [BaseChartDirective],
  templateUrl: './categories-panel.html',
  styleUrl: './categories-panel.scss',
})
export class CategoriesPanel implements OnInit {
  @ViewChild('categoryType') categoryType!: ElementRef;
  activeChartData!: ChartData<'bar' | 'line'> ;

  expensesCategories = signal([
    'Bills', 'Food', 'Shopping', 'Entertainment', 'Health', 'Transport', 
      'Education', 'Utilities', 'Others'
  ]);

  incomeCategories = signal([
    'Salary', 'Business', 'Investments', 'Gifts', 'Others'
  ]);

  expensesChartData: ChartData<'bar'> = {
    labels: this.expensesCategories(),
    datasets: [
      {
        label: 'Categories Expenses Overview',
        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 90],
    }]
  }

  incomeData: ChartData<'bar'> = {
      labels: this.incomeCategories(),
      datasets: [
        {
          label: 'Categories Income Overview',
          data: [75, 70, 85, 60, 80],
          backgroundColor: [
          'rgba(255, 99, 132, 0.4)',
          'rgba(255, 159, 64, 0.4)',
          'rgba(255, 205, 86, 0.4)',
          'rgba(75, 192, 192, 0.4)',
          'rgba(54, 162, 235, 0.4)'
      ],
    }],
  }

  ngOnInit(): void {
    this.activeChartData = JSON.parse(JSON.stringify(this.expensesChartData));
  }

  logCategoryType() {
    const selectedType = this.categoryType.nativeElement.value;

    if (selectedType === 'expenses') {
      this.activeChartData = JSON.parse(JSON.stringify(this.expensesChartData));
    } else if(selectedType === 'income') {
      this.activeChartData = JSON.parse(JSON.stringify(this.incomeData));
    }
  }
}
