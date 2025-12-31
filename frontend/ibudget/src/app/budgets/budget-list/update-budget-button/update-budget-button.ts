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
  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ElementRef; 

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
      name: ['', { validators: [Validators.required] }],
      limit_amount: [0, [Validators.required, Validators.min(1)]],
      current_amount: [0],
      start_date: ['', {
        validators: [Validators.required]
      }],
      end_date: ['', {
        validators: [Validators.required]
      }]
    });
  }

  // Validator helper
  isInvalid(control: string) {
    const c = this.budgetForm.get(control);
    return !!c && c.invalid && c.touched;
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
          name: fetchedBudget.name,
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

  openConfirmDeleteModal() {
    const modal = new Modal(this.confirmDeleteModal.nativeElement);
    modal.show();
  }

  confirmDelete() {
    this.deleteBudget();
    const modal = Modal.getInstance(this.confirmDeleteModal.nativeElement);
    modal?.hide();
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

  onDelete() {
    if (!this.budgetId()) return;
    this.openConfirmDeleteModal(); 
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