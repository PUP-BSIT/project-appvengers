import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core'; 
import { Sidebar } from "../../../sidebar/sidebar";
import { Header } from "../../../header/header";
import { KpiPanel } from "../../kpi-panel/kpi-panel";
import { AddBudgetExpense } from "./add-budget-expense/add-budget-expense";
import { UpdateBudgetExpense } from "./update-budget-expense/update-budget-expense";
import { CategoriesService } from '../../../../services/categories.service';
import { BudgetTransactionsService } from '../../../../services/budget.transactions.service';
import { BudgetTransaction, Category } from '../../../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { ToggleableSidebar } from "../../../toggleable-sidebar/toggleable-sidebar";

@Component({
  selector: 'app-view-budget',
  standalone: true, 
  imports: [ToggleableSidebar, Header, KpiPanel, AddBudgetExpense, UpdateBudgetExpense],
  templateUrl: './view-budget.html',
  styleUrl: './view-budget.scss',
})

export class ViewBudget implements OnInit, AfterViewInit {
  @ViewChild(KpiPanel) kpiPanel!: KpiPanel; 
  @ViewChild('updateBudgetModal') updateBudgetModal!: UpdateBudgetExpense;

  // Services
  budgetTxService = inject(BudgetTransactionsService);
  categoriesService = inject(CategoriesService);
  activatedRoute = inject(ActivatedRoute);

  // State
  budgetExpenses = signal<BudgetTransaction[]>([]);
  isBudgetExceeded = signal(false);
  categories = signal<Category[]>([]);
  budgetId = signal<number>(0);

  // Snackbar
  showNotification = signal(false);
  isHidingNotification = signal(false);
  notificationMessage = signal('');

  // Loading State
  isLoading = signal(true);

  // Dropdown State
  // store the open dropdown index (null = none open)
  isDropdownOpen = signal<number | null>(null);

  ngOnInit(): void {
    this.initBudgetId();
    this.getCategories();
    this.getBudgetExpenses();
    this.getBudgetSummary();
  }

  ngAfterViewInit(): void {
    this.kpiPanel.refresh(); // refresh KPI panel once available
  }

  initBudgetId() {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.budgetId.set(id);
  }

  getBudgetExpenses() {
    const id = this.budgetId();
    if (!id) return;

    this.budgetTxService.getByBudgetId(id).subscribe({
      next: (transactions) => {
        this.budgetExpenses.set(transactions);

        // Added a timeout for better UX while loading
        setTimeout(() => {
          this.isLoading.set(false);
        }, 2000);
      },
      error: (err) => {
        console.error('Failed to load budget expenses', err);
        this.isLoading.set(false);
      }
    });
  }

  getBudgetSummary() {
  const id = this.budgetId();
  if (!id) return;

  this.budgetTxService.getBudgetSummary(id).subscribe({
    next: (summary) => {
      const exceeded = +summary.totalExpenses >= +summary.limitAmount;
      this.isBudgetExceeded.set(exceeded);
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error('Failed to load summary', err);
      this.isLoading.set(false);
    }
  });
}

  getCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  getCategoryName(categoryId: number): string {
    const cat = this.categories().find(c => c.id === categoryId);
    return cat ? cat.name : `Category ${categoryId}`;
  }

  deleteBudgetExpense(transactionId: number) {
    this.budgetTxService.delete(transactionId).subscribe({
      next: () => {
        this.getBudgetExpenses();
        this.getBudgetSummary();
        this.kpiPanel.refresh(); //Refresh KPI panel data
        this.showNotificationMessage("Expense deleted successfully!");
      },
      error: (err) => console.error('Failed to delete expense', err)
    });
  }

  onBudgetExpenseAdded(_event: BudgetTransaction) {
    this.getBudgetExpenses();
    this.getBudgetSummary();
    this.kpiPanel.refresh(); 
  }

  onBudgetExpenseUpdated(_event: BudgetTransaction) {
    this.getBudgetExpenses();
    this.getBudgetSummary();
    this.kpiPanel.refresh(); 
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

  toggleDropdown(index: number) {
    const current = this.isDropdownOpen();
    this.isDropdownOpen.set(current === index ? null : index);
  }

  openUpdateModal(transactionId: number) {
    this.updateBudgetModal.open(transactionId);
    this.isDropdownOpen.set(null); // Close dropdown after opening modal
  }
}