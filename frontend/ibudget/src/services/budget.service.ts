import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../environments/environment';
import { Budget } from '../models/user.model';
import { BackendBudget } from '../models/user.model'

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private baseUrl = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  private toFrontend(b: BackendBudget): Budget {
    return {
      id: b.budgetId,
      category_id: b.categoryId,
      category_name: b.categoryName, // filled by UI via CategoriesService if needed
      name: b.name,
      limit_amount: b.limitAmount,
      start_date: b.startDate,
      end_date: b.endDate,
      current_amount: 0,
    } as Budget;
  }

  private toBackend(b: Partial<Budget>): Partial<BackendBudget> {
    return {
      categoryId: Number(b.category_id),
      limitAmount: Number(b.limit_amount),
      startDate: String(b.start_date),
      endDate: String(b.end_date),
    };
  }

  getBudgets(): Observable<Budget[]> {
    return this.http.get<BackendBudget[]>(this.baseUrl).pipe(
      map(list => list.map(this.toFrontend))
    );
  }

  getBudgetById(id: number): Observable<Budget> {
    return this.http.get<BackendBudget>(`${this.baseUrl}/${id}`).pipe(
      map(this.toFrontend)
    );
  }

  addBudget(budget: Budget): Observable<Budget> {
    const payload = this.toBackend(budget);
    return this.http.post<BackendBudget>(this.baseUrl, payload).pipe(
      map(this.toFrontend)
    );
  }

  updateBudget(id: number, budget: Partial<Budget>): Observable<Budget> {
    const payload = this.toBackend(budget);
    return this.http.put<BackendBudget>(`${this.baseUrl}/${id}`, payload).pipe(
      map(this.toFrontend)
    );
  }

  deleteBudget(id: number): Observable<Budget[]> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      switchMap(() => this.getBudgets())
    );
  }
}
