import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SavingTransactionService } from './saving-transaction.service';

describe('SavingTransactionService', () => {
  let service: SavingTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SavingTransactionService
      ]
    });
    service = TestBed.inject(SavingTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
