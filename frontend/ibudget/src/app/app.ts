import { Component, signal } from '@angular/core';
import { SetupAccount } from "./setup-account/setup-account";

@Component({
  selector: 'app-root',
  imports: [SetupAccount],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ibudget');
}
