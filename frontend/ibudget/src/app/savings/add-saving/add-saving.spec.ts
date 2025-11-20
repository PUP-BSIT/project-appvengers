import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AddSaving } from './add-saving';

describe('AddSaving', () => {
  let component: AddSaving;
  let fixture: ComponentFixture<AddSaving>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSaving],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSaving);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
