import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-budget-progress-bar',
  imports: [CommonModule],
  templateUrl: './budget-progress-bar.html',
  styleUrl: './budget-progress-bar.scss',
})

export class BudgetProgressBar {
  progressPercentage = input(0);

  getBarClass() {
    const percent = this.progressPercentage();
    if (percent < 50) return 'bg-success';   // green
    if (percent < 80) return 'bg-warning';   // yellow
    return 'bg-danger';  
  }
}
