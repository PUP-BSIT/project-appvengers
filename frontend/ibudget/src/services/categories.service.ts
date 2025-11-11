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
    { id: 1, name: 'Housing', type: 'expense' },
    { id: 2, name: 'Transportation', type: 'expense' },
    { id: 3, name: 'Utilities', type: 'expense' },
    { id: 4, name: 'Insurance', type: 'expense' },
    { id: 5, name: 'Healthcare', type: 'expense' },
    { id: 6, name: 'Food', type: 'expense' },
    { id: 7, name: 'Other', type: 'expense' }
  ];

  getExpenseCategories(): Categories[] {
    return [...this.EXPENSE_CATEGORIES];
  }
}
