import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse, Transaction } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private base = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Transaction[]> {
    return this.http.get<ApiResponse>(this.base).pipe(
      map((res: ApiResponse) => (res.data || []) as Transaction[])
    );
  }

  create(payload: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<ApiResponse>(this.base, payload).pipe(
      map((res: ApiResponse) => res.data as Transaction)
    );
  }

  update(id: number, payload: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<ApiResponse>(`${this.base}/${id}`, payload).pipe(
      map((res: ApiResponse) => res.data as Transaction)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse>(`${this.base}/${id}`).pipe(
      map(() => undefined)
    );
  }

  getExpenseSummary(): Observable<{ labels: string[]; values: number[] }> {
    return this.http.get<ApiResponse>(`${environment.apiUrl}/expenses/summary`).pipe(
      map((res: ApiResponse) => res.data as { labels: string[]; values: number[] })
    );
  }
}
