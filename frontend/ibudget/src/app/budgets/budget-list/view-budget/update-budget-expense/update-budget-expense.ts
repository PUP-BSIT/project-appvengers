import { Component, ElementRef, inject, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { MockupsService } from '../../../../../services/mockups.service';
import { ActivatedRoute } from '@angular/router';
import { BudgetTransaction } from '../../../../../models/user.model';

@Component({
  selector: 'app-update-budget-expense',
  imports: [ReactiveFormsModule],
  templateUrl: './update-budget-expense.html',
  styleUrl: './update-budget-expense.scss',
})
export class UpdateBudgetExpense implements OnInit {
  @ViewChild('updateBudgetExpenseModal') updateBudgetExpenseModal!: ElementRef;
  @ViewChild('openUpdateBudgetExpenseModalBtn') 
    openUpdateBudgetExpenseModalBtn!: ElementRef;
  date = signal(new Date().toISOString().split('T')[0]);
  updateBudgetExpenseForm: FormGroup;
  formBuilder = inject(FormBuilder);
  mockupService = inject(MockupsService);
  activatedRoute = inject(ActivatedRoute);
  transactionId = input(<number>(0));
  currentBudgetId = signal(0);
  updateBudgetExpenseResponse = output<BudgetTransaction>();
  
  constructor() {
    this.updateBudgetExpenseForm = this.formBuilder.group({
      transaction_id: [''],
      budget_id: [''],
      category_id: [''],
      transaction_date: [''],
      description: [''],
      amount: [''],
      created_at: [''],
      updated_at: [''],
      deleted_at: ['']
    });
  }

  ngOnInit(): void {
    // Get Current Budget ID
    this.getCurrentBudgetId();

    // Set Default Dates
    this.updateBudgetExpenseForm.patchValue({
      updated_at: this.date()
    });

    // Only fetch if transactionId is truthy
    const id = this.transactionId();
    if (id && id > 0) {
      this.getTransactionData();
    }
  }

  openModal() {
    const modal = new Modal(this.updateBudgetExpenseModal.nativeElement);
    modal.show();
  }

  closeModal() {
    const modal = Modal.getInstance(this.updateBudgetExpenseModal.nativeElement);
    modal?.hide();

    this.openUpdateBudgetExpenseModalBtn.nativeElement.focus();

    // Patch Form with Transaction Data
    this.getTransactionData();
  }

  // Get Mock Transaction Data by ID
  getTransactionData() {
    const id = this.transactionId();
    if (!id || id <= 0) return;

    this.mockupService.getMockBudgetTransactionById(id)
      .subscribe((transaction: BudgetTransaction) => {
        this.updateBudgetExpenseForm.patchValue({
          transaction_id: transaction.transaction_id,
          budget_id: transaction.budget_id,
          category_id: transaction.category_id,
          transaction_date: transaction.transaction_date,
          description: transaction.description,
          amount: transaction.amount,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at,
          deleted_at: transaction.deleted_at
        });
      });
  }

  // Update Expense Method
  updateExpense() {
    if (this.updateBudgetExpenseForm.valid) {
      const updatedExpense = this.updateBudgetExpenseForm.value;

      // Call the mockup service to update the expense
      this.mockupService.updateMockBudgetTransaction(updatedExpense.transaction_id, updatedExpense)
        .subscribe((response: BudgetTransaction) => {
          // Emit updated expense to parent component
          this.updateBudgetExpenseResponse.emit(response);
          this.closeModal();
        });
    }
  }
  
  // Get Mock Current Budget ID through Route Param
  getCurrentBudgetId() {
    this.activatedRoute.paramMap.subscribe(params => {
      const budgetId = params.get('id') || 0;

      this.currentBudgetId.set(+budgetId);
      this.updateBudgetExpenseForm.patchValue({
        budget_id: +this.currentBudgetId()
      });
    });
  }
}
