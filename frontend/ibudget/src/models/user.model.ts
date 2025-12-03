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
}

export type ReportRecord = {
  reports_id: number;
  user_id: number;
  period_start: string;
  period_end: string;
  report: string;
}

export type Categories = {
  category_id: number;
  name: string;
  type: string;
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
  transaction_id: number;
  savings_id?: number;
  user_id?: number;
  transaction_date?: string;
  savings_action?: 'Deposit' | 'Withdrawal';
  date: Date;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type BudgetTransaction = {
  transaction_id: number;
  budget_id?: number;
  user_id?: number;
  category_id?: number;
  transaction_date?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  description: string;
  amount: number;
}