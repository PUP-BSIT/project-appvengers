import { Component, OnInit } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { ExpensesService } from '../../services/expenses';
import { IncomeService } from '../../services/income';
import { Expenses, Income } from '../../models/user.model';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports',
  imports: [Sidebar, Header, CurrencyPipe, DecimalPipe, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  expenses: Expenses[] = [];
  income: Income[] = [];
  totalIncome: number = 0;
  totalExpenses: number = 0;
  netSavings: number = 0;
  budgetAdherence: number = 0;
  selectedPeriod: string = 'monthly';
  constructor(
    private expensesService: ExpensesService,
    private incomeService: IncomeService
  ) {}

  ngOnInit(): void {
    this.expenses = this.expensesService.getStaticExpenses();
    this.income = this.incomeService.getStaticIncome();
    this.calculateSummaries();
  }

  calculateSummaries(): void {
    this.totalIncome = this.income.reduce((sum, inc) =>
      sum + inc.currentAmount, 0);
    this.totalExpenses = this.expenses.reduce((sum, exp) =>
      sum + exp.currentAmount, 0);
    this.netSavings = this.totalIncome - this.totalExpenses;
    const totalAllocated = this.expenses.reduce((sum, exp) =>
      sum + exp.allocatedAmount, 0);
    this.budgetAdherence = totalAllocated > 0 ? (
      (totalAllocated - this.totalExpenses) / totalAllocated) * 100 : 0;
  }

  isOverspent(expense: Expenses): boolean {
    return expense.currentAmount > expense.allocatedAmount;
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
    // For now, no actual filtering since data is static
  }

  exportPDF(): void {
    // Generate a PDF report with expenses and income tables
    const doc = new jsPDF();
    const title = 'iBudget - Financial Report';
    const now = new Date();
    doc.setFontSize(14);
    doc.text(title, 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${now.toLocaleString()}`, 14, 22);

    // Expenses table
    const expHead = [['Category', 'Current Amount', 'Allocated Amount', 'Percentage Used']];
    const expBody = this.expenses.map(e => [
      e.name,
      e.currentAmount.toFixed(2),
      e.allocatedAmount.toFixed(2),
      `${e.percentageUsed}%`
    ]);

    // Place expenses table
    autoTable(doc as any, {
      head: expHead,
      body: expBody,
      startY: 28,
      theme: 'striped',
      headStyles: { fillColor: [30, 30, 30] },
      styles: { fontSize: 9 }
    });

    // Income table placed after expenses
    const afterExpY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 28;
    const incHead = [['Source', 'Current Amount', 'Total Amount', 'Percentage Completed']];
    const incBody = this.income.map(i => [
      i.name,
      i.currentAmount.toFixed(2),
      i.amount.toFixed(2),
      `${i.percentageCompleted}%`
    ]);

    autoTable(doc as any, {
      head: incHead,
      body: incBody,
      startY: afterExpY,
      theme: 'striped',
      headStyles: { fillColor: [30, 30, 30] },
      styles: { fontSize: 9 }
    });

    // Add summary on last page top
    const summaryY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 10;
    // Format numbers with thousand separators and two decimals (e.g. 3,499.00)
    const formatNumber = (v: number) => new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

    doc.setFontSize(11);
  doc.text(`Total Income: ${formatNumber(this.totalIncome)}`, 14, summaryY);
  doc.text(`Total Expenses: ${formatNumber(this.totalExpenses)}`, 14, summaryY + 6);
  doc.text(`Net Savings: ${formatNumber(this.netSavings)}`, 14, summaryY + 12);

    const fileName = `ibudget_report_${now.toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
  }

  exportExcel(): void {
    // Export expenses and income to an Excel workbook (.xlsx)
    const now = new Date();
    // Prepare expenses sheet data
    const expData = this.expenses.map(e => ({
      Category: e.name,
      "Current Amount": e.currentAmount,
      "Allocated Amount": e.allocatedAmount,
      "Percentage Used": `${e.percentageUsed}%`
    }));

    const incData = this.income.map(i => ({
      Source: i.name,
      "Current Amount": i.currentAmount,
      "Total Amount": i.amount,
      "Percentage Completed": `${i.percentageCompleted}%`
    }));

    const wb = XLSX.utils.book_new();
    const expWs = XLSX.utils.json_to_sheet(expData);
    // Apply styles to Expenses sheet: header background, header font color, overspent rows
    const headerFill = {
      patternType: 'solid',
      fgColor: {
        rgb: '1E2022'
        }
      };
    const headerFont = {
      color: {
        rgb: 'FFFFFF'
        }, 
          bold: true
      };
    const overspentFill = {
      patternType: 'solid',
      fgColor: {
        rgb: 'FFE6E6'
        }
      };

    // Set column widths for readability
    expWs['!cols'] = [
      {
        wch: 30
      },
      {
        wch: 18
      },
      { 
        wch: 18
      }, 
      { wch: 14 }
    ];

    // Get range
    const expRange = XLSX.utils.decode_range(expWs['!ref'] as string);
    // Style header row (row 1)
    for (let C = expRange.s.c; C <= expRange.e.c; ++C) {
      const cellAddress = { c: C, r: 0 };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      if (!expWs[cellRef]) continue;
      (expWs[cellRef] as any).s = (expWs[cellRef] as any).s || {};
      (expWs[cellRef] as any).s.fill = headerFill;
      (expWs[cellRef] as any).s.font = headerFont;
    }

    // Style body rows, check overspent by comparing numeric values in expData
    for (let R = 0; R < expData.length; ++R) {
      const isOverspent = expData[R]["Current Amount"] >
        expData[R]["Allocated Amount"];
      for (let C = expRange.s.c; C <= expRange.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R + 1 });
        if (!expWs[cellRef]) continue;
        (expWs[cellRef] as any).s = (expWs[cellRef] as any).s || {};
        // Apply overspent fill
        if (isOverspent) {
          (expWs[cellRef] as any).s.fill = overspentFill;
        }
        // Align numbers to right for numeric columns
        if (C === 1 || C === 2) {
          (expWs[cellRef] as any).s.alignment = { horizontal: 'right' };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, expWs, 'Expenses');

    const incWs = XLSX.utils.json_to_sheet(incData);
    // Set column widths for Income sheet
    incWs['!cols'] = [
      {
        wch: 30
      },
      {
        wch: 18
      },
      {
        wch: 18
      },
      {
        wch: 14
      }
    ];
    const incRange = XLSX.utils.decode_range(incWs['!ref'] as string);
    // Style header row for Income
    for (let C = incRange.s.c; C <= incRange.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: 0 });
      if (!incWs[cellRef]) continue;
      (incWs[cellRef] as any).s = (incWs[cellRef] as any).s || {};
      (incWs[cellRef] as any).s.fill = headerFill;
      (incWs[cellRef] as any).s.font = headerFont;
    }

    // Right-align numeric columns in Income
    for (let R = 0; R < incData.length; ++R) {
      for (let C = incRange.s.c; C <= incRange.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R + 1 });
        if (!incWs[cellRef]) continue;
        (incWs[cellRef] as any).s = (incWs[cellRef] as any).s || {};
        if (C === 1 || C === 2) {
          (incWs[cellRef] as any).s.alignment = { horizontal: 'right' };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, incWs, 'Income');

    const fileName = `ibudget_report_${now.toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
}
