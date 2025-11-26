import { TestBed } from '@angular/core/testing';

import { ResendEmailService } from './resend-email.service';

describe('ResendEmailService', () => {
  let service: ResendEmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResendEmailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
