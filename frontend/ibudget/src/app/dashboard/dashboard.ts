import { Component } from '@angular/core';
import { Header } from '../header/header';
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    Header,
    ToggleableSidebar,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class Dashboard {
 
}