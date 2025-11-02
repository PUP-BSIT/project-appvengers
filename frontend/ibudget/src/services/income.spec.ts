import { TestBed } from '@angular/core/testing';

import { IncomeService } from './income';

describe('Income', () => {
  let service: IncomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
