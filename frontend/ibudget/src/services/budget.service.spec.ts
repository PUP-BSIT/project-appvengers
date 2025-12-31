import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BudgetService } from './budget.service';
import { environment } from '../environments/environment';

describe('BudgetService', () => {
  let service: BudgetService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/budgets`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BudgetService]
    });
    service = TestBed.inject(BudgetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should get budgets and map to frontend model', () => {
    const backend = [{
      budgetId: 1,
      userId: 99,
      categoryId: 10,
      categoryName: 'Food',
      name: 'My Budget',
      limitAmount: 1000,
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    }];

    service.getBudgets().subscribe(budgets => {
      expect(budgets.length).toBe(1);
      const b = budgets[0];
      expect(b.id).toBe(1);
      expect(b.category_id).toBe(10);
      expect(b.category_name).toBe('Food');
      expect(b.limit_amount).toBe(1000);
      expect(b.start_date).toBe('2025-01-01');
      expect(b.end_date).toBe('2025-01-31');
      expect(b.current_amount).toBe(0);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(backend);
  });

  it('should get budget by id', () => {
    const backend = {
      budgetId: 2,
      userId: 99,
      categoryId: 20,
      categoryName: 'Transport',
      name: 'Transport Budget',
      limitAmount: 500,
      startDate: '2025-02-01',
      endDate: '2025-02-28'
    };

    service.getBudgetById(2).subscribe(b => {
      expect(b.id).toBe(2);
      expect(b.category_id).toBe(20);
      expect(b.limit_amount).toBe(500);
    });

    const req = httpMock.expectOne(`${baseUrl}/2`);
    expect(req.request.method).toBe('GET');
    req.flush(backend);
  });

  it('should add budget', () => {
    const input = {
      category_id: 30,
      name: 'Health Budget',
      limit_amount: 800,
      start_date: '2025-03-01',
      end_date: '2025-03-31'
    } as any;

    const backend = {
      budgetId: 3,
      userId: 99,
      categoryId: 30,
      categoryName: 'Health',
      name: 'Health Budget',
      limitAmount: 800,
      startDate: '2025-03-01',
      endDate: '2025-03-31'
    };

    service.addBudget(input as any).subscribe(b => {
      expect(b.id).toBe(3);
      expect(b.category_id).toBe(30);
      expect(b.limit_amount).toBe(800);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      categoryId: 30,
      name: 'Health Budget',       
      limitAmount: 800,
      startDate: '2025-03-01',
      endDate: '2025-03-31'
    });
    req.flush(backend);
  });

  it('should update budget', () => {
    const payload = {
      category_id: 40,
      name: 'Utilities Budget',
      limit_amount: 1200,
      start_date: '2025-04-01',
      end_date: '2025-04-30'
    };

    const backend = {
      budgetId: 4,
      userId: 99,
      categoryId: 40,
      categoryName: 'Utilities',
      name: 'Utilities Budget',
      limitAmount: 1200,
      startDate: '2025-04-01',
      endDate: '2025-04-30'
    };

    service.updateBudget(4, payload).subscribe(b => {
      expect(b.id).toBe(4);
      expect(b.category_id).toBe(40);
      expect(b.limit_amount).toBe(1200);
    });

    const req = httpMock.expectOne(`${baseUrl}/4`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      categoryId: 40,
      name: 'Utilities Budget',     
      limitAmount: 1200,
      startDate: '2025-04-01',
      endDate: '2025-04-30'
    });
    req.flush(backend);
  });

  it('should delete budget and return refreshed list', () => {
    service.deleteBudget(5).subscribe(() => {
      // after delete, it should request the list
    });

    const delReq = httpMock.expectOne(`${baseUrl}/5`);
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush({});

    const listReq = httpMock.expectOne(baseUrl);
    expect(listReq.request.method).toBe('GET');
    listReq.flush([]);
  });
});