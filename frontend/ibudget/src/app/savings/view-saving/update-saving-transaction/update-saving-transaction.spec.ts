import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UpdateSavingTransaction } from './update-saving-transaction';

describe('UpdateSavingTransaction', () => {
  let component: UpdateSavingTransaction;
  let fixture: ComponentFixture<UpdateSavingTransaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSavingTransaction],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        provideHttpClient(),
        provideHttpClientTesting()
      ] 
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
