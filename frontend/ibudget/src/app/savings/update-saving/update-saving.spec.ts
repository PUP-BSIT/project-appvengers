import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { UpdateSaving } from './update-saving';
import { provideHttpClient } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UpdateSaving', () => {
  let component: UpdateSaving;
  let fixture: ComponentFixture<UpdateSaving>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSaving],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideCharts(withDefaultRegisterables()),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSaving);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
