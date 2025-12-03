import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SavingsService } from './savings.service';

describe('SavingsService', () => {
  let service: SavingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(SavingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
