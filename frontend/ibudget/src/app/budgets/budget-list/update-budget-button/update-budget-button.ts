import { Modal } from 'bootstrap';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Budget } from '../../../../models/user.model';
import { Category } from '../../../../models/user.model';
import { BudgetService } from '../../../../services/budget.service';
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
  router = inject(Router);
  formBuilder = inject(FormBuilder);  
  budgetService = inject(BudgetService);
  categoriesService = inject(CategoriesService);
  budgetId = input(<number>(0));
  updatedBudgetResponse = output<Budget>();
  deletedBudgetResponse = output<Budget[]>();
  categories = signal(<Category[]>[]);

  // Snackbar signals
  showNotification = signal(false);
  isHidingNotification = signal(false);
  notificationMessage = signal('');

  constructor() {
    this.budgetForm = this.formBuilder.group({
      category_id: [],
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
    this.budgetService.getBudgetById(this.budgetId())
      .subscribe((fetchedBudget: Budget) => {
        this.budgetForm.patchValue({
          category_id: fetchedBudget.category_id,
          limit_amount: fetchedBudget.limit_amount,
          current_amount: fetchedBudget.current_amount,
          start_date: fetchedBudget.start_date,
          end_date: fetchedBudget.end_date
        });
      });
  }

  updateBudget() {
    this.budgetService.updateBudget(this.budgetId(), this.budgetForm.value)
      .subscribe((updatedBudget: Budget) => {
        this.updatedBudgetResponse.emit(updatedBudget);
        this.showNotificationMessage("Budget updated successfully!");
        this.budgetForm.reset();
        this.closeModal();
      });
  }

  deleteBudget() {
    this.budgetService.deleteBudget(this.budgetId())
      .subscribe((updatedBudgets: Budget[]) => {
        this.deletedBudgetResponse.emit(updatedBudgets);
        this.budgetForm.reset();
        this.showNotificationMessage("Budget deleted successfully!");
        this.closeModal();
      });
  }

  getCategories() {
    this.categoriesService.getCategories().subscribe(data => {
      this.categories.set(data);
    });
  }

  // View: open the modal in read-only mode or navigate to a details page
  onView() {
    if (!this.budgetId()) return;
    this.router.navigate(['/budgets/view-budget', this.budgetId()]);
  }

  // Edit: open the modal and enable inputs
  onEdit() {
    if (!this.budgetId()) return;
    this.openUpdateBudgetModal();
    this.budgetForm.enable();
  }

  // Delete: delete budget based on budgetId
  onDelete() {
    if (!this.budgetId()) return;
    this.deleteBudget();
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
