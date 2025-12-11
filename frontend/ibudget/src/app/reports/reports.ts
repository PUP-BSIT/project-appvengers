import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { FormsModule } from '@angular/forms';
import { MonthlyReport } from '../../models/user.model';
import { TransactionsService } from '../../services/transactions.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, Sidebar, Header, FormsModule, BaseChartDirective],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  monthlyReports: MonthlyReport[] = [];
  lastMonthReport?: MonthlyReport;
  thisMonthReport?: MonthlyReport;
  activeTab: 'lastMonth' | 'thisMonth' = 'thisMonth';

  // Chart configuration
  chartType: ChartType = 'doughnut';
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      }
    }
  };

  // Income chart data
  thisMonthIncomeChartData!: ChartData<'doughnut'>;
  lastMonthIncomeChartData!: ChartData<'doughnut'>;

  // Expense chart data
  thisMonthExpenseChartData!: ChartData<'doughnut'>;
  lastMonthExpenseChartData!: ChartData<'doughnut'>;

  constructor(private transactionsService: TransactionsService) {}

  ngOnInit(): void {
    // Debug: Check if user is logged in
    const token = localStorage.getItem('iBudget_authToken');
    
    this.loadMonthlyReports();
    this.initializeCharts();
  }

  private loadMonthlyReports(): void {
    this.transactionsService.getMonthlyReports().subscribe({
      next: (reports: MonthlyReport[]) => {
        this.monthlyReports = reports;
        // Backend returns [thisMonth, lastMonth]
        if (reports.length >= 2) {
          this.thisMonthReport = reports[0];
          this.lastMonthReport = reports[1];
          
          // Populate charts with backend data
          this.populateCharts();
        }
      },
      error: (err) => {
        console.error('Error fetching monthly reports:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
      }
    });
  }

  private initializeCharts(): void {
    // Charts will be populated from backend data
    // Placeholder empty data
    this.thisMonthIncomeChartData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    };

    this.lastMonthIncomeChartData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    };

    this.thisMonthExpenseChartData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    };

    this.lastMonthExpenseChartData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    };
  }

  private populateCharts(): void {
    if (!this.thisMonthReport || !this.lastMonthReport) return;

    // This Month Income Chart
    const thisMonthIncomeCategories = Object.keys(this.
        thisMonthReport.incomeByCategory);
    const thisMonthIncomeValues = Object.values(this.
        thisMonthReport.incomeByCategory);
    this.thisMonthIncomeChartData = {
      labels: thisMonthIncomeCategories,
      datasets: [{
        data: thisMonthIncomeValues,
        backgroundColor: this.
          generateColors(thisMonthIncomeCategories.length, 'income'),
        borderColor: this.
          generateColors(thisMonthIncomeCategories.length, 'income', true),
        borderWidth: 1
      }]
    };

    // Last Month Income Chart
    const lastMonthIncomeCategories = Object.keys(this.
      lastMonthReport.incomeByCategory);
    const lastMonthIncomeValues = Object.values(this.
      lastMonthReport.incomeByCategory);
    this.lastMonthIncomeChartData = {
      labels: lastMonthIncomeCategories,
      datasets: [{
        data: lastMonthIncomeValues,
        backgroundColor: this.
          generateColors(lastMonthIncomeCategories.length, 'income'),
        borderColor: this.
          generateColors(lastMonthIncomeCategories.length, 'income', true),
        borderWidth: 1
      }]
    };

    // This Month Expense Chart
    const thisMonthExpenseCategories = Object.keys(this.
      thisMonthReport.expenseByCategory);
    const thisMonthExpenseValues = Object.values(this.
      thisMonthReport.expenseByCategory);
    this.thisMonthExpenseChartData = {
      labels: thisMonthExpenseCategories,
      datasets: [{
        data: thisMonthExpenseValues,
        backgroundColor: this.
          generateColors(thisMonthExpenseCategories.length, 'expense'),
        borderColor: this.
          generateColors(thisMonthExpenseCategories.length, 'expense', true),
        borderWidth: 1
      }]
    };

    // Last Month Expense Chart
    const lastMonthExpenseCategories = Object.keys(this.
      lastMonthReport.expenseByCategory);
    const lastMonthExpenseValues = Object.values(this.
      lastMonthReport.expenseByCategory);
    this.lastMonthExpenseChartData = {
      labels: lastMonthExpenseCategories,
      datasets: [{
        data: lastMonthExpenseValues,
        backgroundColor: this.
          generateColors(lastMonthExpenseCategories.length, 'expense'),
        borderColor: this.
          generateColors(lastMonthExpenseCategories.length, 'expense', true),
        borderWidth: 1
      }]
    };
  }

  private generateColors(count: number, type: 'income' | 'expense',
      border: boolean = false): string[] {
    const alpha = border ? '1' : '0.8';
    const colors: string[] = [];
    
    if (type === 'income') {
      const incomeColors = [
        `rgba(16, 185, 129, ${alpha})`,
        `rgba(59, 130, 246, ${alpha})`,
        `rgba(139, 92, 246, ${alpha})`,
        `rgba(249, 115, 22, ${alpha})`,
        `rgba(34, 197, 94, ${alpha})`,
        `rgba(168, 85, 247, ${alpha})`,
      ];
      for (let i = 0; i < count; i++) {
        colors.push(incomeColors[i % incomeColors.length]);
      }
    } else {
      const expenseColors = [
        `rgba(239, 68, 68, ${alpha})`,
        `rgba(245, 158, 11, ${alpha})`,
        `rgba(59, 130, 246, ${alpha})`,
        `rgba(139, 92, 246, ${alpha})`,
        `rgba(236, 72, 153, ${alpha})`,
        `rgba(107, 114, 128, ${alpha})`,
      ];
      for (let i = 0; i < count; i++) {
        colors.push(expenseColors[i % expenseColors.length]);
      }
    }
    
    return colors;
  }
}
