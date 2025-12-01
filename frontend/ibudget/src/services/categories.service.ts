import { Injectable } from '@angular/core';
import { Categories } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  // TODO: Endpoint for Categories
  // TODO: Inject HttpClient

  // Mock Expense Categories
  EXPENSE_CATEGORIES: Categories[] = [
    { category_id: 1, name: 'Housing', type: 'expense' },
    { category_id: 2, name: 'Transport', type: 'expense' },
    { category_id: 3, name: 'Utilities', type: 'expense' },
    { category_id: 4, name: 'Entertainment', type: 'expense' },
    { category_id: 5, name: 'Healthcare', type: 'expense' },
    { category_id: 6, name: 'Food', type: 'expense' },
    { category_id: 7, name: 'Other', type: 'expense' }
  ];

  getExpenseCategories(): Categories[] {
    return [...this.EXPENSE_CATEGORIES];
  }
}
