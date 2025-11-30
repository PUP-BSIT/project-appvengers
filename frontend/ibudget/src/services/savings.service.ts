import { Injectable } from '@angular/core';
import { Saving } from '../models/user.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SavingsService {
  MOCK_SAVINGS: Saving[] = [
    {
      savings_id: 1,
      user_id: 1,
      name: 'Personal Emergency Fund',
      goal_date: '2025-12-31',
      frequency: 'monthly',
      target_amount: 5000,
      current_amount: 1500,
      description: 'For unexpected expenses',
      created_at: '2025-11-30',
      updated_at: '2023-12-31',
    },
    {
      savings_id: 2,
      user_id: 1,
      name: 'Vacation Fund',
      goal_date: '2025-11-30',
      frequency: 'monthly',
      target_amount: 3000,
      current_amount: 800,
      description: 'For upcoming vacation',
      created_at: '2025-11-30',
      updated_at: '2025-11-30',
    }, 
    {
      savings_id: 3,
      user_id: 1,
      name: 'New Laptop',
      goal_date: '2025-10-31',
      frequency: 'monthly',
      target_amount: 2000,
      current_amount: 500,
      description: 'For new laptop purchase',
      created_at: '2025-11-30',
      updated_at: '2025-11-30',
    }, 
    {
      savings_id: 4,
      user_id: 1,
      name: 'New Phone',
      goal_date: '2025-09-30',
      frequency: 'monthly',
      target_amount: 1500,
      current_amount: 300,
      description: 'For new phone purchase',
      created_at: '2025-11-30',
      updated_at: '2025-11-30',
    }, {
      savings_id: 5,
      user_id: 1,
      name: 'Airpods',
      goal_date: '2025-08-31',
      frequency: 'monthly',
      target_amount: 1000,
      current_amount: 200,
      description: 'For Airpods purchase',
      created_at: '2025-12-01',
      updated_at: '2025-12-01',
    }
  ];

  // TODO: Inject HTTP Client for savings API calls

  getSavings(): Observable<Saving[]> {
    return of(this.MOCK_SAVINGS);
  }

  getSavingById(savingId: number): Observable<Saving> {
    const matchedSaving = this.MOCK_SAVINGS
      .find(s => s.savings_id === savingId);

    if (!matchedSaving) {
      throw new Error(`Saving with id ${savingId} not found.`);
    }

    return of(matchedSaving);
  }

  addSaving(newSaving: Saving): Observable<Saving> {
    this.MOCK_SAVINGS = [...this.MOCK_SAVINGS, newSaving];
    return of(newSaving);
  }

  updateSaving(savingId: number, saving: Saving): Observable<Saving> {
    this.MOCK_SAVINGS = this.MOCK_SAVINGS
      .map(existingSaving => existingSaving.savings_id === savingId ?
        {...existingSaving, ...saving} : existingSaving
    );

    const updatedSaving = this.MOCK_SAVINGS
      .find(s => s.savings_id === savingId);

    if(!updatedSaving) {
      throw new Error(`Failed to update because saving not found.`);
    }

    return of(updatedSaving);
  }

  deleteSaving(savingId: number): Observable<Saving[]> {
    this.MOCK_SAVINGS = this.MOCK_SAVINGS
      .filter(s => s.savings_id !== savingId);
    return of(this.MOCK_SAVINGS);
  }
}
