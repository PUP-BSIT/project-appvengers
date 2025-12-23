import { inject, Injectable } from '@angular/core';
import { ApiResponse, BackendSaving, Saving } from '../models/user.model';
import { map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SavingsService {
  private apiUrl = `${environment.apiUrl}/savings`;
  private http = inject(HttpClient);

  /* 
    ** 
    Removed the IDs from the model since the backend handles
    associating savings with the authenticated user.
    **
  */

  // Convert backend saving to frontend saving
  private toFrontend(backendSaving: BackendSaving): Saving {
    return {
      saving_id: backendSaving.savingId,
      name: backendSaving.name,
      goal_date: backendSaving.goalDate,
      frequency: backendSaving.frequency,
      target_amount: backendSaving.targetAmount,
      current_amount: backendSaving.currentAmount,
      description: backendSaving.description,
      header_color: backendSaving.headerColor,
      created_at: backendSaving.createdAt,
      updated_at: backendSaving.updatedAt,
      deleted_at: backendSaving.deletedAt,
    }
  }

  private toBackend(saving: Partial<Saving>): Partial<BackendSaving> {
    return {
      name: saving.name!,
      goalDate: saving.goal_date!,
      frequency: saving.frequency!,
      targetAmount: typeof saving.target_amount === 'string' ? 
        Number(saving.target_amount) : saving.target_amount!,
      currentAmount: typeof saving.current_amount === 'string' ? 
        Number(saving.current_amount) : saving.current_amount!,
      description: saving.description!,
      headerColor: saving.header_color || 'bg-dark',
    };
  }

  // ** DONE: Endpoints for Savings CRUD operations ** //

  // Get all current user savings
  getSavings(): Observable<Saving[]> {
    return this.http.get<BackendSaving[]>(this.apiUrl).pipe(
      map(list => list.map(this.toFrontend))
    );
  }

  // Get a specific saving by its ID
  getSavingById(savingId: number): Observable<Saving> {
    return this.http.get<BackendSaving>(`${this.apiUrl}/${savingId}`).pipe(
      map(this.toFrontend)
    );
  }

  // Add new saving
  addSaving(newSaving: Saving): Observable<Saving> {
    const payload = this.toBackend(newSaving);
    console.log('Adding Saving with payload:', payload);
    
    // Request to add new saving with converted payload
    return this.http.post<BackendSaving>(this.apiUrl, payload).pipe(
      map(this.toFrontend)
    );
  }

  // Update an existing saving
  updateSaving(savingId: number, saving: Saving): Observable<Saving> {
    const payload = this.toBackend(saving);
    return this.http.put<BackendSaving>(`${this.apiUrl}/${savingId}`, payload)
      .pipe(
        map(this.toFrontend)
     );
  }

  // Soft Delete a saving by its ID
  deleteSaving(savingId: number): Observable<Saving[]> {
    return this.http.delete<void>(`${this.apiUrl}/${savingId}`).pipe(
      switchMap(() => this.getSavings())
    );
  }

  // Refresh current amount from backend
  refreshCurrentAmount(savingId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${savingId}/refresh-current-amount`);
  }
}
