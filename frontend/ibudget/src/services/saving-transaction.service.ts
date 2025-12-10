import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BackendSavingTransaction, SavingTransaction } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class SavingTransactionService {
  private apiUrl = `${environment.apiUrl}/savings`;
  http = inject(HttpClient);

  private toFrontend(backendTransaction: BackendSavingTransaction): SavingTransaction {
    return {
      id: backendTransaction.id,
      savings_id: backendTransaction.savingId, // backend uses savingId (no 's')
      user_id: backendTransaction.userId,
      transaction_date: backendTransaction.transactionDate,
      savings_action: backendTransaction.savingAction,
      description: backendTransaction.description,
      amount: backendTransaction.amount,
      created_at: backendTransaction.createdAt,
      updated_at: backendTransaction.updatedAt,
      deleted_at: backendTransaction.deletedAt,
    };
  }

  private toBackend(transaction: Partial<SavingTransaction>): Partial<BackendSavingTransaction> {
    return {
      savingId: transaction.savings_id, // send savingId to backend
      userId: transaction.user_id,
      transactionDate: transaction.transaction_date,
      savingAction: transaction.savings_action,
      description: transaction.description,
      amount: transaction.amount,
    };
  }

  getSavingTransactions(): Observable<SavingTransaction[]> {
    return this.http.get<BackendSavingTransaction[]>(`${this.apiUrl}/transactions`)
      .pipe(
        map(list => list.map(this.toFrontend))
    );
  }

  getSavingTransactionById(savingId: number): Observable<SavingTransaction[]> {
    return this.http.get<BackendSavingTransaction[]>(`${this.apiUrl}/${savingId}/transactions`)
      .pipe(
        map(list => list.map(this.toFrontend))
    );
  }
}
