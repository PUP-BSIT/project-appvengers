import { Component, OnInit, signal } from '@angular/core';  
import { Expenses } from '../../model/user.model';
import { ExpensesService } from '../../../services/expenses';
import { Income } from '../../model/user.model';
import { IncomeService } from '../../../services/income';
import { KpiPanel } from "../kpi-panel/kpi-panel";

@Component({
  selector: 'app-budgets-panel',
  imports: [KpiPanel],
  templateUrl: './budgets-panel.html',
  styleUrl: './budgets-panel.scss',
})
export class BudgetsPanel implements OnInit {
  months = signal(['January', 'February', 'March'])
  staticExpenses = signal(<Expenses[]>[]);
  staticIncome = signal(<Income[]>[]);

  constructor(
    private expensesService: ExpensesService,
    private incomeService: IncomeService
  ) {}

  // Once the component is initialized, fetch the static expenses
  ngOnInit(): void {
    this.staticExpenses.set(this.expensesService.getStaticExpenses());
    console.log(this.staticExpenses);

    this.staticIncome.set(this.incomeService.getStaticIncome());
    console.log("Income: ", this.staticIncome());
  }
}
