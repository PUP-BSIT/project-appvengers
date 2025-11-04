import { Injectable } from '@angular/core';
import { Budget } from '../app/model/user.model';

@Injectable({
  providedIn: 'root'
})
export class MockupsService {
  MOCK_BUDGETS: Budget[] = [
    {
      id: 1,
      category_id: 1,
      category_name: 'Food',
      limit_amount: 500,
      current_amount: 200,
      start_date: '2025-11-04',
      end_date: '2025-11-11'
    },
    {
      id: 2,
      category_id: 2,
      category_name: 'Transport',
      limit_amount: 2500,
      current_amount: 1500,
      start_date: '2025-11-04',
      end_date: '2025-11-11'
    }
  ];

  getMockBudgets(): Budget[] {
    return [...this.MOCK_BUDGETS];
  }

  addMockBudget(newBudget: Budget): Budget[] {
    this.MOCK_BUDGETS = [...this.MOCK_BUDGETS, newBudget];
    return [...this.MOCK_BUDGETS];
  }

  updateMockBudget(updated: Budget): Budget[] {
    const index = this.MOCK_BUDGETS.findIndex(b => b.id === updated.id);

    if (index === -1) return [...this.MOCK_BUDGETS];

    this.MOCK_BUDGETS[index] = { ...this.MOCK_BUDGETS[index], ...updated };
    return [...this.MOCK_BUDGETS];
  }

  deleteMockBudget(id: number) {
    this.MOCK_BUDGETS = this.MOCK_BUDGETS.filter(budget => budget.id !== id);
    return [...this.MOCK_BUDGETS];
  }
}
