import { TestBed } from '@angular/core/testing';

import { ResendEmailService } from './resend-email.service';
import { provideHttpClient } from '@angular/common/http';

describe('ResendEmailService', () => {
  let service: ResendEmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ResendEmailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
