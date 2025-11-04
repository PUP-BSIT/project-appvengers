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
      percentage: (200/500) * 100,
      period: 'November 2025'
    },
    {
      id: 2,
      category_id: 2,
      category_name: 'Transport',
      limit_amount: 2500,
      current_amount: 1500,
      percentage: (1500/2500) * 100,
      period: 'November 2025'
    }
  ];

  getBudgets(): Budget[] {
    return this.MOCK_BUDGETS.map(budget => ({
      ...budget,
      percentage: (budget.current_amount / budget.limit_amount) * 100
    }));
  }
}
