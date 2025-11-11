import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart, registerables } from 'chart.js';

import { ExpenseChart } from './expense-chart';

describe('ExpenseChart', () => {
  let component: ExpenseChart;
  let fixture: ComponentFixture<ExpenseChart>;

  beforeEach(async () => {
    Chart.register(...registerables);
    
    await TestBed.configureTestingModule({
      imports: [ExpenseChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
