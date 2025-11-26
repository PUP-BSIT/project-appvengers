import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendVerification } from './resend-verification';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('ResendVerification', () => {
  let component: ResendVerification;
  let fixture: ComponentFixture<ResendVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendVerification],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({}))
          }
        }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResendVerification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
