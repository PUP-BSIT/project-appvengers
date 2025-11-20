import { Injectable } from '@angular/core';
import { SavingTransaction } from '../models/user.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STATIC_HISTORY: SavingTransaction[] = [
    {
      id: 1,
      user_id: 1,
      transaction_date: '2024-05-20',
      savings_action: 'Deposit',
      date: new Date('2025-05-15'),
      description: 'Remaining Allowance',
      amount: 300,
    },
    {
      id: 2,
      user_id: 1,
      transaction_date: '2024-05-20',
      savings_action: 'Deposit',
      date: new Date('2025-05-16'),
      description: 'Remaining Allowance',
      amount: 100,
    },
    {
      id: 3,
      user_id: 1,
      transaction_date: '2025-05-21',
      savings_action: 'Deposit',
      date: new Date('2024-05-16'),
      description: 'Remaining Allowance',
      amount: 100,
    },
    {
      id: 4,
      user_id: 1,
      transaction_date: '2024-05-22',
      savings_action: 'Withdrawal',
      date: new Date('2024-05-16'),
      description: 'Remaining Allowance',
      amount: 100,
    },
  ];
  
  getStaticHistory(): Observable<SavingTransaction[]> {
    return of(this.STATIC_HISTORY);
  }
}
