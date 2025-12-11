import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // <--- Import this
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UpdateBudgetExpense } from './update-budget-expense';

describe('UpdateBudgetExpense', () => {
  let component: UpdateBudgetExpense;
  let fixture: ComponentFixture<UpdateBudgetExpense>;

  const activatedRouteStub = {
    paramMap: of(new Map<string, string>([['id', '1']])),
    snapshot: { paramMap: new Map<string, string>([['id', '1']]) }
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBudgetExpense],
      providers: [
        provideHttpClient(),        // <--- Add this
        provideHttpClientTesting(), // <--- Add this
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBudgetExpense);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});