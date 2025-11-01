import { Injectable } from '@angular/core';
import { Expenses } from '../app/model/user_model';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  private readonly STATIC_EXPENSES: Expenses[] = [
    { 
      name: 'Food', 
      currentAmount: 350, 
      allocatedAmount: 500, 
      percentageUsed: 60 
    },
    { 
      name: 'Transportation', 
      currentAmount: 90, 
      allocatedAmount: 200, 
      percentageUsed: 40 
    },
    { 
      name: 'Entertainment', 
      currentAmount: 120, 
      allocatedAmount: 150, 
      percentageUsed: 80 
    },
  ];

  getStaticExpenses(): Expenses[] {
    return [...this.STATIC_EXPENSES];
  }
}