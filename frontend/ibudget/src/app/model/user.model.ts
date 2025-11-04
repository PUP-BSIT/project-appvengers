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

export type ExpensesCategories = {
  id: number;
  name: string;
}

export type Budget = {
  id: number;
  category_id: number;
  category_name: string;
  limit_amount: number;
  savings_goal?: number;
  period: string;
  current_amount: number;
}