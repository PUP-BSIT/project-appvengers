import { Component } from '@angular/core';
import { Header } from "../header/header";
import { BudgetList } from "./budget-list/budget-list";
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";

@Component({
  selector: 'app-budgets',
  imports: [Header, BudgetList, ToggleableSidebar],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets {

}
