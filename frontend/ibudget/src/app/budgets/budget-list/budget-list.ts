import { Component, inject, OnInit, signal } from '@angular/core';
import { 
    ReactiveFormsModule ,
    FormBuilder,
    FormGroup,
    Validators
  } from '@angular/forms';
import { Budget } from '../../../models/user.model';
import { MockupsService } from '../../../services/mockups.service';
import { AddBudgetButton } from "./add-budget-button/add-budget-button";
import { UpdateBudgetButton } from "./update-budget-button/update-budget-button";

@Component({
  selector: 'app-budget-list',
  imports: [ReactiveFormsModule, AddBudgetButton, UpdateBudgetButton],
  templateUrl: './budget-list.html',
  styleUrl: './budget-list.scss',
})
export class BudgetList implements OnInit {
  budgets = signal(<Budget[]>[]);
  selectedBudget?: Budget;
  mockupService = inject(MockupsService);

  ngOnInit(): void {
    this.budgets.set(this.mockupService.getMockBudgets());
  }

  // Inserts/Add New Budget
  addBudget() {

  }

  loadBudgetToUpdate(budget: Budget) {

  }

  // Updates a budget inside the budgets array
  updateBudget() {

  }

  // Deletes a budget inside the array
  deleteBudget() {

  }

  onBudgetAdded(newBudget: Budget) {
    this.budgets.set([...this.budgets(), newBudget]);
  }
}
