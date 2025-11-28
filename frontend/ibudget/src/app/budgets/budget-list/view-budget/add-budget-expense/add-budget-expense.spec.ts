import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBudgetExpense } from './add-budget-expense';

describe('AddBudgetExpense', () => {
  let component: AddBudgetExpense;
  let fixture: ComponentFixture<AddBudgetExpense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBudgetExpense]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBudgetExpense);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
