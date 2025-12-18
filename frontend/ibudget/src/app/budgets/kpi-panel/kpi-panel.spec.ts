import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { KpiPanel } from './kpi-panel';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BudgetTransactionsService } from '../../../services/budget.transactions.service';
import { BudgetService } from '../../../services/budget.service';

describe('KpiPanel', () => {
  let component: KpiPanel;
  let fixture: ComponentFixture<KpiPanel>;

  const activatedRouteStub = {
    paramMap: of(new Map<string, string>([['id', '1']])),
    snapshot: { paramMap: new Map<string, string>([['id', '1']]) }
  } as unknown as ActivatedRoute;

  const mockSummary = {
    limitAmount: 1000,
    totalExpenses: 400,
    remainingBudget: 600,
    categoryName: 'Food'
  };

  const budgetTransactionsServiceStub = {
    getBudgetSummary: (_id: number) => of(mockSummary)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiPanel],
      providers: [
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BudgetTransactionsService, useValue: budgetTransactionsServiceStub },

        // IMPORTANT: mock BudgetService so Angular doesn't instantiate the real one
        { provide: BudgetService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KpiPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load budget summary data', () => {
    expect(component.currentBudget().category_name).toBe('Food');
    expect(component.totalBudget).toBe(1000);
    expect(component.totalExpenses).toBe(400);
    expect(component.remainingBudget).toBe(600);
    expect(component.budgetPercent).toBe(40);
  });
});