import { Component, input } from '@angular/core';

@Component({
  selector: 'app-budget-progress-bar',
  imports: [],
  templateUrl: './budget-progress-bar.html',
  styleUrl: './budget-progress-bar.scss',
})
export class BudgetProgressBar {
 progressPercentage = input(0);
}
