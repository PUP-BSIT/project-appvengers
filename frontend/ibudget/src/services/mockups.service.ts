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
      period: 'November 2025'
    },
    {
      id: 2,
      category_id: 2,
      category_name: 'Transport',
      limit_amount: 2500,
      current_amount: 1500,
      period: 'November 2025'
    }
  ];

  getMockBudgets(): Budget[] {
    return [...this.MOCK_BUDGETS];
  }
}
