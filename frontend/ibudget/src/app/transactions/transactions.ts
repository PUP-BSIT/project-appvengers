import { Component, signal } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import {Transaction} from "../model/user.model";
import { Header } from '../header/header';

@Component({
  selector: 'app-transactions',
  imports: [Sidebar, FormsModule, CurrencyPipe, DatePipe, CommonModule, Header],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  showAddModal = signal(false);
  showNotification = signal(false);
  notificationMessage = signal('');

  transactions: Transaction[] = [
    {
      id: 1,
      date: new Date('2023-09-08'),
      description: 'Part-time Job Payment',
      category: 'Income',
      amount: 14527.88,
      type: 'income'
    },
    {
      id: 2,
      date: new Date('2023-09-03'),
      description: 'Netflix Subscription',
      category: 'Entertainment',
      amount: 929.20,
      type: 'expense'
    },
    {
      id: 3,
      date: new Date('2023-09-01'),
      description: 'Electricity Bill',
      category: 'Bills',
      amount: 3806.30,
      type: 'expense'
    },
    {
      id: 4,
      date: new Date('2023-09-01'),
      description: 'New Shoes Purchase',
      category: 'Shopping',
      amount: 5229.45,
      type: 'expense'
    },
    {
      id: 5,
      date: new Date('2023-09-10'),
      description: 'Grocery Shopping at Supermarket',
      category: 'Shopping',
      amount: 2616.82,
      type: 'expense'
    }
  ];

  filteredTransactions: Transaction[] = [...this.transactions];

    newTransaction = {
    date: new Date(),
    description: '',
    category: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense'
  };

  selectedCategory = 'All Categories';
  categories = [
    'All Categories',
    'Income',
    'Entertainment',
    'Bills',
    'Shopping'
  ];

  isEditing = false;
  editingTransactionId: number | null = null;

    filterTransactions() {
    if (this.selectedCategory === 'All Categories') {
      this.filteredTransactions = [...this.transactions];
    } else {
      this.filteredTransactions = this.transactions.filter(
        transaction => transaction.category === this.selectedCategory
      );
    }
  }

  onCategoryChange() {
    this.filterTransactions();
  }

  openAddModal() {
    this.showAddModal.set(true);
    this.isEditing = false;
    this.editingTransactionId = null;
    // Reset form
    this.newTransaction = {
      date: new Date(),
      description: '',
      category: '',
      amount: 0,
      type: 'expense'
    };
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  addTransaction() {
    if (this.newTransaction.description &&
        this.newTransaction.category && this.newTransaction.amount > 0) {
      const newTransaction: Transaction = {
        id: this.transactions.length + 1,
        date: new Date(this.newTransaction.date),
        description: this.newTransaction.description,
        category: this.newTransaction.category,
        amount: this.newTransaction.amount,
        type: this.newTransaction.type
      };
      this.transactions.push(newTransaction);
      this.filterTransactions();
      this.closeAddModal();
      this.showNotificationMessage('Transaction added successfully!');
    }
  }

  deleteTransaction(id: number) {
    this.transactions = this.transactions.filter(
        transaction => transaction.id !== id);
    this.filterTransactions();
    this.showNotificationMessage('Transaction deleted successfully!');
  }

  getTotalIncome(): number {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpenses(): number {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  editTransaction(transaction: Transaction) {
    this.showAddModal.set(true);
    this.isEditing = true;
    this.editingTransactionId = transaction.id;
    this.newTransaction = {
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type
    };
  }

  updateTransaction() {
    if (this.editingTransactionId !== null &&
        this.newTransaction.description &&
        this.newTransaction.category && this.newTransaction.amount > 0) {
      const index = this.transactions.findIndex(
        t => t.id === this.editingTransactionId);
      if (index !== -1) {
        this.transactions[index] = {
          ...this.transactions[index],
          date: new Date(this.newTransaction.date),
          description: this.newTransaction.description,
          category: this.newTransaction.category,
          amount: this.newTransaction.amount,
          type: this.newTransaction.type
        };
        this.filterTransactions();
        this.closeAddModal();
        this.showNotificationMessage('Transaction updated successfully!');
      }
    }
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  showNotificationMessage(message: string) {
    this.notificationMessage.set(message);
    this.showNotification.set(true);
    setTimeout(() => {
      this.showNotification.set(false);
    }, 3000);
  }
}
