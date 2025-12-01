import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetProgressBar } from './budget-progress-bar';

describe('BudgetProgressBar', () => {
  let component: BudgetProgressBar;
  let fixture: ComponentFixture<BudgetProgressBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetProgressBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetProgressBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
