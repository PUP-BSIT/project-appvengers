import { Component, signal } from '@angular/core';
import { LandingPage } from './landing-page/landing-page';
import { SignUp } from './sign-up/sign-up';

@Component({
  selector: 'app-root',
  imports: [SignUp],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ibudget');
}
