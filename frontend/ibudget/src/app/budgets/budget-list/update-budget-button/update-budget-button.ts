import { Modal } from 'bootstrap';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Budget } from '../../../../models/user.model';
import { Categories } from '../../../../models/user.model';
import { MockupsService } from '../../../../services/mockups.service';
import { bootstrapThreeDotsVertical } from '@ng-icons/bootstrap-icons'
import { CategoriesService } from '../../../../services/categories.service';
import { 
          Component, 
          ElementRef, 
          inject, 
          input, 
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
  selector: 'app-update-budget-button',
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './update-budget-button.html',
  styleUrl: './update-budget-button.scss',
  viewProviders: [
    provideIcons({bootstrapThreeDotsVertical})
  ]
})
export class UpdateBudgetButton implements OnInit {
  @ViewChild('updateBudgetModal') updateBudgetModal!: ElementRef;
  @ViewChild('openUpdateBudgetModalBtn') 
    openUpdateBudgetModalBtn!: ElementRef<HTMLButtonElement>;
  budgetForm: FormGroup;
  budgetId = input(<number>(0));
  updatedBudgetResponse = output<Budget>();
  deletedBudgetResponse = output<Budget[]>();
  formBuilder = inject(FormBuilder);  
  mockupService = inject(MockupsService);
  categoriesService = inject(CategoriesService);
  categories = signal(<Categories[]>[]);

  constructor() {
    this.budgetForm = this.formBuilder.group({
      category_id: [],
      category_name: [{value: '', disabled: true}, {
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

  ngOnInit(): void {
    this.getCategories();
  }

  openModal() {
    const modal = new Modal(this.updateBudgetModal.nativeElement);
    modal.show();
  }
  
  closeModal() {
    const modal = Modal.getInstance(this.updateBudgetModal.nativeElement);
    modal?.hide();

    this.budgetForm.reset();
    this.openUpdateBudgetModalBtn.nativeElement.focus();
  }

  openUpdateBudgetModal() {
    if(!this.budgetId()) return;

    this.openModal();
    this.mockupService.getMockBudgetsById(this.budgetId())
      .subscribe((fetchedBudget: Budget) => {
        this.budgetForm.setValue({
          category_id: fetchedBudget.category_id,
          category_name: fetchedBudget.category_id,
          limit_amount: fetchedBudget.limit_amount,
          current_amount: fetchedBudget.current_amount,
          start_date: fetchedBudget.start_date,
          end_date: fetchedBudget.end_date
        });
      });
  }

  updateBudget() {
    this.mockupService.updateMockBudget(this.budgetId(), this.budgetForm.value)
      .subscribe((updatedBudget: Budget) => {
        this.updatedBudgetResponse.emit(updatedBudget);
        this.budgetForm.reset();
        this.closeModal();
      });
  }

  deleteBudget() {
    this.mockupService.deleteMockBudget(this.budgetId())
      .subscribe((updatedBudgets: Budget[]) => {
        this.deletedBudgetResponse.emit(updatedBudgets);
        this.budgetForm.reset();
        this.closeModal();
      });
  }

  getCategories() {
    this.categories.set(this.categoriesService.getExpenseCategories());
  }
}
