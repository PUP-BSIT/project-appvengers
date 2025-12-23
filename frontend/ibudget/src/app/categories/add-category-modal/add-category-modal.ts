import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-category-modal.html',
  styleUrl: './add-category-modal.scss',
})

export class AddCategoryModal {
  @ViewChild('addCategoryModal') addCategoryModal!: ElementRef;
  categoryName = '';

  saveCategory() {
    console.log('Saving category:', this.categoryName);
    this.categoryName = '';
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
  }
}