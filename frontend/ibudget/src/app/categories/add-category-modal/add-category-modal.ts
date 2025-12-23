import { Component, ViewChild, ElementRef, inject, signal } from '@angular/core';
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

  formBuilder = inject(FormBuilder);
  categoryForm: FormGroup;

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
    console.log('Saving category:', newCategory);

    this.showNotificationMessage('Category added successfully!');
    this.closeModal();
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