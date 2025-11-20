import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { FormsModule } from '@angular/forms';
import { ReportRecord } from '../../models/user.model';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, Sidebar, Header, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  reports: ReportRecord[] = [];

  constructor() {}

  ngOnInit(): void {
    // TODO: Replace mock data with real API call to `/api/reports` when available.
    this.reports = this.getMockReports();
  }

  private getMockReports(): ReportRecord[] {
    return [
      {
        reports_id: 1,
        user_id: 101,
        period_start: '2025-10-01',
        period_end: '2025-10-31',
        report: 'October summary: Expenses were within budget.'
      },
      {
        reports_id: 2,
        user_id: 101,
        period_start: '2025-09-01',
        period_end: '2025-09-30',
        report: 'September summary: Overspent on entertainment.'
      }
    ];
  }
}
