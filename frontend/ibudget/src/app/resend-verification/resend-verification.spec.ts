import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendVerification } from './resend-verification';

describe('ResendVerification', () => {
  let component: ResendVerification;
  let fixture: ComponentFixture<ResendVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendVerification]
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
