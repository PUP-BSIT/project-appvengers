import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiPanel } from './kpi-panel';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MockupsService } from '../../../services/mockups.service';
import { Budget } from '../../../models/user.model';

describe('KpiPanel', () => {
  let component: KpiPanel;
  let fixture: ComponentFixture<KpiPanel>;

  const activatedRouteStub = {
    // simulate /budgets/:id with id=1
    paramMap: of(new Map<string, string>([['id', '1']])),
    snapshot: { paramMap: new Map<string, string>([['id', '1']]) }
  } as unknown as ActivatedRoute;

  const mockBudget: Budget = {
    id: 1,
    category_id: 10,
    category_name: 'Food',
    limit_amount: 1000,
    current_amount: 0,
    start_date: '2025-01-01',
    end_date: '2025-01-31'
  } as Budget;

  const mockupsServiceStub = {
    getMockBudgetsById: (_id: number) => of(mockBudget)
  } as Partial<MockupsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiPanel, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: MockupsService, useValue: mockupsServiceStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load budget data from MockupsService', () => {
    expect(component.totalBudget).toBe(1000);
    expect(component.totalExpenses).toBe(600);
    expect(component.remainingBudget).toBe(400);
    expect(component.budgetPercent).toBe(60);
    expect(component.currentBudget().category_name).toBe('Food');
  });
});
