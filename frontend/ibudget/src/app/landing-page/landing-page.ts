import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {

}
