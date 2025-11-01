import { Injectable } from '@angular/core';
import { Income } from '../app/model/user_model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private readonly STATIC_INCOME: Income[] = [
    {name: 'Salary', amount: 3000, percentageCompleted: 75},
    {name: 'Freelance', amount: 800, percentageCompleted: 50},
    {name: 'Others', amount: 200, percentageCompleted: 20}
  ]

  getStaticIncome(): Income[] {
    return [...this.STATIC_INCOME];
  }
}