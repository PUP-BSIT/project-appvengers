import { Injectable } from '@angular/core';
import { Expenses } from '../app/model/user.model';

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
    {
      name: 'Bills',
      currentAmount: 250,
      allocatedAmount: 400,
      percentageUsed: 62.5
    },
    {
      name: 'Shopping',
      currentAmount: 180,
      allocatedAmount: 300,
      percentageUsed: 60
    },
    {
      name: 'Health',
      currentAmount: 75,
      allocatedAmount: 150,
      percentageUsed: 50
    },
    {
      name: 'Education',
      currentAmount: 200,
      allocatedAmount: 250,
      percentageUsed: 80
    },
  ];

  getStaticExpenses(): Expenses[] {
    return [...this.STATIC_EXPENSES];
  }
}