import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { Savings } from './savings';

describe('Savings', () => {
  let component: Savings;
  let fixture: ComponentFixture<Savings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Savings],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
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
