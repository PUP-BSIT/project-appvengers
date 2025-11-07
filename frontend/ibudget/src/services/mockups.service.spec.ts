import { TestBed } from '@angular/core/testing';

import { MockupsService } from './mockups.service';

describe('MockupsService', () => {
  let service: MockupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
