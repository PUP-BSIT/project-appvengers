import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-category-modal.html',
  styleUrl: './add-category-modal.scss',
})

export class AddCategoryModal {
  categoryName = '';

  saveCategory() {
    console.log('Saving category:', this.categoryName);
    this.categoryName = '';
  }
}