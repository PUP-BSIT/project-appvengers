import { Budget, Categories } from '../../../../models/user.model';
import { MockupsService } from '../../../../services/mockups.service';
import { CategoriesService } from '../../../../services/categories.service';
import { Modal } from 'bootstrap';
import { 
    Component, 
    ElementRef, 
    inject, 
    OnInit, 
    output, 
    signal, 
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
export class AddBudgetButton implements OnInit {
  @ViewChild('addBudgetModal') addBudgetModal!: ElementRef;
  @ViewChild('openAddBudgetModalBtn') 
    openAddBudgetModalBtn!: ElementRef<HTMLButtonElement>;
  budgetForm: FormGroup;
  addedBudget = output<Budget>();
  formBuilder = inject(FormBuilder);  
  mockupService = inject(MockupsService);
  categoriesService = inject(CategoriesService);
  categories = signal(<Categories[]>[]);

  constructor() {
    this.budgetForm = this.formBuilder.group({
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
    this.categories.set(this.categoriesService.getExpenseCategories());
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
    console.log('Adding budget...');
    if (this.budgetForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.addedBudget.emit(this.budgetForm.value as Budget);
    this.closeModal();
  }
}
