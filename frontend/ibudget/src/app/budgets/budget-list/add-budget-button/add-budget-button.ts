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

  constructor() {
    this.budgetForm = this.formBuilder.group({
      id: [],
      category_id: [],
      category_name: ['', {
        validators: [Validators.required]
      }],
      limit_amount: [0, {
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

  ngOnInit() {
    const budgetId = this.mockBudgetId();
    this.categories.set(this.categoriesService.getExpenseCategories());

    this.budgetForm = this.formBuilder.group({
      id: [budgetId],
      category_id: [],
      category_name: ['', {
        validators: [Validators.required]
      }],
      limit_amount: [0, {
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

  // If the parent changes, the added budget id should update accordingly
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mockBudgetId']) {
      const budgetId = changes['mockBudgetId'].currentValue;

      this.budgetForm = this.formBuilder.group({
        id: [budgetId],
        category_id: [],
        category_name: ['', {
          validators: [Validators.required]
        }],
        limit_amount: [0, {
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
  }

  openModal() {
    const modal = new Modal(this.addBudgetModal.nativeElement);
    modal.show();
  }

  closeModal() {
    const modal = Modal.getInstance(this.addBudgetModal.nativeElement);
    modal?.hide();

    this.budgetForm.reset();
    this.openAddBudgetModalBtn.nativeElement.focus();
  }

  addBudget() {
    if (this.budgetForm.invalid) return;

    this.mockupService.addMockBudget(this.budgetForm.value)
      .subscribe((newBudget: Budget) => {
        this.addedBudget.emit(newBudget);
        this.closeModal();
    });
  }

  // Sets the value of the category_id based on the category_name value
  afterCategorySelection() {
    const categoryValue = this.budgetForm.get('category_name')?.value;
    this.budgetForm.get('category_id')?.setValue(categoryValue);
  }
}
