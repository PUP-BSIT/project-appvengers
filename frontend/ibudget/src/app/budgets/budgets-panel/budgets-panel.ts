import { Component, OnInit, signal } from '@angular/core';  
import { Expenses } from '../../model/user.model';
import { ExpensesService } from '../../../services/expenses';
import { Income } from '../../model/user.model';
import { IncomeService } from '../../../services/income';

@Component({
  selector: 'app-budgets-panel',
  imports: [],
  templateUrl: './budgets-panel.html',
  styleUrl: './budgets-panel.scss',
})
export class BudgetsPanel implements OnInit {
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
