import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoughnutChart } from './doughnut-chart';

describe('DoughnutChart', () => {
  let component: DoughnutChart;
  let fixture: ComponentFixture<DoughnutChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoughnutChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoughnutChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
