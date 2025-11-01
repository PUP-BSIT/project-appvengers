import { TestBed } from '@angular/core/testing';

import { Income } from './income';

describe('Income', () => {
  let service: Income;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Income);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
