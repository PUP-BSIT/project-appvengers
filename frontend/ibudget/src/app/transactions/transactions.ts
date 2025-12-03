import { Component, signal, Renderer2, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import {Transaction} from "../../models/user.model";
import { Header } from '../header/header';
import { TransactionsService } from '../../services/transactions.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transactions',
  imports: [Sidebar, FormsModule, CurrencyPipe, DatePipe, CommonModule, Header],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit, OnDestroy {
  private unlisten: (() => void) | null = null;

  constructor(private renderer: Renderer2,
              private txService: TransactionsService,
              private authService: AuthService,
              private cd: ChangeDetectorRef) {}

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

  selectedPeriod = 'daily';

  showCustomCategoryInput = false;
  customCategoryName = '';

  isEditing = false;
  editingTransactionId: number | null = null;

    filterTransactions() {
      const sel = (this.selectedCategory || 'All Categories')
                  .toString().toLowerCase();

      if (sel === 'all categories') {
        this.filteredTransactions = [...this.transactions];
      } else {
        this.filteredTransactions = this.transactions.filter(
          transaction => (transaction.category || '')
            .toString().toLowerCase() === sel
        );
      }
    }

  onCategoryChange() {
    this.filterTransactions();
  }

  onPeriodChange() {
    // Add filtering logic based on selected period
    console.log('Period changed to:', this.selectedPeriod);
    // You can implement date filtering logic here based on daily/weekly/monthly
  }

  onCategorySelectChange() {
    if (this.newTransaction.category === 'custom') {
      this.showCustomCategoryInput = true;
      this.customCategoryName = '';
    } else {
      this.showCustomCategoryInput = false;
      this.customCategoryName = '';
    }
  }

  openAddModal() {
    this.showAddModal.set(true);
    this.isEditing = false;
    this.editingTransactionId = null;
    this.showCustomCategoryInput = false;
    this.customCategoryName = '';
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
      
      // Use custom category if provided
      const finalCategory = this.showCustomCategoryInput && this.customCategoryName 
        ? this.customCategoryName 
        : this.newTransaction.category;
      
      // Add custom category to categories list if not already there
      if (this.showCustomCategoryInput && this.customCategoryName && 
          !this.categories.includes(this.customCategoryName)) {
        this.categories.push(this.customCategoryName);
      }
      
      const payload = {
        amount: this.newTransaction.amount,
        type: this.newTransaction.type,
        category: finalCategory,
        description: this.newTransaction.description,
        transactionDate: this.newTransaction.date
      };

      this.txService.create(payload).subscribe(created => {
        console.log('create response:', created);
        // re-fetch all transactions from backend to verify persistence
        this.txService.getAll().subscribe(all => {
          console.log('transactions after create (from backend):', all);
        }, err => console.error('getAll after create failed', err));
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
    this.showCustomCategoryInput = false;
    this.customCategoryName = '';
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
      
      // Use custom category if provided
      const finalCategory = this.showCustomCategoryInput && this.customCategoryName 
        ? this.customCategoryName 
        : this.newTransaction.category;
      
      // Add custom category to categories list if not already there
      if (this.showCustomCategoryInput && this.customCategoryName && 
          !this.categories.includes(this.customCategoryName)) {
        this.categories.push(this.customCategoryName);
      }
      
      const payload = {
        amount: this.newTransaction.amount,
        type: this.newTransaction.type,
        category: finalCategory,
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
    console.log('Transactions: auth token present?', !!this.authService.getToken());
    console.log('Transactions: auth token (first 24 chars):', this.authService.getToken()?.slice(0, 24));
    this.txService.getAll().subscribe((txs) => {
      // convert potential date strings to Date
      this.transactions = txs.map(t => ({
        ...t,
        date: t.date ? new Date(t.date as any) : new Date()
      }));
      this.filterTransactions();
      // ensure change detection runs so template updates on first navigation
      try {
        this.cd.detectChanges();
      } catch (e) {
        // fallback: schedule a microtask
        setTimeout(() => {}, 0);
      }
    }, (err) => {
      console.error('Failed to load transactions on init', err);
      // show a notification so devs notice this on the UI too
      this.showNotificationMessage('Unable to load transactions (check console)');
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

  getRelativeDate(date: Date): string {
    const today = new Date();
    const transactionDate = new Date(date);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    transactionDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - transactionDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays === -1) {
      return 'Tomorrow';
    } else {
      return '';
    }
  }

  getTodayTransactions(): Transaction[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime();
    });
  }

  getYesterdayTransactions(): Transaction[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    return this.filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === yesterday.getTime();
    });
  }

  getOlderTransactions(): Transaction[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    return this.filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() !== today.getTime() && 
             transactionDate.getTime() !== yesterday.getTime();
    });
  }

  getOlderTransactionsByDate(): Map<string, Transaction[]> {
    const grouped = new Map<string, Transaction[]>();
    
    this.getOlderTransactions().forEach(transaction => {
      const dateKey = new Date(transaction.date).toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(transaction);
    });
    
    return grouped;
  }
}
