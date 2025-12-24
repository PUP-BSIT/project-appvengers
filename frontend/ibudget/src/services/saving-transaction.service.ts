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
      savings_id: backendTransaction.savingId,
      user_id: backendTransaction.userId,
      transaction_date: backendTransaction.transactionDate,
      savings_action: backendTransaction.savingsAction,
      description: backendTransaction.description,
      amount: backendTransaction.amount,
      created_at: backendTransaction.createdAt,
      updated_at: backendTransaction.updatedAt,
      deleted_at: backendTransaction.deletedAt,
    };
  }

  private toBackend(transaction: Partial<SavingTransaction>): Partial<BackendSavingTransaction> {
    return {
      savingId: transaction.savings_id,
      userId: transaction.user_id,
      transactionDate: transaction.transaction_date,
      savingsAction: transaction.savings_action,
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

  // Get transactions for a specific saving by its ID
  getSavingTransactionById(savingId: number): Observable<SavingTransaction[]> {
    return this.http.get<BackendSavingTransaction[]>(`${this.apiUrl}/${savingId}/transactions`)
      .pipe(
        map(list => list.map(this.toFrontend))
    );
  }

  // Add a new saving transaction
  addSavingTransaction(savingId: number, transaction: Partial<SavingTransaction>): Observable<SavingTransaction> {
    const backendTransaction = this.toBackend(transaction);
    return this.http.post<BackendSavingTransaction>(`${this.apiUrl}/${savingId}/transactions`, backendTransaction)
      .pipe(
        map(this.toFrontend)
    );
  }

  // Get a specific saving transaction by its Transaction ID
  getSavingTransactionByTransactionId(savingId: number, transactionId: number): Observable<SavingTransaction> {
    return this.http.get<BackendSavingTransaction>(`${this.apiUrl}/${savingId}/transactions/${transactionId}`)
      .pipe(
        map(this.toFrontend)
    );
  }

  // Update an existing saving transaction
  updateSavingTransaction(savingId: number, transactionId: number, transaction: Partial<SavingTransaction>): Observable<SavingTransaction> {
    const backendTransaction = this.toBackend(transaction);
    return this.http.put<BackendSavingTransaction>(`${this.apiUrl}/${savingId}/transactions/${transactionId}`, backendTransaction)
      .pipe(
        map(this.toFrontend)
    );
  }

  // Soft Delete a saving transaction
  deleteSavingTransaction(savingId: number, transactionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${savingId}/transactions/${transactionId}`);
  }

  // Delete multiple saving transactions
  deleteMultipleSavingTransactions(savingId: number, transactionIds: number[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions`, {
      body: transactionIds
    });
  }
}
