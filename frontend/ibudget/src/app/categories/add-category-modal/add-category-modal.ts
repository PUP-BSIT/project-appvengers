import { Component, ViewChild, ElementRef, inject, signal, output } from '@angular/core';
import { Category } from '../../../models/user.model';
import { CategoriesService } from '../../../services/categories.service';
import { ToastService } from '../../../services/toast.service';
import { Modal } from 'bootstrap';
import { 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators 
} from '@angular/forms';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-category-modal.html',
  styleUrl: './add-category-modal.scss',
})

export class AddCategoryModal {
  @ViewChild('addCategoryModal') addCategoryModal!: ElementRef;

  // Form
  formBuilder = inject(FormBuilder);
  categoryForm: FormGroup;

  // Emit to parent if category is added
  categoryAdded = output<Category>();

  // Services
  categoriesService = inject(CategoriesService);
  toastService = inject(ToastService);

  // Snackbar signals
  showNotification = signal(false);
  isHidingNotification = signal(false);
  notificationMessage = signal('');

  constructor() {
    this.categoryForm = this.formBuilder.group({
      name: ['', { validators: [Validators.required, Validators.minLength(4)] }],
      description: [''],
      type: ['expense', { validators: [Validators.required] }] // expense/income
    });
  }

  // Validator helper
  isInvalid(control: string) {
    const c = this.categoryForm.get(control);
    return !!c && c.invalid && c.touched;
  }

  openModal() {
    const modal = new Modal(this.addCategoryModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    modal.show();
  }

  /**
   * Opens the add category modal with pre-filled data from query params (chatbot deep links).
   * Supports: name, description, type (expense/income)
   */
  openModalWithParams(params: Record<string, string>) {
    // Validate type - must be 'expense' or 'income'
    let type: 'expense' | 'income' = 'expense';
    if (params['type']) {
      const paramType = params['type'].toLowerCase();
      if (paramType === 'income' || paramType === 'expense') {
        type = paramType;
      }
    }

    // Patch form values
    this.categoryForm.patchValue({
      name: params['name'] || '',
      description: params['description'] || '',
      type: type
    });

    // Open the modal
    const modal = new Modal(this.addCategoryModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
    modal.show();

    // Show toast notification
    if (params['name'] || params['description'] || params['type']) {
      this.toastService.info(
        'Bonzi Pre-fill',
        'Please review the form carefully before submitting.'
      );
    }
  }

  closeModal() {
    const modal = Modal.getInstance(this.addCategoryModal.nativeElement);
    modal?.hide();
    this.categoryForm.reset({ type: 'expense' });
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const newCategory = this.categoryForm.value;

    this.categoriesService.addCategory(newCategory).subscribe({
      next: (created: Category) => {
        this.categoryAdded.emit(created);
        this.showNotificationMessage(`Category added successfully!`);
        this.closeModal();
      },
      error: () => {
        this.showNotificationMessage('Error adding category. Please try again.');
      }
    });
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