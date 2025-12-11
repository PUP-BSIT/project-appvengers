export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  emailVerificationToken: string;
  emailVerified: boolean;
  failedAttempts: number;
  lockedUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

export type ExistResponse = {
  exists: boolean;
}

export type SignupRequest = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type AuthData = {
  username: string;
  email: string;
  token: string;
}

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
}

// Model for account setup verification response
export type AccountSetupResponse = {
  firstname: string;
  middlename: string;
  lastname: string;
  birthdate: string;
  gender: string;
}

export type Transaction = {
  id: number;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type?: 'income' | 'expense';
}

export type TransactionResponse = {
  id: number;
  transactionDate: string | Date;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

export type Notification = {
  id: number;
  title: string;
  message: string;
  date: string;
  amount?: number;
  type: 'warning' | 'info' | 'alert';
  read: boolean;
  category?: string;
  savingName?: string;
}

export type ReportRecord = {
  reports_id: number;
  user_id: number;
  period_start: string;
  period_end: string;
  report: string;
}

export type MonthlyReport = {
  monthName: string;
  month: number;
  year: number;
  totalSpent: number;
  totalIncome: number;
  expenseByCategory: { [key: string]: number };
  incomeByCategory: { [key: string]: number };
}

export type Category = {
  id: number;
  userId: number;
  name: string;
  type: string; // "income" or "expense"
}

export type Budget = {
  id: number;
  category_id?: number;
  category_name: string;
  limit_amount: number;
  savings_goal?: number;
  start_date: string;
  end_date: string;
  current_amount?: number;
}

// Backend entity shape
export type BackendBudget = {
  budgetId: number;
  userId: number;
  categoryId: number;
  categoryName: string;
  limitAmount: number;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string;   // ISO yyyy-MM-dd
};

// Frontend entity shape
export type Saving = {
  saving_id?: number;
  name: string;
  goal_date: string;
  frequency: string;
  target_amount: number;
  current_amount: number;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Backend Entity Shape
export type BackendSaving = {
  savingId?: number;
  name: string;
  goalDate: string;
  frequency: string;
  targetAmount: number;
  currentAmount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type SavingTransaction = {
  id: number;
  savings_id?: number;
  user_id?: number;
  transaction_date?: string;
  savings_action?: 'Deposit' | 'Withdrawal';
  description: string;
  amount: number;
  category?: string;
  type?: 'income' | 'expense';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type BackendSavingTransaction = {
  id: number;
  savingId?: number; // backend DTO uses savingId
  userId?: number;
  transactionDate?: string;
  savingsAction?: 'Deposit' | 'Withdrawal';
  description: string;
  amount: number;
  category?: string;
  type?: 'income' | 'expense';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type BudgetTransaction = {
  transactionId: number;
  budgetId?: number;
  userId?: number;
  transactionDate?: string;
  description: string;
  amount: number;
  type: string;
};
