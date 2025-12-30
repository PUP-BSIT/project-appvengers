import { Budget, Category } from '../../../../models/user.model';
import { BudgetService } from '../../../../services/budget.service';
import { CategoriesService } from '../../../../services/categories.service';
import { ToastService } from '../../../../services/toast.service';
import { Modal } from 'bootstrap';
import { 
  Component, 
  ElementRef, 
  inject, 
  input, 
  OnChanges, 
  OnInit, 
  output, 
  signal, 
  SimpleChanges, 
  ViewChild 
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
  
import { 
  ReactiveFormsModule ,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-add-budget-button',
  imports: [ReactiveFormsModule],
  templateUrl: './add-budget-button.html',
  styleUrl: './add-budget-button.scss',
})

export class AddBudgetButton implements OnInit, OnChanges {
  @ViewChild('addBudgetModal') addBudgetModal!: ElementRef;
  @ViewChild('openAddBudgetModalBtn') 

  openAddBudgetModalBtn!: ElementRef<HTMLButtonElement>;
  budgetForm: FormGroup;
  addedBudget = output<Budget>();
  formBuilder = inject(FormBuilder);  
  budgetService = inject(BudgetService);
  budgetId = input(<number>(0));
  categoriesService = inject(CategoriesService);
  toastService = inject(ToastService);
  route = inject(ActivatedRoute);
  categories = signal<Category[]>([]);
  currentCategoryName = signal('');
  currentCategoryId = signal<number>(0);

  // Snackbar signals
  showNotification = signal(false);
  isHidingNotification = signal(false);
  notificationMessage = signal('');

  constructor() {
    this.budgetForm = this.formBuilder.group({
      id: [],
      category_id: ['', { validators: [Validators.required] }],
      name: ['', { validators: [Validators.required] }],
      limit_amount: [0, [Validators.required, Validators.min(1)]],
      current_amount: [0],
      start_date: ['', { validators: [Validators.required] }],
      end_date: ['', { validators: [Validators.required] }]
    });
  }

  // Validator Helper
  isInvalid(control: string) {
    const c = this.budgetForm.get(control);
    return !!c && c.invalid && c.touched;
  }

  ngOnInit() {
    const budgetId = this.budgetId();
    this.categoriesService.getCategories().subscribe(data => {
      this.categories.set(data);
      
      // Handle query params from chatbot deep links after categories are loaded
      this.route.queryParams.subscribe(params => {
        if (params['openModal'] === 'true' || params['limitAmount'] || params['categoryId'] || params['category']) {
          this.openModalWithParams(params);
        }
      });
    });

    this.budgetForm = this.formBuilder.group({
      id: [budgetId],
      category_id: ['', { validators: [Validators.required] }],
      // category_name: [''],
      limit_amount: [0, { validators: [Validators.required] }],
      current_amount: [0],
      start_date: ['', { validators: [Validators.required] }],
      end_date: ['', { validators: [Validators.required] }]
    });
  }

  // If the parent changes, the added budget id should update accordingly
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['budgetId']) {
      const budgetId = changes['budgetId'].currentValue;

      this.budgetForm = this.formBuilder.group({
        id: [budgetId],
        category_id: ['', { validators: [Validators.required] }],
        limit_amount: [0, { validators: [Validators.required] }],
        current_amount: [0],
        start_date: ['', { validators: [Validators.required] }],
        end_date: ['', { validators: [Validators.required] }]
      });
    }
  }

  openModal() {
    const modal = new Modal(this.addBudgetModal.nativeElement);
    modal.show();
  }

  /**
   * Opens the add budget modal with pre-filled data from query params (chatbot deep links).
   * Supports: categoryId, category (name), limitAmount, startDate, endDate
   */
  openModalWithParams(params: Record<string, string>) {
    // Parse limit amount
    const limitAmount = params['limitAmount'] ? parseFloat(params['limitAmount']) : 0;

    // Find category by ID or name
    let categoryId: number | string = '';
    if (params['categoryId']) {
      categoryId = parseInt(params['categoryId'], 10);
    } else if (params['category']) {
      const categoryName = params['category'].toLowerCase();
      const matchedCategory = this.categories().find(
        c => c.name.toLowerCase() === categoryName && c.type === 'expense'
      );
      if (matchedCategory) {
        categoryId = matchedCategory.id;
      }
    }

    // Parse dates - default to today for start, 30 days from now for end
    const today = new Date();
    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    
    const startDate = params['startDate'] || today.toISOString().split('T')[0];
    const endDate = params['endDate'] || defaultEndDate.toISOString().split('T')[0];

    // Patch form values
    this.budgetForm.patchValue({
      category_id: categoryId,
      limit_amount: isNaN(limitAmount) ? 0 : limitAmount,
      start_date: startDate,
      end_date: endDate
    });

    // Update category signals if category was found
    if (categoryId) {
      const cat = this.categories().find(c => c.id === categoryId);
      if (cat) {
        this.currentCategoryId.set(cat.id);
        this.currentCategoryName.set(cat.name);
      }
    }

    // Open the modal
    const modal = new Modal(this.addBudgetModal.nativeElement);
    modal.show();

    // Show toast notification
    if (params['limitAmount'] || params['categoryId'] || params['category']) {
      this.toastService.info(
        'Bonzi Pre-fill',
        'Please review the form carefully before submitting.'
      );
    }
  }

  closeModal() {
    const modal = Modal.getInstance(this.addBudgetModal.nativeElement);
    modal?.hide();

    this.budgetForm.reset();
    // Restore the id field after reset to prevent it being null
    this.budgetForm.patchValue({ id: this.budgetId() });
    this.openAddBudgetModalBtn.nativeElement.focus();
  }

  addBudget() {
    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.budgetService.addBudget(this.budgetForm.value)
      .subscribe((newBudget: Budget) => {
        this.addedBudget.emit(newBudget);
        this.showNotificationMessage("Budget added successfully!");
        this.closeModal();
    });
  }

  // Derive category_name from selected category_id
  afterCategorySelection() {
    const selectedId = Number(this.budgetForm.get('category_id')?.value);
    const cat = this.categories().find(c => c.id === selectedId);

    this.budgetForm.get('category_name')?.setValue(cat?.name ?? '');
    this.currentCategoryId.set(selectedId);
    this.currentCategoryName.set(cat?.name ?? '');
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
