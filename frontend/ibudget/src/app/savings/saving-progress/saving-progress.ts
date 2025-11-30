import { Component, input } from '@angular/core';

@Component({
  selector: 'app-saving-progress',
  imports: [],
  templateUrl: './saving-progress.html',
  styleUrl: './saving-progress.scss',
})
export class SavingProgress {
  progressPercentage = input(0);
  showType = input <'show-text' | 'hide-text'>('hide-text');
}
