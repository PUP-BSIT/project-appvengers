import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AddSavingTransaction } from './add-saving-transaction';

describe('AddSavingTransaction', () => {
  let component: AddSavingTransaction;
  let fixture: ComponentFixture<AddSavingTransaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSavingTransaction],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        provideHttpClient(),
        provideHttpClientTesting()
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
