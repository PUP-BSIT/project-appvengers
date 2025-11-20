import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendingChart } from './spending-chart';

describe('SpendingChart', () => {
  let component: SpendingChart;
  let fixture: ComponentFixture<SpendingChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpendingChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendingChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
