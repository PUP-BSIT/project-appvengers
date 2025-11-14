import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EmailVerification } from './email-verification';

describe('EmailVerification', () => {
  let component: EmailVerification;
  let fixture: ComponentFixture<EmailVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailVerification],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailVerification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
