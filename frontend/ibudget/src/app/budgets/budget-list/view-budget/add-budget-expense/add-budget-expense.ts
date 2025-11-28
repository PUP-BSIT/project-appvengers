import { Modal } from 'bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MockupsService } from '../../../../../services/mockups.service';
import { BudgetTransaction } from '../../../../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { Component, 
        ElementRef, 
        inject, 
        OnInit, 
        output, 
        signal, 
        ViewChild 
      } from '@angular/core';

@Component({
  selector: 'app-add-budget-expense',
  imports: [ReactiveFormsModule],
  templateUrl: './add-budget-expense.html',
  styleUrl: './add-budget-expense.scss',
})
export class AddBudgetExpense implements OnInit {
  @ViewChild('addBudgetExpenseModal') addBudgetExpenseModal!: ElementRef;
  @ViewChild('openAddBudgetExpenseModalBtn') 
    openAddBudgetExpenseModalBtn!: ElementRef;
  addBudgetExpenseForm: FormGroup;
  formBuilder = inject(FormBuilder);
  mockupService = inject(MockupsService);
  activatedRoute = inject(ActivatedRoute);
  addBudgetExpenseResponse = output<BudgetTransaction>();
  currentTransactionId = signal('');
  currentBudgetId = signal('');
  date = signal(new Date().toISOString().split('T')[0]);

  constructor() {
    this.addBudgetExpenseForm = this.formBuilder.group({
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
    // Get Current Transaction ID
    this.getCurrentTransactionId();
    // Get Current Budget ID
    this.getCurrentBudgetId();

    // Set Default Dates
    this.addBudgetExpenseForm.patchValue({
      transaction_date: this.date(),
      created_at: this.date(),
      updated_at: this.date()
    });
  }

  openModal() {
    const modal = new Modal(this.addBudgetExpenseModal.nativeElement);
    modal.show();
  }

  closeModal() {
    const modal = Modal.getInstance(this.addBudgetExpenseModal.nativeElement);
    modal?.hide();

    this.openAddBudgetExpenseModalBtn.nativeElement.focus();
    this.getCurrentTransactionId();
    this.getCurrentBudgetId();
  }

  // Get Mock Current Transaction ID
  getCurrentTransactionId() {
    this.mockupService.getAllMockBudgetTransactions()
      .subscribe((transactions: BudgetTransaction[]) => {
        const maxId = Math.max(...transactions.map(t => t.transaction_id), 0);

        // Set the current transaction ID signal and form control
        this.currentTransactionId.set((maxId + 1).toString());
        this.addBudgetExpenseForm.patchValue({
          transaction_id: +this.currentTransactionId()
        });
      });
  }

  // Get Mock Current Budget ID through Route Param
  getCurrentBudgetId() {
    this.activatedRoute.paramMap.subscribe(params => {
      const budgetId = params.get('id') || '';

      this.currentBudgetId.set(budgetId);
      this.addBudgetExpenseForm.patchValue({
        budget_id: +this.currentBudgetId()
      });
    });
  }

  // Add Budget Expense Method
  addExpense() {
    if (this.addBudgetExpenseForm.valid) {
      const newExpense = this.addBudgetExpenseForm.value;
      this.getCurrentTransactionId();
      this.getCurrentBudgetId();
      
      // Call the mockup service to add the expense
      this.mockupService.addMockBudgetTransaction(newExpense)
        .subscribe((response: BudgetTransaction) => {
          console.log('New Budget Expense Added:', response);
          
          // Emit the response to the parent component
          this.addBudgetExpenseResponse.emit(response);
          
          // Reset the form and close the modal
          this.addBudgetExpenseForm.reset();
          this.closeModal();
        });
    }
  }
}
