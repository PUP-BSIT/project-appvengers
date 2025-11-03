import { TestBed } from '@angular/core/testing';

import { History } from './history';

describe('History', () => {
  let service: History;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(History);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
