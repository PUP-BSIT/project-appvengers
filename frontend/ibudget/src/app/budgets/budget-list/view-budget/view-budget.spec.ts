import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ViewBudget } from './view-budget';

describe('ViewBudget', () => {
  let component: ViewBudget;
  let fixture: ComponentFixture<ViewBudget>;

  const activatedRouteStub = {
    paramMap: of(new Map<string, string>([['id', '1']])),
    snapshot: { paramMap: new Map<string, string>([['id', '1']]) }
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBudget, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        provideRouter([]),
        provideCharts(withDefaultRegisterables())
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBudget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
