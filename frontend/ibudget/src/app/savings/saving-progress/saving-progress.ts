import { Component, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-saving-progress',
  imports: [],
  templateUrl: './saving-progress.html',
  styleUrl: './saving-progress.scss',
})
export class SavingProgress implements OnInit {
  progressPercentage = input(0);
  showType = input <'show-text' | 'hide-text'>('hide-text');

  ngOnInit(): void {
    console.log('Progress Percentage:', this.progressPercentage());
  }
}
