import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetsPanel } from './budgets-panel';

describe('BudgetsPanel', () => {
  let component: BudgetsPanel;
  let fixture: ComponentFixture<BudgetsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetsPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
