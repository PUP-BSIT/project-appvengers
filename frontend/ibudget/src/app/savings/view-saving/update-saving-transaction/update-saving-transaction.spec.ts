import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSavingTransaction } from './update-saving-transaction';

describe('UpdateSavingTransaction', () => {
  let component: UpdateSavingTransaction;
  let fixture: ComponentFixture<UpdateSavingTransaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSavingTransaction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSavingTransaction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
