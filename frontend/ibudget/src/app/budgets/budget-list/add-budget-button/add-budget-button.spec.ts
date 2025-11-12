import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBudgetButton } from './add-budget-button';

describe('AddBudgetButton', () => {
  let component: AddBudgetButton;
  let fixture: ComponentFixture<AddBudgetButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBudgetButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBudgetButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
