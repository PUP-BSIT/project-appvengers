import { TestBed } from '@angular/core/testing';

import { SavingTransactionService } from './saving-transaction.service';

describe('SavingTransactionService', () => {
  let service: SavingTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavingTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
