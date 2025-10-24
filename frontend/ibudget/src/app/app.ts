import { Component, signal } from '@angular/core';
import { SetupAccount } from "./setup-account/setup-account";
import { ROUTER_CONFIGURATION, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ibudget');
}
