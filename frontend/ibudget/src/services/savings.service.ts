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
      target_amount: 5000,
      current_amount: 1500,
      created_at: '2023-01-01',
      updated_at: '2023-12-31',
    },
    {
      savings_id: 2,
      user_id: 1,
      name: 'Vacation Fund',
      target_amount: 3000,
      current_amount: 800,
      created_at: '2023-02-01',
      updated_at: '2023-11-30',
    }, 
    {
      savings_id: 3,
      user_id: 1,
      name: 'Utilities',
      target_amount: 2000,
      current_amount: 500,
      created_at: '2023-03-01',
      updated_at: '2023-10-31',
    }, 
    {
      savings_id: 4,
      user_id: 1,
      name: 'Electricity Bill',
      target_amount: 1500,
      current_amount: 300,
      created_at: '2023-04-01',
      updated_at: '2023-09-30',
    }, {
      savings_id: 5,
      user_id: 1,
      name: 'Other Bills',
      target_amount: 1000,
      current_amount: 200,
      created_at: '2023-05-01',
      updated_at: '2023-08-31',
    }
  ];

  // TODO: Inject HTTP Client for savings API calls

  getSavings(): Observable<Saving[]> {
    return of(this.MOCK_SAVINGS);
  }

  addSaving(newSaving: Saving): Observable<Saving> {
    this.MOCK_SAVINGS = [...this.MOCK_SAVINGS, newSaving];
    return of(newSaving);
  }
}
