import { TestBed } from '@angular/core/testing';

import { SetupAccountService } from './setup-account.service';

describe('SetupAccountService', () => {
  let service: SetupAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetupAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
