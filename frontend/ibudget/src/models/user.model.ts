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
  category_id: number;
  category_name: string;  
  limit_amount: number;
  savings_goal?: number;
  start_date: string;
  end_date: string;
  current_amount?: number;
}