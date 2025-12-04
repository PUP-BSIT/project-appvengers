import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse, Transaction, TransactionResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private base = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TransactionResponse[]> {
    return this.http.get<ApiResponse>(this.base).pipe(
      map((res: ApiResponse) => (res.data || []) as TransactionResponse[])
    );
  }

  create(payload: Partial<Transaction>): Observable<TransactionResponse> {
    return this.http.post<ApiResponse>(this.base, payload).pipe(
      map((res: ApiResponse) => res.data as TransactionResponse)
    );
  }

  update(id: number, payload: Partial<Transaction>): Observable<TransactionResponse> {
    return this.http.put<ApiResponse>(`${this.base}/${id}`, payload).pipe(
      map((res: ApiResponse) => res.data as TransactionResponse)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse>(`${this.base}/${id}`).pipe(
      map(() => undefined)
    );
  }

  getExpenseSummary(): Observable<{ labels: string[]; values: number[] }> {
    return this.http
      .get<ApiResponse>(`${environment.apiUrl}/expenses/summary`)
      .pipe(
        map((res: ApiResponse) =>
          res.data as { labels: string[]; values: number[] }
        )
      );
  }

  getIncomeSummary(): Observable<{ labels: string[]; values: number[] }> {
    return this.http
      .get<ApiResponse>(`${this.base}/summary/income`)
      .pipe(
        map((res: ApiResponse) =>
          res.data as { labels: string[]; values: number[] }
        )
      );
  }
}
