import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/user.model';
import { BudgetTransaction } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class BudgetTransactionsService {
  private base = `${environment.apiUrl}/budget-transactions`;

  constructor(private http: HttpClient) {}

  // GET /budget-transactions/budget/{budgetId}
  getByBudgetId(budgetId: number): Observable<BudgetTransaction[]> {
    return this.http.get<ApiResponse>(`${this.base}/budget/${budgetId}`).pipe(
      map((res: ApiResponse) => (res.data || []) as BudgetTransaction[])
    );
  }

  // GET /budget-transactions/{id}
  getById(id: number): Observable<BudgetTransaction> {
    return this.http.get<ApiResponse>(`${this.base}/${id}`).pipe(
      map((res: ApiResponse) => res.data as BudgetTransaction)
    );
  }

  // POST /budget-transactions
  create(payload: Partial<BudgetTransaction>): Observable<BudgetTransaction> {
    return this.http.post<ApiResponse>(this.base, payload).pipe(
      map((res: ApiResponse) => res.data as BudgetTransaction)
    );
  }

  // PUT /budget-transactions/{id}
  update(
    id: number, 
    payload: Partial<BudgetTransaction>
  ): Observable<BudgetTransaction> {
    return this.http.put<ApiResponse>(`${this.base}/${id}`, payload).pipe(
      map((res: ApiResponse) => res.data as BudgetTransaction)
    );
  }

  // DELETE /budget-transactions/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse>(`${this.base}/${id}`).pipe(
        map(() => undefined)
    );
  }
}