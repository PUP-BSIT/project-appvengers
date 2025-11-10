
import { Injectable } from '@angular/core';
import { Income } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private readonly STATIC_INCOME: Income[] = [
    {
      name: 'Salary',
      currentAmount: 2250,
      amount: 3000,
      percentageCompleted: 75
    },
    {
      name: 'Freelance',
      currentAmount: 400,
      amount: 800,
      percentageCompleted: 50
    },
    {
      name: 'Others',
      currentAmount: 49,
      amount: 200,
      percentageCompleted: 20
    },
    {
      name: 'Investments',
      currentAmount: 150,
      amount: 500,
      percentageCompleted: 30
    },
    {
      name: 'Gifts',
      currentAmount: 100,
      amount: 200,
      percentageCompleted: 50
    },
    {
      name: 'Business',
      currentAmount: 300,
      amount: 600,
      percentageCompleted: 50
    },
    {
      name: 'Side Hustle',
      currentAmount: 250,
      amount: 400,
      percentageCompleted: 62.5
    }
  ];

  getStaticIncome(): Income[] {
    return [...this.STATIC_INCOME];
  }
}