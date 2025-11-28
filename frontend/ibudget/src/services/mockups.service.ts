import { Injectable } from '@angular/core';
import { Budget, BudgetTransaction } from '../models/user.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockupsService {
  MOCK_BUDGETS: Budget[] = [
    {
      id: 1,
      category_id: 1,
      category_name: 'Clothes',
      limit_amount: 500,
      current_amount: 200,
      start_date: '2025-11-04',
      end_date: '2025-11-11'
    },
    {
      id: 2,
      category_id: 2,
      category_name: 'Transport',
      limit_amount: 2500,
      current_amount: 1500,
      start_date: '2025-11-04',
      end_date: '2025-11-11'
    }
  ];

  MOCK_BUDGET_TRANSACTIONS: BudgetTransaction[] = [
    {
      transaction_id: 1,
      budget_id: 1,
      user_id: 1,
      category_id: 1,
      transaction_date: '2025-11-05',
      created_at: '2025-11-05',
      updated_at: '2025-11-05',
      description: 'Vintage Shirt purchase',
      amount: 200
    },
    {
      transaction_id: 2,
      budget_id: 2,
      user_id: 1,
      category_id: 2,
      transaction_date: '2025-11-06',
      created_at: '2025-11-06',
      updated_at: '2025-11-06',
      description: 'Bus fare',
      amount: 30
    },
    {
      transaction_id: 3,
      budget_id: 2,
      user_id: 1,
      category_id: 2,
      transaction_date: '2025-11-07',
      created_at: '2025-11-07',
      updated_at: '2025-11-07',
      description: 'Jeepney fare',
      amount: 100
    },
    {
      transaction_id: 4,
      budget_id: 1,
      user_id: 1,
      category_id: 1,
      transaction_date: '2025-11-08',
      created_at: '2025-11-08',
      updated_at: '2025-11-08',
      description: 'Transport to Ukay-Ukay Shop',
      amount: 50
    },
    {
      transaction_id: 5,
      budget_id: 2,
      user_id: 1,
      category_id: 2,
      transaction_date: '2025-11-09',
      created_at: '2025-11-09',
      updated_at: '2025-11-09',
      description: 'Bought Labubu while traveling',
      amount: 200
    }
  ];

  // Budget Methods
  getMockBudgets(): Observable<Budget[]> {
    return of([...this.MOCK_BUDGETS]);
  }

  getMockBudgetsById(id: number): Observable<Budget>  {
    const matchedBudget = this.MOCK_BUDGETS.find(budget => budget.id === id);

    if (!matchedBudget) {
      throw new Error(`Budget with id ${id} not found.`);
    }

    return of(matchedBudget);
  }

  addMockBudget(newBudget: Budget): Observable<Budget> {
    this.MOCK_BUDGETS = [...this.MOCK_BUDGETS, newBudget];
    return of(newBudget);
  }

  updateMockBudget(id: number, budget: Budget): Observable<Budget> {
    this.MOCK_BUDGETS = this.MOCK_BUDGETS
      .map(existingBudget => existingBudget.id === id ?
        {...existingBudget, ...budget} : existingBudget
    );

    const updatedBudget = this.MOCK_BUDGETS.find(budget => budget.id === id);

    if(!updatedBudget) {
      throw new Error(`Failed to update because budget not found.`);
    }

    return of(updatedBudget);
  }

  deleteMockBudget(id: number): Observable<Budget[]> {
    this.MOCK_BUDGETS = this.MOCK_BUDGETS.filter(budget => budget.id !== id);
    return of(this.MOCK_BUDGETS);
  }

  // Budget Transactions Methods
  getAllMockBudgetTransactions(): Observable<BudgetTransaction[]> {
    return of([...this.MOCK_BUDGET_TRANSACTIONS]);
  }

  getMockBudgetTransactionsByBudgetId(budgetId: number): Observable<BudgetTransaction[]> {
    const filteredTransactions = this.MOCK_BUDGET_TRANSACTIONS
      .filter(transaction => transaction.budget_id === budgetId);
    return of(filteredTransactions);
  }

  getMockBudgetTransactionById(id: number): Observable<BudgetTransaction>  {
    const matchedTransaction = this.MOCK_BUDGET_TRANSACTIONS
      .find(transaction => transaction.transaction_id === id);
    if (!matchedTransaction) {
      throw new Error(`Transaction with id ${id} not found.`);
    }
    return of(matchedTransaction);
  }

  addMockBudgetTransaction(newTransaction: BudgetTransaction): Observable<BudgetTransaction> {
    this.MOCK_BUDGET_TRANSACTIONS = 
      [...this.MOCK_BUDGET_TRANSACTIONS, newTransaction];

    return of(newTransaction);
  }

  updateMockBudgetTransaction(id: number, transaction: BudgetTransaction): Observable<BudgetTransaction> {
    this.MOCK_BUDGET_TRANSACTIONS = this.MOCK_BUDGET_TRANSACTIONS
      .map(existingTransaction => existingTransaction.transaction_id === id ?
        {...existingTransaction, ...transaction} : existingTransaction
    );

    const updatedTransaction = this.MOCK_BUDGET_TRANSACTIONS
      .find(transaction => transaction.transaction_id === id);

    if(!updatedTransaction) {
      throw new Error(`Failed to update because transaction not found.`);
    }

    return of(updatedTransaction);
  }

  deleteMockBudgetTransaction(id: number): Observable<BudgetTransaction[]> {
    this.MOCK_BUDGET_TRANSACTIONS = this.MOCK_BUDGET_TRANSACTIONS
      .filter(transaction => transaction.transaction_id !== id);
    return of(this.MOCK_BUDGET_TRANSACTIONS);
  }
}