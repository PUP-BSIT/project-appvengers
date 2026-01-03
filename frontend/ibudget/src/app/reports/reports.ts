import { Component, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Header } from "../header/header";
import { FormsModule } from '@angular/forms';
import { MonthlyReport } from '../../models/user.model';
import { TransactionsService } from '../../services/transactions.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, Header, FormsModule, BaseChartDirective, ToggleableSidebar],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  monthlyReports: MonthlyReport[] = [];
  lastMonthReport?: MonthlyReport;
  thisMonthReport?: MonthlyReport;
  activeTab: 'lastMonth' | 'thisMonth' = 'thisMonth';

  // Loading State
  isLoading = signal(false);

  // Chart configuration (doughnut)
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

  // Chart configuration (bar)
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            const bgColors = data.datasets[0].backgroundColor as string[];
            return (data.labels ?? []).map((label, i) => ({
              text: String(label),          
              fillStyle: bgColors[i],
              strokeStyle: bgColors[i],
              lineWidth: 1,
              hidden: false,
              index: i
            }));
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#333' },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#333' },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    }
  };

  // Income chart data
  thisMonthIncomeChartData!: ChartData<'doughnut'>;
  lastMonthIncomeChartData!: ChartData<'doughnut'>;

  // Expense chart data
  thisMonthExpenseChartData!: ChartData<'doughnut'>;
  lastMonthExpenseChartData!: ChartData<'doughnut'>;

  // Income bar chart data
  thisMonthIncomeBarChartData!: ChartData<'bar'>;
  lastMonthIncomeBarChartData!: ChartData<'bar'>;

  // Expense bar chart data
  thisMonthExpenseBarChartData!: ChartData<'bar'>;
  lastMonthExpenseBarChartData!: ChartData<'bar'>;

  constructor(private transactionsService: TransactionsService) {}

  ngOnInit(): void {
    // Debug: Check if user is logged in
    const token = localStorage.getItem('iBudget_authToken');
    
    this.loadMonthlyReports();
    this.initializeCharts();
  }

  private loadMonthlyReports(): void {
    // Show loading skeleton
    this.isLoading.set(true);

    this.transactionsService.getMonthlyReports().pipe(
      finalize(() => {
        // small debounce so skeleton doesn't flash for very fast responses
        setTimeout(() => this.isLoading.set(false), 250);
      })
    ).subscribe({
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

    this.thisMonthExpenseBarChartData = {
      labels: [],
      datasets: [{
      data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    };

    this.lastMonthExpenseBarChartData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    };

    this.thisMonthIncomeBarChartData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    };

    this.lastMonthIncomeBarChartData = {
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

    // This Month Expense Bar Chart
    this.thisMonthExpenseBarChartData = {
      labels: Object.keys(this.thisMonthReport.expenseByCategory),
      datasets: [{
        label: 'Expenses',
        data: Object.values(this.thisMonthReport.expenseByCategory),
        backgroundColor: this.generateColors(
          Object.keys(this.thisMonthReport.expenseByCategory).length, 'expense'
        ),
        borderColor: this.generateColors(
          Object.keys(this.thisMonthReport.expenseByCategory).
          length, 'expense', true
        ),
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.4 
      }]
    };

    // Last Month Expense Bar Chart
    this.lastMonthExpenseBarChartData = {
      labels: Object.keys(this.lastMonthReport.expenseByCategory),
      datasets: [{
        label: 'Expenses',
        data: Object.values(this.lastMonthReport.expenseByCategory),
        backgroundColor: this.generateColors(
          Object.keys(this.lastMonthReport.expenseByCategory).length, 'expense'
        ),
        borderColor: this.generateColors(
          Object.keys(this.lastMonthReport.expenseByCategory).
          length, 'expense', true
        ),
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.4 
      }]
    };

    // This Month Income Bar Chart
    this.thisMonthIncomeBarChartData = {
      labels: Object.keys(this.thisMonthReport.incomeByCategory),
      datasets: [{
        label: 'Income',
        data: Object.values(this.thisMonthReport.incomeByCategory),
        backgroundColor: this.generateColors(
          Object.keys(this.thisMonthReport.incomeByCategory).length, 'income'
        ),
        borderColor: this.generateColors(
          Object.keys(this.thisMonthReport.incomeByCategory).
          length, 'income', true
        ),
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.4
      }]
    };

    // Last Month Income Bar Chart
    this.lastMonthIncomeBarChartData = {
      labels: Object.keys(this.lastMonthReport.incomeByCategory),
      datasets: [{
        label: 'Income',
        data: Object.values(this.lastMonthReport.incomeByCategory),
        backgroundColor: this.generateColors(
          Object.keys(this.lastMonthReport.incomeByCategory).length, 'income'
        ),
        borderColor: this.generateColors(
          Object.keys(this.lastMonthReport.incomeByCategory).
          length, 'income', true
        ),
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.4
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

  exportToPdf(): void {
    if (!this.thisMonthReport || !this.lastMonthReport) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(45, 90, 135); // #2D5A87
    doc.setFont('helvetica', 'bold');
    const title = `iBudget Financial Report Summary`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleWidth = doc.getTextWidth(title);
    const xOffset = (pageWidth - titleWidth) / 2;
    doc.text(title, xOffset, 22);
    
    const addReportToDoc = (report: MonthlyReport, startY: number) => {
      let y = startY;
      doc.setFontSize(18);
      doc.setTextColor(45, 90, 135); // #2D5A87
      doc.setFont('helvetica', 'bold');
      doc.text(`${report.monthName} Report`, 14, y);
      y += 10;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Reset to black
      doc.setFont('helvetica', 'normal');
      
      // Total Income
      doc.text(`Total Income: `, 14, y);
      doc.setTextColor(16, 185, 129); // Green
      doc.text(`PHP ${report.totalIncome.toFixed(2)}`, 14 + doc.getTextWidth('Total Income: '), y);
      y += 6;

      // Total Expenses
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Expenses: `, 14, y);
      doc.setTextColor(239, 68, 68); // Red
      doc.text(`PHP ${report.totalSpent.toFixed(2)}`, 14 + doc.getTextWidth('Total Expenses: '), y);
      y += 6;

      // Net Balance
      doc.setTextColor(0, 0, 0);
      doc.text(`Net Balance: `, 14, y);
      doc.setTextColor(45, 90, 135); // #2D5A87
      doc.text(`PHP ${(report.totalIncome - report.totalSpent).toFixed(2)}`, 14 + doc.getTextWidth('Net Balance: '), y);
      y += 10;

      // Income Table
      const incomeData = Object.entries(report.incomeByCategory).map(([category, amount]) => [category, `PHP ${amount.toFixed(2)}`]);
      if (incomeData.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Income Breakdown', 14, y);
        doc.setFont('helvetica', 'normal');
        autoTable(doc, {
          startY: y + 2,
          head: [['Category', 'Amount']],
          body: incomeData,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129] }
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Expense Table
      const expenseData = Object.entries(report.expenseByCategory).map(([category, amount]) => [category, `PHP ${amount.toFixed(2)}`]);
      if (expenseData.length > 0) {
        if (y + 20 > doc.internal.pageSize.getHeight()) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Expense Breakdown', 14, y);
        doc.setFont('helvetica', 'normal');
        autoTable(doc, {
          startY: y + 2,
          head: [['Category', 'Amount']],
          body: expenseData,
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68] }
        });
        y = (doc as any).lastAutoTable.finalY + 15;
      }
      return y;
    };

    // Add This Month
    let currentY = addReportToDoc(this.thisMonthReport, 35);

    // Add page for Last Month if needed or just space
    if (currentY + 40 > doc.internal.pageSize.getHeight()) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY += 10;
    }

    // Add Last Month
    addReportToDoc(this.lastMonthReport, currentY);

    // Save using file-saver
    const blob = doc.output('blob');
    saveAs(blob, `iBudget_Financial_Report.pdf`);
  }
}
