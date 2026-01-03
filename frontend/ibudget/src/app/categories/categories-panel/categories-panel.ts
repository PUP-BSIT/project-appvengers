import { Component, OnInit, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from '../../../models/user.model';
import { CategoriesService } from '../../../services/categories.service';
import { CommonModule } from '@angular/common';
import { AddCategoryModal } from '../add-category-modal/add-category-modal';
import { ToastService } from '../../../services/toast.service';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-categories-panel',
  standalone: true,
  imports: [CommonModule, AddCategoryModal],
  templateUrl: './categories-panel.html',
  styleUrl: './categories-panel.scss',
})

export class CategoriesPanel implements OnInit {
  @ViewChild(AddCategoryModal) addCategoryModalComponent!: AddCategoryModal;
  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ElementRef;

  categoriesService = inject(CategoriesService);
  route = inject(ActivatedRoute);

  activeTab = signal<'expense' | 'income'>('expense');
  allCategories = signal<Category[]>([]);
  filteredCategories = signal<Category[]>([]);

  toastService = inject(ToastService);

  // Loading State
  isLoading = signal(true);

  // Delete Confirmation
  categoryToDelete?: Category;

  ngOnInit(): void {
    this.loadCategories();

    // Handle query params from chatbot deep links
    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'true' || params['name'] || params['type']) {
        // Delay slightly to ensure ViewChild is available
        setTimeout(() => {
          this.addCategoryModalComponent.openModalWithParams(params);
        }, 100);
      }
    });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (data: Category[]) => {
        setTimeout(() => {
          this.allCategories.set(data);
          this.filterCategories();
          this.initDropdowns();
          this.isLoading.set(false);
        }, 1000); // simulate loading delay
      },
      error: (err) => console.error('Failed to load categories:', err)
    })
  }

  // Switch between 'expense' and 'income' tabs
  setTab(tab: 'expense' | 'income') {
    this.activeTab.set(tab);
    this.filterCategories();
    this.initDropdowns(); // re-init when tab changes
  }

  // Filter categories based on its type
  filterCategories() {
    const type = this.activeTab();
    const filtered = this.allCategories().filter(
      c => c.type?.toLowerCase() === type
    );
    this.filteredCategories.set(filtered);
  }

  // Initialize Bootstrap dropdowns
  private initDropdowns() {
    const triggers = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    triggers.forEach(el => new Modal(el));
  }

  // Get icon based on category name
  getIcon(category: Category): string {
    const iconMap: Record<string, string> = {
      Bills: 'fas fa-file-invoice',
      Bonus: 'fas fa-gift',
      Food: 'fas fa-utensils',
      Shopping: 'fas fa-shopping-bag',
      Salary: 'fas fa-briefcase',
      Transport: 'fas fa-bus',
      Income: 'fas fa-wallet',
      Investments: 'fas fa-chart-line',
      Housing: 'fas fa-home',
      Healthcare: 'fas fa-heartbeat',
      Entertainment: 'fas fa-film',
      Utilities: 'fas fa-lightbulb',
    };
    return iconMap[category.name] || 'fas fa-tag';
  }

  onCategoryAdded(newCategory: Category) {
    this.allCategories.set([...this.allCategories(), newCategory]);
    this.filterCategories();
    this.initDropdowns();

    // re-fetch after a short delay for consistency
    setTimeout(() => this.loadCategories(), 1000);
  }

  onEditCategory(category: Category) {
    if (category.referencesCount > 0) {
      this.toastService.error(
        'Edit Failed', 'Category is used and cannot be edited.'
      );

      return;
    }
    this.addCategoryModalComponent.openModal(category);
  }

  onCategoryUpdated(updated: Category) {
    const updatedList = this.allCategories().map(c =>
      c.id === updated.id ? updated : c
    );

    this.allCategories.set(updatedList);
    this.filterCategories();
    this.initDropdowns();
    setTimeout(() => this.loadCategories(), 1000); // optional refresh
  }

  openConfirmDeleteModal(category: Category) {
    if (category.referencesCount > 0) {
      this.toastService.error(
        'Delete Failed', 'Category is used and cannot be deleted.'
      );
      return;
    }

    this.categoryToDelete = category;
    const modal = new Modal(this.confirmDeleteModal.nativeElement);
    modal.show();
  }

  confirmDeleteCategory() {
    if (!this.categoryToDelete) return;

    this.categoriesService.deleteCategory(this.categoryToDelete.id).subscribe({
      next: () => {
        this.toastService.success(
          'Delete Success', 'Category deleted successfully!'
        );

        const updatedList = this.allCategories().filter(
          c => c.id !== this.categoryToDelete?.id
        );

        this.allCategories.set(updatedList);
        this.filterCategories();
        this.initDropdowns();
        setTimeout(() => this.loadCategories(), 1000);

        const modal = Modal.getInstance(this.confirmDeleteModal.nativeElement);
        modal?.hide();
        this.categoryToDelete = undefined;
      },
      error: () => {
        this.toastService.error('Delete Failed', 'Error deleting category.');
      }
    });
  }

  openAddCategoryModal() {
    this.addCategoryModalComponent.openModal();
  }
}