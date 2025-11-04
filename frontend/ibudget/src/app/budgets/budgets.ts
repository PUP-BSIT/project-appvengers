import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";

@Component({
  selector: 'app-budgets',
  imports: [Sidebar, Header],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets {

}
