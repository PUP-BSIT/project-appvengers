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
export class BudgetsPanel {

}
