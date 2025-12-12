import { Component, ElementRef, inject, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { ActivatedRoute } from '@angular/router';
import { BudgetTransactionsService } from '../../../../../services/budget.transactions.service';
import { BudgetTransaction } from '../../../../../models/user.model';
import { computed } from '@angular/core';
import { Category } from '../../../../../models/user.model';

@Component({
  selector: 'app-update-budget-expense',
  imports: [ReactiveFormsModule],
  templateUrl: './update-budget-expense.html',
  styleUrl: './update-budget-expense.scss',
})

export class UpdateBudgetExpense implements OnInit {

  @ViewChild('updateBudgetExpenseModal') updateBudgetExpenseModal!: ElementRef;
  @ViewChild('openUpdateBudgetExpenseModalBtn') openUpdateBudgetExpenseModalBtn!: ElementRef;

  // Categories passed from parent
  categories = input<Category[]>([]);

  // Derived signal: expense-only categories
  expenseCategories = computed(() => 
    this.categories().filter(c => c.type?.toLowerCase() === 'expense')
  );

  // Input from parent
  transactionId = input<number>(0);

  // Output to parent
  updateBudgetExpenseResponse = output<BudgetTransaction>();

  // Services
  formBuilder = inject(FormBuilder);
  budgetTxService = inject(BudgetTransactionsService);
  activatedRoute = inject(ActivatedRoute);

  // Form + state
  updateBudgetExpenseForm: FormGroup;
  currentBudgetId = signal<number>(0);
  date = signal(new Date().toISOString().split('T')[0]);

  // Snackbar
  showNotification = signal(false);
  isHidingNotification = signal(false);
  notificationMessage = signal('');

  constructor() {
    this.updateBudgetExpenseForm = this.formBuilder.group({
      transactionId: [''],
      budgetId: [''],
      transaction_date: [''], 
      description: [''],
      category_id: [''],
      amount: [''],
      type: ['expense']
    });
  }

  ngOnInit(): void {
    this.getCurrentBudgetId();

    // Set updated_at equivalent
    this.updateBudgetExpenseForm.patchValue({
      transactionDate: this.date()
    });

    // Load existing transaction data
    const id = this.transactionId();
    if (id && id > 0) {
      this.loadTransaction();
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
  }

  // Load transaction from backend
  loadTransaction() {
    const id = this.transactionId();
    if (!id) return;

    this.budgetTxService.getById(id).subscribe((tx: BudgetTransaction) => {
      this.updateBudgetExpenseForm.patchValue({
        transactionId: tx.transactionId,
        budgetId: tx.budgetId,
        transaction_date: tx.transactionDate,
        description: tx.description,
        category_id: tx.categoryId,
        amount: tx.amount,
        type: tx.type
      });
    });
  }

  // Update expense via backend
  updateExpense() {
    if (this.updateBudgetExpenseForm.valid) {
      const payload = this.updateBudgetExpenseForm.value as Partial<BudgetTransaction>;
      const id = this.transactionId();

      this.budgetTxService.update(id, payload).subscribe((response) => {
        this.updateBudgetExpenseResponse.emit(response);
        this.showNotificationMessage("Expense updated successfully!");
        this.closeModal();
      });
    }
  }

  // Get budget ID from route
  getCurrentBudgetId() {
    this.activatedRoute.paramMap.subscribe(params => {
      const budgetId = Number(params.get('id')) || 0;
      this.currentBudgetId.set(budgetId);

      this.updateBudgetExpenseForm.patchValue({
        budgetId: budgetId
      });
    });
  }

  showNotificationMessage(message: string) {
    this.notificationMessage.set(message);
    this.showNotification.set(true);
    this.isHidingNotification.set(false);
    setTimeout(() => {
      this.isHidingNotification.set(true);
      setTimeout(() => {
        this.showNotification.set(false);
        this.isHidingNotification.set(false);
      }, 300);
    }, 3000);
  }
}