import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBudgetExpense } from './update-budget-expense';

describe('UpdateBudgetExpense', () => {
  let component: UpdateBudgetExpense;
  let fixture: ComponentFixture<UpdateBudgetExpense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBudgetExpense]
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
