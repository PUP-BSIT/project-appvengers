import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from '../../../models/user.model';
import { CategoriesService } from '../../../services/categories.service';
import { CommonModule } from '@angular/common';
import { AddCategoryModal } from '../add-category-modal/add-category-modal';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-categories-panel',
  standalone: true,
  imports: [CommonModule, AddCategoryModal],
  templateUrl: './categories-panel.html',
  styleUrl: './categories-panel.scss',
})

export class CategoriesPanel implements OnInit {
  @ViewChild(AddCategoryModal) addCategoryModalComponent!: AddCategoryModal;

  categoriesService = inject(CategoriesService);
  route = inject(ActivatedRoute);

  activeTab = signal<'expense' | 'income'>('expense');
  allCategories = signal<Category[]>([]);
  filteredCategories = signal<Category[]>([]);

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
        this.allCategories.set(data);
        this.filterCategories();
        this.initDropdowns();
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
    triggers.forEach(el => new bootstrap.Dropdown(el));
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
      console.error('Category is used and cannot be edited.');
      return;
    }
    this.addCategoryModalComponent.openModal(category);
  }

  onDeleteCategory(category: Category) {
    if (category.referencesCount > 0) {
      console.error('Category is used and cannot be deleted.');
      return;
    }

    this.categoriesService.deleteCategory(category.id).subscribe({
      next: () => {
        const updatedList = this.allCategories().filter(c => 
          c.id !== category.id
        );
        
        this.allCategories.set(updatedList);
        this.filterCategories();
        this.initDropdowns();
        setTimeout(() => this.loadCategories(), 1000);
      },
      error: (err) => {
        console.error('Error deleting category:', err);
      }
    });
  }

  openAddCategoryModal() {
    this.addCategoryModalComponent.openModal();
  }
}