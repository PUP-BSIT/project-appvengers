import { Injectable } from '@angular/core';
import { SavingTransaction } from '../models/user.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private STATIC_HISTORY: SavingTransaction[] = [
    {
      transaction_id: 1,
      savings_id: 1,
      user_id: 1,
      transaction_date: '2025-11-20',
      savings_action: 'Deposit',
      date: new Date('2025-11-20'),
      description: 'Remaining Allowance',
      amount: 300,
    },
    {
      transaction_id: 2,
      savings_id: 1,
      user_id: 1,
      transaction_date: '2025-11-20',
      savings_action: 'Deposit',
      date: new Date('2025-11-20'),
      description: 'Remaining Allowance',
      amount: 100,
    },
    {
      transaction_id: 3,
      savings_id: 2,
      user_id: 1,
      transaction_date: '2025-11-21',
      savings_action: 'Deposit',
      date: new Date('2025-11-21'),
      description: 'Remaining Allowance',
      amount: 100,
    },
    {
      transaction_id: 4,
      savings_id: 2,
      user_id: 1,
      transaction_date: '2025-11-22',
      savings_action: 'Withdrawal',
      date: new Date('2025-11-22'),
      description: 'Remaining Allowance',
      amount: 100,
    },
    {
      transaction_id: 5,
      savings_id: 4,
      user_id: 1,
      transaction_date: '2025-11-25',
      savings_action: 'Deposit',
      date: new Date('2025-11-25'),
      description: 'Income from Work',
      amount: 200,
    },
  ];
  
  getStaticHistory(): Observable<SavingTransaction[]> {
    return of(this.STATIC_HISTORY);
  }

  getSavingTransactionsBySavingId(savingId: number, transactionId: number): Observable<SavingTransaction[]> {
    const filteredTransactions = this.STATIC_HISTORY.filter(transaction => 
      transaction.savings_id === savingId && transaction.transaction_id === transactionId
    );

    return of(filteredTransactions);
  }

  addSavingTransaction(newTransaction: SavingTransaction): Observable<SavingTransaction> {
    this.STATIC_HISTORY = [...this.STATIC_HISTORY, newTransaction];
    return of(newTransaction);
  }
}
