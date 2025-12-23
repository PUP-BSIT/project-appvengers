import {Component, OnInit, signal, inject} from '@angular/core';
import { Category } from '../../../models/user.model';
import { CategoriesService } from '../../../services/categories.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-panel.html',
  styleUrl: './categories-panel.scss',
})

export class CategoriesPanel implements OnInit {
  categoriesService = inject(CategoriesService);

  activeTab = signal<'expense' | 'income'>('expense');
  allCategories = signal<Category[]>([]);
  filteredCategories = signal<Category[]>([]);

  ngOnInit(): void {
    this.categoriesService.getCategories().subscribe(data => {
      this.allCategories.set(data);
      this.filterCategories();
    });
  }

  // Switch between 'expense' and 'income' tabs
  setTab(tab: 'expense' | 'income') {
    this.activeTab.set(tab);
    this.filterCategories();
  }

  // Filter categories based on its type
  filterCategories() {
    const type = this.activeTab();

    const filtered = this.allCategories().filter(c => 
      c.type?.toLowerCase() === type
    );

    this.filteredCategories.set(filtered);
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

  onEditCategory(category: Category) {
    console.log('Edit category:', category);
  }

  onDeleteCategory(category: Category) {
    console.log('Delete category:', category);
  }
}