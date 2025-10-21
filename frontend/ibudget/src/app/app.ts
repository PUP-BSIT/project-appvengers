import { Component, signal } from '@angular/core';
import { LandingPage } from "./landing-page/landing-page";

@Component({
  selector: 'app-root',
  imports: [LandingPage],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ibudget');
}
