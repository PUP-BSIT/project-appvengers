import { Component, inject, OnInit, signal } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { Saving } from '../../models/user.model';
import { SavingsService } from '../../services/savings.service';
import { RouterLink } from '@angular/router';
import { SavingProgress } from "./saving-progress/saving-progress";

@Component({
  selector: 'app-savings',
  imports: [Sidebar, Header, RouterLink, SavingProgress],
  templateUrl: './savings.html',
  styleUrl: './savings.scss',
})
export class Savings implements OnInit {
  savings = signal(<Saving[]>[]);
  savingsService = inject(SavingsService);

  ngOnInit() {
    // Fetch Savings Data
    this.getSavings();
  }

  // Calculate progress percentage for a specific saving
  getProgressPercentage(saving: Saving) {
    const target = Number(saving.target_amount);
    const current = Number(saving.current_amount);
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  getSavings() {
    this.savingsService.getSavings().subscribe((savingsData) => {
      this.savings.set(savingsData);
    });
  }
}
