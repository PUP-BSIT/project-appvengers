import { Component, signal, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import {Transaction} from "../../models/user.model";
import { Header } from '../header/header';
import { TransactionsService } from '../../services/transactions.service';

@Component({
  selector: 'app-transactions',
  imports: [Sidebar, FormsModule, CurrencyPipe, DatePipe, CommonModule, Header],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit, OnDestroy {
  private unlisten: (() => void) | null = null;

  constructor(private renderer: Renderer2, private txService: TransactionsService) {}

  showAddModal = signal(false);
  showNotification = signal(false);
  notificationMessage = signal('');
  selectedTransactionId = signal<number | null>(null);
  popupTop = signal(0);
  popupLeft = signal(0);
  showPopup = signal(false);

  transactions: Transaction[] = [];

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
      date: '' as any,
      description: '',
      category: '',
      amount: null as any,
      type: 'expense'
    };
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  addTransaction() {
    if (this.newTransaction.description &&
        this.newTransaction.category && this.newTransaction.amount > 0) {
      const payload = {
        amount: this.newTransaction.amount,
        type: this.newTransaction.type,
        category: this.newTransaction.category,
        description: this.newTransaction.description,
        transactionDate: this.newTransaction.date
      };

      this.txService.create(payload).subscribe(created => {
        const createdTx: Transaction = {
          id: created.id,
          date: created.date ? new Date(created.date as any) : new Date(),
          description: created.description,
          category: created.category,
          amount: created.amount,
          type: created.type
        };
        this.transactions.push(createdTx);
        this.filterTransactions();
        this.closeAddModal();
        this.showNotificationMessage('Transaction added successfully!');
      }, () => {
        this.showNotificationMessage('Failed to add transaction');
      });
    }
  }

  deleteTransaction(id: number) {
    this.txService.delete(id).subscribe(() => {
      this.transactions = this.transactions.filter(
          transaction => transaction.id !== id);
      this.filterTransactions();
      this.showNotificationMessage('Transaction deleted successfully!');
    }, () => {
      this.showNotificationMessage('Failed to delete transaction');
    });
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
      const payload = {
        amount: this.newTransaction.amount,
        type: this.newTransaction.type,
        category: this.newTransaction.category,
        description: this.newTransaction.description,
        transactionDate: this.newTransaction.date
      };

      this.txService.update(this.editingTransactionId, payload).subscribe(updated => {
        const index = this.transactions.findIndex(
          t => t.id === this.editingTransactionId);
        if (index !== -1) {
          this.transactions[index] = {
            ...this.transactions[index],
            date: updated.date ? new Date(updated.date as any) : new Date(this.newTransaction.date),
            description: updated.description,
            category: updated.category,
            amount: updated.amount,
            type: updated.type
          };
        }
        this.filterTransactions();
        this.closeAddModal();
        this.showNotificationMessage('Transaction updated successfully!');
      }, () => {
        this.showNotificationMessage('Failed to update transaction');
      });
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

  ngOnInit() {
    // load transactions from backend
    this.txService.getAll().subscribe((txs) => {
      // convert potential date strings to Date
      this.transactions = txs.map(t => ({
        ...t,
        date: t.date ? new Date(t.date as any) : new Date()
      }));
      this.filterTransactions();
    }, () => {
      // ignore errors for now; component will continue to work with in-memory data
    });

    this.unlisten = this.renderer.listen('document', 'click', (event: Event) =>
    {
      const target = event.target as HTMLElement;
      if (!target.closest('.btn-dots') && !target.closest('.popup-menu')) {
        this.showPopup.set(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  toggleActions(event: MouseEvent, id: number) {
    event.stopPropagation();
    const button = (event.currentTarget as HTMLElement)
      .closest('.btn-dots') as HTMLElement;
    const rect = button.getBoundingClientRect();
    this.popupTop.set(rect.top + window.scrollY);
    this.popupLeft.set(rect.left - 80 + window.scrollX);
    this.selectedTransactionId.set(id);
    this.showPopup.set(true);
  }

  // Open the edit modal for the currently selected transaction (used by popup menu)
  editSelected() {
    const tx = this.getSelectedTransaction();
    if (!tx) return;
    this.editTransaction(tx);
    this.showPopup.set(false);
  }

  getSelectedTransaction(): Transaction | undefined {
    return this.transactions.find(t => t.id === this.selectedTransactionId());
  }
}
