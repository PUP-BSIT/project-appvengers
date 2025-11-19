import { TestBed } from '@angular/core/testing';

import { SavingsService } from './savings.service';

describe('SavingsService', () => {
  let service: SavingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
