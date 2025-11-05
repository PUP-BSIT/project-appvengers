import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiPanel } from './kpi-panel';

describe('KpiPanel', () => {
  let component: KpiPanel;
  let fixture: ComponentFixture<KpiPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
