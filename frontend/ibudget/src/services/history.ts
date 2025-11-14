import { Injectable } from '@angular/core';
import { TransactionHistory } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STATIC_HISTORY: TransactionHistory[] = [
    {
      amount: 300,
      category: 'Entertainment',
      type: 'Expenses'
    },
    {
      amount: 5000,
      category: 'Salary',
      type: 'Income'
    },
    {
      amount: 6000,
      category: 'Investments',
      type: 'Income'
    },
    {
      amount: 500,
      category: 'Food',
      type: 'Expenses'
    },
    {
      amount: 1700,
      category: 'Utilities',
      type: 'Expenses'
    },
    {
      amount: 1000,
      category: 'Expenses',
      type: 'Others'
    }
  ];
  
  getStaticHistory(): TransactionHistory[] {
    return [...this.STATIC_HISTORY];
  }
}
