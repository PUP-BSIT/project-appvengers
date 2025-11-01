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

export type Salary = {
  name: string;
  amount: number;
  percentageCompleted: number;
};