import { TestBed } from '@angular/core/testing';

import { SetupAccountService } from './setup-account.service';
import { provideHttpClient } from '@angular/common/http';

describe('SetupAccountService', () => {
  let service: SetupAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(SetupAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
