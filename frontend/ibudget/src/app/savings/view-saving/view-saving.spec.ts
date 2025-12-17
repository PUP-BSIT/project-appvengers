import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ViewSaving } from './view-saving';

describe('ViewSaving', () => {
  let component: ViewSaving;
  let fixture: ComponentFixture<ViewSaving>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSaving],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideCharts(withDefaultRegisterables()),
        { provide: ActivatedRoute, 
          useValue: { 
            snapshot: { 
              paramMap: convertToParamMap({ id: '1' }) 
            } 
          } 
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSaving);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
