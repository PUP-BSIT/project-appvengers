import { Component, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-saving-progress',
  imports: [],
  templateUrl: './saving-progress.html',
  styleUrl: './saving-progress.scss',
})
export class SavingProgress implements OnInit {
  progressPercentage = input(0);

  ngOnInit(): void {
    console.log('Progress Percentage:', this.progressPercentage());
  }
}
