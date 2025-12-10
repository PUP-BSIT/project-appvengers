import { Modal } from 'bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BudgetTransactionsService } from '../../../../../services/budget.transactions.service';
import { BudgetTransaction, Category } from '../../../../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { computed } from '@angular/core';
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
  imports: [ReactiveFormsModule],
  templateUrl: './add-budget-expense.html',
  styleUrl: './add-budget-expense.scss',
})
export class AddBudgetExpense implements OnInit {
  @ViewChild('addBudgetExpenseModal') addBudgetExpenseModal!: ElementRef;
  @ViewChild('openAddBudgetExpenseModalBtn') openAddBudgetExpenseModalBtn!: ElementRef;

  // Categories passed from parent
  categories = input<Category[]>([]);

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

  constructor() {
    this.addBudgetExpenseForm = this.formBuilder.group({
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
    this.getCurrentBudgetId();
    
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
  }

  getCurrentBudgetId() {
    this.activatedRoute.paramMap.subscribe(params => {
      const budgetId = params.get('id') || '';
      this.currentBudgetId.set(budgetId);
      this.addBudgetExpenseForm.patchValue({ budget_id: +budgetId });
    });
  }

  addExpense() {
    if (this.addBudgetExpenseForm.valid) {
      const payload = this.addBudgetExpenseForm.value as Partial<BudgetTransaction>;

      this.budgetTxService.create(payload).subscribe((response) => {
        this.addBudgetExpenseResponse.emit(response);
        this.addBudgetExpenseForm.reset();
        this.closeModal();
      });
    }
  }
}