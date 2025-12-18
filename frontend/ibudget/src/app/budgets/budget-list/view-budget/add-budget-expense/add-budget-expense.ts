import { Modal } from 'bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BudgetTransactionsService } from '../../../../../services/budget.transactions.service';
import { BudgetTransaction, Category } from '../../../../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { computed } from '@angular/core';
import { Validators } from '@angular/forms';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  output,
  signal,
  ViewChild,
  input
} from '@angular/core';

@Component({
  selector: 'app-add-budget-expense',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-budget-expense.html',
  styleUrl: './add-budget-expense.scss',
})

export class AddBudgetExpense implements OnInit {
  @ViewChild('addBudgetExpenseModal') addBudgetExpenseModal!: ElementRef;

  // Categories passed from parent
  categories = input<Category[]>([]);

  // Disable 'add expense' button if budget limit reached
  disabled = input<boolean>(false);

  // Derived signal: expense-only categories
  expenseCategories = computed(() => 
    this.categories().filter(c => c.type?.toLowerCase() === 'expense')
  );

  // Services
  formBuilder = inject(FormBuilder);
  budgetTxService = inject(BudgetTransactionsService);
  activatedRoute = inject(ActivatedRoute);

  // Output to parent
  addBudgetExpenseResponse = output<BudgetTransaction>();

  // Form and state
  addBudgetExpenseForm: FormGroup;
  currentBudgetId = signal('');
  date = signal(new Date().toISOString().split('T')[0]);

  // Snackbar
  showNotification = signal(false);
  isHidingNotification = signal(false);
  notificationMessage = signal('');

  constructor() {
    this.addBudgetExpenseForm = this.formBuilder.group({
      budget_id: [''],
      transaction_date: ['', Validators.required],
      description: [''],
      category_id: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      created_at: [''],
      updated_at: [''],
      deleted_at: ['']
    });
  }

  // Validator Helper Method for Budget Expense Fields
  isInvalid(control: string) {
    const c = this.addBudgetExpenseForm.get(control);
    return !!c && c.invalid && c.touched;
  }

  ngOnInit(): void {
    this.getCurrentBudgetId();
  }

  openModal() {
    if (this.disabled()) return;

    // Refill values everytime modal opens
    this.addBudgetExpenseForm.patchValue({
      budget_id: +this.currentBudgetId(),
      transaction_date: this.date(),
      created_at: this.date(),
      updated_at: this.date()
    });

    const modal = new Modal(this.addBudgetExpenseModal.nativeElement);
    modal.show();
  }

  closeModal() {
    const modal = Modal.getInstance(this.addBudgetExpenseModal.nativeElement);
    this.addBudgetExpenseForm.markAsUntouched();
    modal?.hide();
  }

  getCurrentBudgetId() {
    this.activatedRoute.paramMap.subscribe(params => {
      const budgetId = params.get('id') || '';
      this.currentBudgetId.set(budgetId);
      this.addBudgetExpenseForm.patchValue({ budget_id: +budgetId });
    });
  }

  addExpense() {
    // Displays error messages once 'add expense' button is pressed
    if(this.addBudgetExpenseForm.invalid) {
      this.addBudgetExpenseForm.markAllAsTouched();
      return;
    }

    if (this.addBudgetExpenseForm.valid) {
      const payload = this.addBudgetExpenseForm.value as Partial<BudgetTransaction>;

      // Set Description to N/A if no user input
      if(!payload.description || payload.description.trim() === '') {
        payload.description = 'N/A';
      }

      this.budgetTxService.create(payload).subscribe((response) => {
        this.addBudgetExpenseResponse.emit(response);

        // Resets the values to default
        this.addBudgetExpenseForm.reset({
          budget_id: +this.currentBudgetId(),
          transaction_date: this.date(),
          created_at: this.date(),
          updated_at: this.date()
        });

        this.showNotificationMessage("Expense added successfully!");
        this.closeModal();
      });
    }
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