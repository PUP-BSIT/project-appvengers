import { Component, OnInit, signal, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from '../../../models/user.model';
import { CategoriesService } from '../../../services/categories.service';
import { CommonModule } from '@angular/common';
import { AddCategoryModal } from '../add-category-modal/add-category-modal';
import { ToastService } from '../../../services/toast.service';
import { Modal, Dropdown } from 'bootstrap';

@Component({
  selector: 'app-categories-panel',
  standalone: true,
  imports: [CommonModule, AddCategoryModal],
  templateUrl: './categories-panel.html',
  styleUrl: './categories-panel.scss',
})

export class CategoriesPanel implements OnInit, OnDestroy {
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

  // Cleanup timers
  private timers: number[] = [];

  ngOnInit(): void {
    this.loadCategories();

    // Handle query params from chatbot deep links
    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'true' || params['name'] || params['type']) {
        // Delay slightly to ensure ViewChild is available
        const timer: number = setTimeout(() => {
          this.addCategoryModalComponent.openModalWithParams(params);
        }, 100) as unknown as number;
        this.timers.push(timer);
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup all timers to prevent memory leaks
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.allCategories.set(data);
        this.filterCategories();
        this.initDropdowns();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.toastService.error('Load Failed', 'Failed to load categories. Please try again.');
        this.isLoading.set(false);
      }
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
    triggers.forEach(el => new Dropdown(el));
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