import { 
  Component,signal, Renderer2, OnInit, OnDestroy, ChangeDetectorRef, inject
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Sidebar } from "../sidebar/sidebar";
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import {Transaction, TransactionResponse, Category} from "../../models/user.model";
import { Header } from '../header/header';
import { TransactionsService } from '../../services/transactions.service';
import { AuthService } from '../../services/auth.service';
import { CategoriesService } from '../../services/categories.service';
import { ToggleableSidebar } from "../toggleable-sidebar/toggleable-sidebar";

@Component({
  selector: 'app-transactions',
  imports: [FormsModule, CurrencyPipe, DatePipe, CommonModule, Header, ToggleableSidebar],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit, OnDestroy {
  private unlisten: (() => void) | null = null;
  private route = inject(ActivatedRoute);

  constructor(private renderer: Renderer2,
              private txService: TransactionsService,
              private authService: AuthService,
              private cd: ChangeDetectorRef,
              private categoriesService: CategoriesService) {
    this.filterTransactions();
  }

  showAddModal = signal(false);
  showNotification = signal(false);
  isHidingNotification = signal(false);
  notificationMessage = signal('');
  selectedTransactionId = signal<number | null>(null);
  popupTop = signal(0);
  popupLeft = signal(0);
  showPopup = signal(false);

  transactions: Transaction[] = [];

  filteredTransactions: Transaction[] = [...this.transactions];

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  // Weekly section pagination
  todayPage = 1;
  yesterdayPage = 1;
  olderPage = 1;
  itemsPerGroup = 5;

  newTransaction = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    category_id: undefined as number | undefined,
    category: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense'
  };
  // Holds selected category id for backend payload
  newTransactionCategoryId: number | null = null;

  selectedCategory = 'All Categories';
  categories = [
    'All Categories',
    'Entertainment',
    'Bills',
    'Shopping',
    'Food & Dining',
    'Transportation',
    'Healthcare',
    'Education',
    'Personal Care',
    'Utilities',
    'Groceries',
    'Rent',
    'Insurance',
    'Savings',
    'Investment',
    'Travel',
    'Gifts',
    'Charity',
    'Other'
  ];

  expenseCategories = [
    'Entertainment',
    'Bills',
    'Shopping',
    'Food & Dining',
    'Transportation',
    'Healthcare',
    'Education',
    'Personal Care',
    'Utilities',
    'Groceries',
    'Rent',
    'Insurance',
    'Travel',
    'Gifts',
    'Charity',
    'Other'
  ];

  incomeCategories = [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Bonus',
    'Gift',
    'Refund',
    'Pension',
    'Allowance',
    'Commission',
    'Rental Income',
    'Interest',
    'Other'
  ];

  // Full category objects from backend
  allCategories: Category[] = [];

  selectedPeriod = 'daily';

  showCustomCategoryInput = false;
  customCategoryName = '';

  isEditing = signal(false);
  editingTransactionId: number | null = null;

  isIncomeToggle = signal(false);

    filterTransactions() {
      let filtered = [...this.transactions];

      const sel = (this.selectedCategory || 'All Categories')
                  .toString().toLowerCase();

      if (sel !== 'all categories') {
        filtered = filtered.filter(
          transaction => (transaction.category || '')
            .toString().toLowerCase() === sel
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch(this.selectedPeriod) {
        case 'today':
          filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            transactionDate.setHours(0, 0, 0, 0);
            return transactionDate.getTime() === today.getTime();
          });
          break;
          
        case 'daily':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          
          filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            transactionDate.setHours(0, 0, 0, 0);
            return transactionDate.getTime() === today.getTime() ||
                   transactionDate.getTime() === yesterday.getTime();
          });
          break;
          
        case 'weekly':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            transactionDate.setHours(0, 0, 0, 0);
            return transactionDate >= weekAgo && transactionDate <= today;
          });
          break;
          
        case 'monthly':
          // Show transactions from last month only
          const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          endOfLastMonth.setHours(23, 59, 59, 999);
          filtered = filtered.filter(t => {
            // Avoid timezone shifting by normalizing string dates to local midnight
            const transactionDate = typeof t.date === 'string'
              ? new Date(`${t.date}T00:00:00`)
              : new Date(t.date);
            transactionDate.setHours(0, 0, 0, 0);
            return transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth;
          });
          break;
      }
      
      // Ensure consistent sorting by date desc then id desc
      this.filteredTransactions = filtered.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });
      this.currentPage = 1;
      this.todayPage = 1;
      this.yesterdayPage = 1;
      this.olderPage = 1;
    }

  onCategoryChange() {
    this.filterTransactions();
  }

  onPeriodChange() {
    this.filterTransactions();
  }

  onCategorySelectChange() {
    // Bind directly to category_id and keep name in-sync for display
    this.showCustomCategoryInput = false;
    this.customCategoryName = '';
    this.newTransactionCategoryId = this.newTransaction.category_id ?? null;
    if (this.newTransactionCategoryId) {
      const match = this.allCategories.find(c => c.id === this.newTransactionCategoryId);
      this.newTransaction.category = match ? match.name : '';
    } else {
      this.newTransaction.category = '';
    }
  }

