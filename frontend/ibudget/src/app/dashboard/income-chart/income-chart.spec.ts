import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeChart } from './income-chart';

describe('IncomeChart', () => {
  let component: IncomeChart;
  let fixture: ComponentFixture<IncomeChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeChart]
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
