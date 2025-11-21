import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSavingTransaction } from './add-saving-transaction';

describe('AddSavingTransaction', () => {
  let component: AddSavingTransaction;
  let fixture: ComponentFixture<AddSavingTransaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSavingTransaction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSavingTransaction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
