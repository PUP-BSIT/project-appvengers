import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupAccount } from './setup-account';

describe('SetupAccount', () => {
  let component: SetupAccount;
  let fixture: ComponentFixture<SetupAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
