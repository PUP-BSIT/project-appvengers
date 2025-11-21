import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AddSavingTransaction } from './add-saving-transaction';

describe('AddSavingTransaction', () => {
  let component: AddSavingTransaction;
  let fixture: ComponentFixture<AddSavingTransaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSavingTransaction],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } }
      ]
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
