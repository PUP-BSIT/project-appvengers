import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { KpiPanel } from './kpi-panel';
import { BudgetService } from '../../../services/budget.service';
import { Budget } from '../../../models/user.model';

describe('KpiPanel', () => {
  let component: KpiPanel;
  let fixture: ComponentFixture<KpiPanel>;

  const activatedRouteStub = {
    paramMap: of(new Map<string, string>([['id', '1']])),
    snapshot: { paramMap: new Map<string, string>([['id', '1']]) }
  } as unknown as ActivatedRoute;

  const mockBudget: Budget = {
    id: 1,
    category_id: 10,
    category_name: 'Food',
    limit_amount: 1000,
    current_amount: 400,
    start_date: '2025-01-01',
    end_date: '2025-01-31'
  } as Budget;

  const budgetServiceStub = {
    getBudgetById: (_id: number) => of(mockBudget)
  } as Partial<BudgetService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiPanel],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BudgetService, useValue: budgetServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KpiPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load budget data from BudgetService', () => {
    expect(component.currentBudget().category_name).toBe('Food');
    expect(component.totalBudget).toBe(1000);
    expect(component.totalExpenses).toBe(400);
    expect(component.remainingBudget).toBe(600);
    expect(component.budgetPercent).toBe(40);
  });
});
