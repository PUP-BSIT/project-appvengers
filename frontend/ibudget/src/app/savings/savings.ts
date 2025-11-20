import { Component, inject, OnInit, signal } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { Saving } from '../../models/user.model';
import { SavingsService } from '../../services/savings.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-savings',
  imports: [Sidebar, Header, RouterLink],
  templateUrl: './savings.html',
  styleUrl: './savings.scss',
})
export class Savings implements OnInit {
  savings = signal(<Saving[]>[]);
  savingsService = inject(SavingsService);

  ngOnInit() {
    this.getBudgets();
  }

  getBudgets() {
    this.savingsService.getSavings().subscribe((savingsData) => {
      this.savings.set(savingsData);
    });
  }
}