openAddModal() {
    this.showAddModal.set(true);
    this.isEditing.set(false);
    this.editingTransactionId = null;
    this.showCustomCategoryInput = false;
    this.customCategoryName = '';

    this.newTransaction = {
      date: new Date().toISOString().split('T')[0],
      description: '',
      category_id: undefined,
      category: '',
      amount: 0,
      type: 'expense'
    };
    this.newTransactionCategoryId = null;
    this.isIncomeToggle.set(false);
  }

  /**
   * Opens the add modal with pre-filled data from query params (chatbot deep links).
   * Supports: amount, description, category, type, date
   */
  openAddModalWithParams(params: Record<string, string>) {
    this.showAddModal.set(true);
    this.isEditing.set(false);
    this.editingTransactionId = null;
    this.showCustomCategoryInput = false;
    this.customCategoryName = '';

    // Determine transaction type
    const type = (params['type'] === 'income') ? 'income' : 'expense';
    this.isIncomeToggle.set(type === 'income');

    // Parse amount
    const amount = params['amount'] ? parseFloat(params['amount']) : 0;

    // Parse date (default to today)
    const date = params['date'] || new Date().toISOString().split('T')[0];

    // Find category by name and get its ID
    let categoryId: number | undefined = undefined;
    let categoryName = '';
    
    if (params['category']) {
      const categoryParam = params['category'].toLowerCase();
      const matchedCategory = this.allCategories.find(
        c => c.name.toLowerCase() === categoryParam && c.type === type
      );
      if (matchedCategory) {
        categoryId = matchedCategory.id;
        categoryName = matchedCategory.name;
      } else {
        // Try partial match
        const partialMatch = this.allCategories.find(
          c => c.name.toLowerCase().includes(categoryParam) && c.type === type
        );
        if (partialMatch) {
          categoryId = partialMatch.id;
          categoryName = partialMatch.name;
        }
      }
    }

    // Set the transaction data
    this.newTransaction = {
      date: date,
      description: params['description'] || '',
      category_id: categoryId,
      category: categoryName,
      amount: isNaN(amount) ? 0 : amount,
      type: type
    };
    this.newTransactionCategoryId = categoryId ?? null;

    // Show notification that form was pre-filled
    if (params['amount'] || params['description'] || params['category']) {
      this.showNotificationMessage('Form pre-filled by Bonzi! Review and click Add to save.');
    }
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  setExpenseType() {
    this.newTransaction.type = 'expense';
    this.newTransaction.category = '';
    this.newTransaction.category_id = undefined;
  }

  setIncomeType() {
    this.newTransaction.type = 'income';
    this.newTransaction.category = '';
    this.newTransaction.category_id = undefined;
  }

  getModalCategories(): Category[] {
    return this.allCategories.filter(c => c.type === this.newTransaction.type);
  }

  addTransaction() {
    if (this.newTransaction.description &&
        (this.newTransaction.category_id || this.newTransactionCategoryId) && this.newTransaction.amount > 0) {

      const finalCategoryId: number | undefined = this.newTransactionCategoryId ?? this.newTransaction.category_id ?? undefined;

      if (this.showCustomCategoryInput && this.customCategoryName && 
          !this.categories.includes(this.customCategoryName)) {
        this.categories.push(this.customCategoryName);
      }

      const payload = {
        amount: this.newTransaction.amount,
        type: this.newTransaction.type,
        category_id: finalCategoryId,
        description: this.newTransaction.description,
        transactionDate: this.newTransaction.date
      };

      this.txService.create(payload)
        .subscribe((created: TransactionResponse) => {
        console.log('create response:', created);
        this.txService.getAll().subscribe(all => {
          console.log('transactions after create (from backend):', all);
        }, err => console.error('getAll after create failed', err));
        const createdTx: Transaction = {
          id: created.id,
          date: created.transactionDate ?
                new Date(created.transactionDate) : new Date(),
          description: created.description,
          category: created.category,
          amount: created.amount,
          type: created.type
        };
        this.transactions.unshift(createdTx);
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
    return this.filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpenses(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  editTransaction(transaction: Transaction) {
    this.showAddModal.set(true);
    this.isEditing.set(true);
    this.editingTransactionId = transaction.id;
    this.showCustomCategoryInput = false;
    this.customCategoryName = '';
    this.newTransaction = {
      date: transaction.date instanceof Date 
        ? transaction.date.toISOString().split('T')[0]
        : (transaction.date as any),
      description: transaction.description,
      category_id: transaction.category_id,
      category: transaction.category!,
      amount: transaction.amount,
      type: transaction.type!
    };
  }

  updateTransaction() {
    if (this.editingTransactionId !== null &&
        this.newTransaction.description &&
        (this.newTransaction.category_id || this.newTransactionCategoryId) && this.newTransaction.amount > 0) {

      const finalCategoryId: number | undefined = this.newTransactionCategoryId ?? this.newTransaction.category_id ?? undefined;

      if (this.showCustomCategoryInput && this.customCategoryName && 
          !this.categories.includes(this.customCategoryName)) {
        this.categories.push(this.customCategoryName);
      }
 
      const payload = {
        amount: this.newTransaction.amount,
        type: this.newTransaction.type,
        category_id: finalCategoryId,
        description: this.newTransaction.description,
        transactionDate: this.newTransaction.date
      };

      this.txService.update(this.editingTransactionId, payload)
        .subscribe((updated: TransactionResponse) => {
          const index = this.transactions.findIndex(
            t => t.id === this.editingTransactionId);
          if (index !== -1) {
            this.transactions[index] = {
              ...this.transactions[index],
              date: updated.transactionDate ? new Date(updated.transactionDate)
                : new Date(this.newTransaction.date),
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
    this.isHidingNotification.set(false);
    setTimeout(() => {
      this.isHidingNotification.set(true);
      setTimeout(() => {
        this.showNotification.set(false);
        this.isHidingNotification.set(false);
      }, 300);
    }, 3000);
  }

ngOnInit() {
    // Handle query params from chatbot deep links
    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'true' || params['amount'] || params['description']) {
        // Wait for categories to load before opening modal with pre-filled data
        this.categoriesService.getCategories().subscribe({
          next: (cats) => {
            this.allCategories = cats;
            const allNames = cats.map(c => c.name);
            this.categories = ['All Categories', ...allNames];
            this.expenseCategories = cats
              .filter(c => c.type === 'expense').map(c => c.name);
            this.incomeCategories = cats
              .filter(c => c.type === 'income').map(c => c.name);
            
            // Now open the modal with pre-filled data
            this.openAddModalWithParams(params);
          }
        });
      }
    });

    // Load transactions with category linkage
    this.txService.getAllWithCategory().subscribe({
      next: (txs) => {
      const backendTransactions = txs.map(
        (t: any): Transaction => ({
          id: t.id,
          // Normalize date strings to local midnight to avoid timezone shifts breaking filters
          date: t.transactionDate ? new Date(`${t.transactionDate}T00:00:00`) : new Date(),
          description: t.description,
          category: t.category ?? t.name,
          category_id: typeof t.category_id === 'number' ? t.category_id : (t.categoryId != null ? Number(t.categoryId) : undefined),
          amount: t.amount,
          type: t.type
      }));
      this.transactions = [...backendTransactions];
      this.filterTransactions();
      try {
        this.cd.detectChanges();
      } catch (e) {
        setTimeout(() => {}, 0);
      }
    }, error: (err) => {
      console.error('Failed to load transactions on init', err);
      this.filterTransactions();
      this.showNotificationMessage('Unable to load transactions');
    }});

    // Load categories for filters and modal dropdown
    this.categoriesService.getCategories().subscribe({
      next: (cats) => {
      this.allCategories = cats;
      const allNames = cats.map(c => c.name);
      this.categories = ['All Categories', ...allNames];
      this.expenseCategories = cats
        .filter(c => c.type === 'expense').map(c => c.name);
      this.incomeCategories = cats
        .filter(c => c.type === 'income').map(c => c.name);
    }, error: (err) => {
      console.error('Failed to load categories', err);
    }});

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

  editSelected() {
    const tx = this.getSelectedTransaction();
    if (!tx) return;
    this.editTransaction(tx);
    this.showPopup.set(false);
  }

  getSelectedTransaction(): Transaction | undefined {
    return this.transactions.find(t => t.id === this.selectedTransactionId());
  }

  getOlderTransactions(): Transaction[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const olderTransactions = this.filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() !== today.getTime() && 
             transactionDate.getTime() !== yesterday.getTime();
    });

    return olderTransactions.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  getTodayTransactions(): Transaction[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.filteredTransactions
      .filter(t => {
        const d = new Date(t.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      })
      .sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  getPaginatedTodayTransactions(): Transaction[] {
    const all = this.getTodayTransactions();
    const start = (this.todayPage - 1) * this.itemsPerGroup;
    return all.slice(start, start + this.itemsPerGroup);
  }

  getTodayTotalPages(): number {
    return Math.ceil(this.getTodayTransactions().length / this.itemsPerGroup) || 1;
  }

  nextTodayPage() {
    if (this.todayPage < this.getTodayTotalPages()) {
      this.todayPage++;
    }
  }

  previousTodayPage() {
    if (this.todayPage > 1) {
      this.todayPage--;
    }
  }

  getYesterdayTransactions(): Transaction[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    return this.filteredTransactions
      .filter(t => {
        const d = new Date(t.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === yesterday.getTime();
      })
      .sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  getPaginatedYesterdayTransactions(): Transaction[] {
    const all = this.getYesterdayTransactions();
    const start = (this.yesterdayPage - 1) * this.itemsPerGroup;
    return all.slice(start, start + this.itemsPerGroup);
  }

  getYesterdayTotalPages(): number {
    return Math.ceil(this.getYesterdayTransactions().length / this.itemsPerGroup) || 1;
  }

  nextYesterdayPage() {
    if (this.yesterdayPage < this.getYesterdayTotalPages()) {
      this.yesterdayPage++;
    }
  }

  previousYesterdayPage() {
    if (this.yesterdayPage > 1) {
      this.yesterdayPage--;
    }
  }

  getPaginatedOlderTransactions(): Transaction[] {
    const all = this.getOlderTransactions();
    const start = (this.olderPage - 1) * this.itemsPerGroup;
    return all.slice(start, start + this.itemsPerGroup);
  }

  getOlderTotalPages(): number {
    return Math.ceil(this.getOlderTransactions().length / this.itemsPerGroup) || 1;
  }

  nextOlderPage() {
    if (this.olderPage < this.getOlderTotalPages()) {
      this.olderPage++;
    }
  }

  previousOlderPage() {
    if (this.olderPage > 1) {
      this.olderPage--;
    }
  }

  getPaginatedTransactions(): Transaction[] {
    const sorted = [...this.filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (b.id || 0) - (a.id || 0);
    });

    this.totalPages = Math.ceil(sorted.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getCategoryName(categoryId?: number, fallbackName?: string): string {
    if (categoryId) {
      const cat = this.allCategories.find(c => c.id === categoryId);
      if (cat) return cat.name;
    }
    return fallbackName || '';
  }

  getRelativeDate(date: Date | string | undefined): string {
    if (!date) return 'Older';
    
    const transactionDate = new Date(date);
    transactionDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    if (transactionDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (transactionDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return 'Older';
    }
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
