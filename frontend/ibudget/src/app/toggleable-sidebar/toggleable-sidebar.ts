import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toggleable-sidebar',
  imports: [RouterLink, NgClass],
  templateUrl: './toggleable-sidebar.html',
  styleUrl: './toggleable-sidebar.scss',
})
export class ToggleableSidebar {
  isExpanded = false;

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }
}
