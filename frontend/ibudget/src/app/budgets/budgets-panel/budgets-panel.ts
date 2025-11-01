import { Component, OnInit, signal } from '@angular/core';  
import { Expenses } from '../../model/user_model';
import { ExpensesService } from '../../../services/expenses';

@Component({
  selector: 'app-budgets-panel',
  imports: [],
  templateUrl: './budgets-panel.html',
  styleUrl: './budgets-panel.scss',
})
export class BudgetsPanel implements OnInit {
  staticExpenses = signal(<Expenses[]>[]);

  constructor(private expensesService: ExpensesService) {}

  // Once the component is initialized, fetch the static expenses
  ngOnInit(): void {
    this.staticExpenses.set(this.expensesService.getStaticExpenses());
    console.log(this.staticExpenses);
  }
}
