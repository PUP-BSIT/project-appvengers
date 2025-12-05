import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AddBudgetExpense } from './add-budget-expense';

describe('AddBudgetExpense', () => {
  let component: AddBudgetExpense;
  let fixture: ComponentFixture<AddBudgetExpense>;

  const activatedRouteStub = {
    paramMap: of(new Map<string, string>([['id', '1']])),
    snapshot: { paramMap: new Map<string, string>([['id', '1']]) }
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,  
        AddBudgetExpense           
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddBudgetExpense);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});