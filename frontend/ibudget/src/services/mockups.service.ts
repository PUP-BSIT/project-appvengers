import { Injectable } from '@angular/core';
import { Budget } from '../models/user.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockupsService {
  MOCK_BUDGETS: Budget[] = [
    {
      id: 1,
      category_id: 1,
      category_name: 'Housing',
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

  getMockBudgets(): Observable<Budget[]> {
    return of([...this.MOCK_BUDGETS]);
  }

  getMockBudgetsById(id: number): Observable<Budget>  {
    const matchedBudget = this.MOCK_BUDGETS.find(budget => budget.id === id);

    if (!matchedBudget) {
      throw new Error(`Budget with id ${id} not found.`);
    }

    return of(matchedBudget);
  }

  addMockBudget(newBudget: Budget): Observable<Budget> {
    this.MOCK_BUDGETS = [...this.MOCK_BUDGETS, newBudget];
    return of(newBudget);
  }

  updateMockBudget(id: number, budget: Budget): Observable<Budget> {
    this.MOCK_BUDGETS = this.MOCK_BUDGETS
      .map(existingBudget => existingBudget.id === id ?
        {...existingBudget, ...budget} : existingBudget
    );

    const updatedBudget = this.MOCK_BUDGETS.find(budget => budget.id === id);

    if(!updatedBudget) {
      throw new Error(`Failed to update because budget not found.`);
    }

    return of(updatedBudget);
  }

  deleteMockBudget(id: number): Observable<Budget[]> {
    this.MOCK_BUDGETS = this.MOCK_BUDGETS.filter(budget => budget.id !== id);
    return of(this.MOCK_BUDGETS);
  }
}
