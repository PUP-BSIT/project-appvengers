import { Budget, Categories } from '../../../../models/user.model';
import { MockupsService } from '../../../../services/mockups.service';
import { CategoriesService } from '../../../../services/categories.service';
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
  mockupService = inject(MockupsService);
  mockBudgetId = input(<number>(0));
  categoriesService = inject(CategoriesService);
  categories = signal(<Categories[]>[]);
  currentCategoryName = signal('');
  currentCategoryId = signal<number>(0);

  constructor() {
    this.budgetForm = this.formBuilder.group({
      id: [],
      category_id: ['', { validators: [Validators.required] }],
      category_name: [''],
      limit_amount: [0, { validators: [Validators.required] }],
      current_amount: [0],
      start_date: ['', { validators: [Validators.required] }],
      end_date: ['', { validators: [Validators.required] }]
    });
  }

  ngOnInit() {
    const budgetId = this.mockBudgetId();
    this.categories.set(this.categoriesService.getExpenseCategories());

    this.budgetForm = this.formBuilder.group({
      id: [budgetId],
      category_id: ['', { validators: [Validators.required] }],
      category_name: [''],
      limit_amount: [0, { validators: [Validators.required] }],
      current_amount: [0],
      start_date: ['', { validators: [Validators.required] }],
      end_date: ['', { validators: [Validators.required] }]
    });
  }

  // If the parent changes, the added budget id should update accordingly
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mockBudgetId']) {
      const budgetId = changes['mockBudgetId'].currentValue;

      this.budgetForm = this.formBuilder.group({
        id: [budgetId],
        category_id: ['', { validators: [Validators.required] }],
        category_name: [''],
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

  closeModal() {
    const modal = Modal.getInstance(this.addBudgetModal.nativeElement);
    modal?.hide();

    this.budgetForm.reset();
    // Restore the id field after reset to prevent it being null
    this.budgetForm.patchValue({ id: this.mockBudgetId() });
    this.openAddBudgetModalBtn.nativeElement.focus();
  }

  addBudget() {
    if (this.budgetForm.invalid) return;

    this.mockupService.addMockBudget(this.budgetForm.value)
      .subscribe((newBudget: Budget) => {
        this.addedBudget.emit(newBudget);
        console.log('Added Budget:', newBudget);
        this.closeModal();
    });
  }

  // Derive category_name from selected category_id
  afterCategorySelection() {
    const selectedId = Number(this.budgetForm.get('category_id')?.value);
    const cat = this.categories().find(c => c.category_id === selectedId);

    this.budgetForm.get('category_name')?.setValue(cat?.name ?? '');
    this.currentCategoryId.set(selectedId);
    this.currentCategoryName.set(cat?.name ?? '');
  }
}
