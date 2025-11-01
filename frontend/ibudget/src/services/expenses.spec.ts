import { TestBed } from '@angular/core/testing';

import { Expenses } from './expenses';

describe('Expenses', () => {
  let service: Expenses;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Expenses);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
