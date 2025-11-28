import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart, registerables } from 'chart.js';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { IncomeChart } from './income-chart';

describe('IncomeChart', () => {
  let component: IncomeChart;
  let fixture: ComponentFixture<IncomeChart>;

  beforeEach(async () => {
    Chart.register(...registerables);
    
    await TestBed.configureTestingModule({
      imports: [IncomeChart, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
