import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetList } from './budget-list';

describe('BudgetList', () => {
  let component: BudgetList;
  let fixture: ComponentFixture<BudgetList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
