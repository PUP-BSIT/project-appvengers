export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  emailVerificationToken: string;
  emailVerified: boolean;
  verificationToken: string;
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

export type Expenses = {
  name: string;
  currentAmount: number;
  allocatedAmount: number;
  percentageUsed: number;
};

export type Income = {
  name: string;
  currentAmount: number;
  amount: number;
  percentageCompleted: number;
};

export type TransactionHistory = {
  amount: number;
  category: string;
  type: string;
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

export type Saving = {
  savings_id?: number;
  user_id: number;
  name: string;
  goal_date: string;
  frequency: string;
  target_amount: number;
  current_amount: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}