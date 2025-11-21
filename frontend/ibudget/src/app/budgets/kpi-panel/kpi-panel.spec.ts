import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiPanel } from './kpi-panel';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('KpiPanel', () => {
  let component: KpiPanel;
  let fixture: ComponentFixture<KpiPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiPanel, HttpClientTestingModule]
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
