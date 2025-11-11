import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBudgetButton } from './update-budget-button';

describe('UpdateBudgetButton', () => {
  let component: UpdateBudgetButton;
  let fixture: ComponentFixture<UpdateBudgetButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBudgetButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBudgetButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
