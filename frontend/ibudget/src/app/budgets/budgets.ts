import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";
import { KpiPanel } from "./kpi-panel/kpi-panel";
import { BudgetList } from "./budget-list/budget-list";

@Component({
  selector: 'app-budgets',
  imports: [Sidebar, Header, KpiPanel, BudgetList],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets {
  
}
