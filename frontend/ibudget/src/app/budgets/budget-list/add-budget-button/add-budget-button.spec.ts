import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AddBudgetButton } from './add-budget-button';

describe('AddBudgetButton', () => {
  let fixture: ComponentFixture<AddBudgetButton>;
  let component: AddBudgetButton;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBudgetButton],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting() 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddBudgetButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
});
