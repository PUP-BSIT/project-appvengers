import { Component, inject, OnInit, signal } from '@angular/core';
import { 
    ReactiveFormsModule ,
    FormBuilder,
    FormGroup,
    Validators
  } from '@angular/forms';
import { Budget, ExpensesCategories } from '../../../models/user.model';
import { MockupsService } from '../../../services/mockups.service';

@Component({
  selector: 'app-budget-list',
  imports: [ReactiveFormsModule],
  templateUrl: './budget-list.html',
  styleUrl: './budget-list.scss',
})
export class BudgetList implements OnInit {
  budgetForm: FormGroup;
  formBuilder = inject(FormBuilder);  
  budgets = signal(<Budget[]>[]);
  selectedBudget?: Budget;
  categories: ExpensesCategories[] = [
    { id: 1, name: 'Housing' },
    { id: 2, name: 'Transportation' },
    { id: 3, name: 'Utilities' },
    { id: 4, name: 'Insurance' },
    { id: 5, name: 'Healthcare' },
    { id: 6, name: 'Food' },
    { id: 7, name: 'Other'}
  ];

  constructor(private mockupService: MockupsService) {
    this.budgetForm = this.formBuilder.group({
      category: ['', {
        validators: [Validators.required]
      }],
      limit_amount: ['0', {
        validators: [Validators.required]
      }],
      current_amount: [0],
      start_date: ['', {
        validators: [Validators.required]
      }],
      end_date: ['', {
        validators: [Validators.required]
      }]
    });
  }

  ngOnInit(): void {
    this.budgets.set(this.mockupService.getMockBudgets());
  }

  // Inserts/Add New Budget
  addBudget() {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const category = this.categories.find(c => c.id === +formValue.category);

      if (!category) return;

      const newBudget: Budget = {
        id: this.budgets().length > 0 ? 
          Math.max(...this.budgets().map(b => b.id)) + 1 : 1,
        category_id: category.id,
        category_name: category.name,
        limit_amount: +formValue.limit_amount,
        current_amount: 0, // New budgets start at 0
        start_date: formValue.start_date,
        end_date: formValue.end_date,
      };

      const updatedBudgets = this.mockupService.addMockBudget(newBudget);
      this.budgets.set(updatedBudgets);
      this.budgetForm.reset();
    }
  }

  loadBudgetToUpdate(budget: Budget) {
    this.selectedBudget = budget;
    this.budgetForm.patchValue({
      category: budget.category_id,
      limit_amount: budget.limit_amount,
      current_amount: budget.current_amount,
      start_date: budget.start_date,
      end_date: budget.end_date,
    });
  }

  // Updates a budget inside the budgets array
  updateBudget() {
    if (this.selectedBudget && this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const category = this.categories.find(c => c.id === +formValue.category);
      if (!category) return;
      const updatedBudget: Budget = {
        ...this.selectedBudget,
        category_id: category.id,
        category_name: category.name,
        limit_amount: +formValue.limit_amount,
        // current_amount: this.selectedBudget.current_amount, // retain current_amount unless editable
        start_date: formValue.start_date,
        end_date: formValue.end_date,
      };
      
      const updatedBudgets = this.mockupService.updateMockBudget(updatedBudget);
      this.budgets.set(updatedBudgets);

      // reset selection and form after successful update
      this.selectedBudget = undefined;
      this.budgetForm.reset({
        category: '',
        limit_amount: '0',
        current_amount: 0,
        start_date: '',
        end_date: ''
      });
    }
  }

  // Deletes a budget inside the array
  deleteBudget() {
    if (!this.selectedBudget) return;
    const updated = this.mockupService.deleteMockBudget(this.selectedBudget.id);
    this.budgets.set(updated);

    // reset selection and form
    this.selectedBudget = undefined;
    this.budgetForm.reset({
      category: '',
      limit_amount: '0',
      current_amount: 0,
      start_date: '',
      end_date: ''
    });
  }
}
