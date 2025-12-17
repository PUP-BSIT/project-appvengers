import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { Savings } from './savings';

describe('Savings', () => {
  let component: Savings;
  let fixture: ComponentFixture<Savings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Savings],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideCharts(withDefaultRegisterables())
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Savings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
