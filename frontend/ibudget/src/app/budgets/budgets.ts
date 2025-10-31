import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { BudgetsPanel } from "./budgets-panel/budgets-panel";

@Component({
  selector: 'app-budgets',
  imports: [Sidebar, Header, BudgetsPanel],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets {

}
