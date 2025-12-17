import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Security } from './security';

describe('Security', () => {
  let component: Security;
  let fixture: ComponentFixture<Security>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Security],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideCharts(withDefaultRegisterables()),
        {provide: ActivatedRoute, 
          useValue: {
            snapshot: { 
              paramMap: convertToParamMap(
                {id: '1'}
              ) 
            } 
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Security);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
