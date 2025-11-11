import { Modal } from 'bootstrap';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Budget } from '../../../../models/user.model';
import { Categories } from '../../../categories/categories';
import { MockupsService } from '../../../../services/mockups.service';
import { bootstrapThreeDotsVertical } from '@ng-icons/bootstrap-icons'
import { CategoriesService } from '../../../../services/categories.service';
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
  selector: 'app-update-budget-button',
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './update-budget-button.html',
  styleUrl: './update-budget-button.scss',
  viewProviders: [
    provideIcons({bootstrapThreeDotsVertical})
  ]
})
export class UpdateBudgetButton {
  @ViewChild('updateBudgetModal') updateBudgetModal!: ElementRef;
  @ViewChild('openUpdateBudgetModalBtn') 
    openUpdateBudgetModalBtn!: ElementRef<HTMLButtonElement>;
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
    console.log('Open Update Budget Modal');
    this.openModal();
  }

  updateBudget() {
    console.log('Updating budget...');
  }

  deleteBudget() {
    console.log('Deleting budget...');
  }
}
